const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// ========== CORS ==========
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://shohrux-market-shohrux-s-projects.vercel.app',
  'https://shohrux-market.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

// ========== POSTGRESQL - TUZATILGAN ==========
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,  // SSL ni vaqtincha o'chiramiz
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000,
  max: 10
});

// Ulanishni tekshirish va qayta urinish
let retryCount = 0;
const maxRetries = 5;

const connectWithRetry = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL ga muvaffaqiyatli ulandi!');
    
    // Tablitsalarni yaratish
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users tablitsasi tayyor');

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        items JSONB NOT NULL,
        total_amount BIGINT NOT NULL,
        address TEXT NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cash',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Orders tablitsasi tayyor');

    // Test user
    const testUser = await client.query('SELECT * FROM users WHERE email = $1', ['test@mail.com']);
    if (testUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await client.query(
        `INSERT INTO users (full_name, email, phone, password) VALUES ($1, $2, $3, $4)`,
        ['Test User', 'test@mail.com', '+998991234567', hashedPassword]
      );
      console.log('✅ Test user: test@mail.com / 123456');
    }

    client.release();
    console.log('🎉 Database tayyor!');
    retryCount = 0;
    
  } catch (err) {
    console.error('❌ Database ulanish xatosi:', err.message);
    
    if (retryCount < maxRetries) {
      retryCount++;
      console.log(`🔄 Qayta ulanish (${retryCount}/${maxRetries})...`);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('⚠️ Database ulanish imkonsiz. FILE-BASED storage ga otish...');
      useFileStorage = true;
    }
  }
};

// File-based storage (zaxira)
let useFileStorage = false;
const DATA_FILE = './data.json';
let users = [];
let nextId = 1;

const loadFileData = () => {
  try {
    const fs = require('fs');
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      users = data.users || [];
      nextId = data.nextId || users.length + 1;
      console.log(`📂 File-based: ${users.length} foydalanuvchi yuklandi`);
    } else {
      const salt = bcrypt.genSaltSync(10);
      users = [{
        id: 1,
        full_name: 'Test User',
        email: 'test@mail.com',
        phone: '+998991234567',
        password: bcrypt.hashSync('123456', salt),
        address: '',
        orders: [],
        createdAt: new Date().toISOString()
      }];
      nextId = 2;
      saveFileData();
      console.log('📝 Test user yaratildi: test@mail.com / 123456');
    }
  } catch (err) {
    console.error('File load xatosi:', err);
  }
};

const saveFileData = () => {
  try {
    const fs = require('fs');
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users, nextId }, null, 2));
  } catch (err) {
    console.error('File save xatosi:', err);
  }
};

// Database ulanishni boshlash
connectWithRetry();

const JWT_SECRET = process.env.JWT_SECRET || 'shohrux_market_secret_key_2026';

// ========== MIDDLEWARE ==========
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token topilmadi. Iltimos, kiring!' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token notogri yoki eskirgan!' });
  }
};

// ========== API ROUTES ==========
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: useFileStorage ? 'FILE-BASED' : 'PostgreSQL'
  });
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Barcha maydonlarni toldiring!' });
    }

    if (useFileStorage) {
      // File-based storage
      const existing = users.find(u => u.email === email || u.phone === phone);
      if (existing) {
        return res.status(400).json({ error: 'Foydalanuvchi mavjud!' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: nextId++,
        full_name,
        email,
        phone,
        password: hashedPassword,
        address: '',
        orders: [],
        createdAt: new Date().toISOString()
      };
      users.push(user);
      saveFileData();
      
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json({ success: true, user: userWithoutPassword, token });
    }
    
    // PostgreSQL storage
    const client = await pool.connect();
    try {
      const existing = await client.query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Foydalanuvchi mavjud!' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await client.query(
        `INSERT INTO users (full_name, email, phone, password) VALUES ($1, $2, $3, $4) 
         RETURNING id, full_name, email, phone, address`,
        [full_name, email, phone, hashedPassword]
      );

      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ success: true, user, token });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Register xatosi:', error);
    res.status(500).json({ error: 'Server xatosi!' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Email/Telefon va parolni kiriting!' });
    }

    if (useFileStorage) {
      const user = users.find(u => u.email === emailOrPhone || u.phone === emailOrPhone);
      if (!user) {
        return res.status(400).json({ error: 'Foydalanuvchi topilmadi!' });
      }
      
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ error: 'Parol notogri!' });
      }
      
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json({ success: true, user: userWithoutPassword, token });
    }
    
    // PostgreSQL
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1 OR phone = $1', [emailOrPhone]);
      const user = result.rows[0];
      
      if (!user) {
        return res.status(400).json({ error: 'Foydalanuvchi topilmadi!' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ error: 'Parol notogri!' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        success: true,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          address: user.address || ''
        },
        token
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login xatosi:', error);
    res.status(500).json({ error: 'Server xatosi!' });
  }
});

// GET ME
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    if (useFileStorage) {
      const user = users.find(u => u.id === req.userId);
      if (!user) {
        return res.status(404).json({ error: 'Foydalanuvchi topilmadi!' });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, full_name, email, phone, address, created_at FROM users WHERE id = $1',
        [req.userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Foydalanuvchi topilmadi!' });
      }
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi!' });
  }
});

// UPDATE PROFILE
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { full_name, email, phone, address } = req.body;
    
    if (useFileStorage) {
      const index = users.findIndex(u => u.id === req.userId);
      if (index === -1) {
        return res.status(404).json({ error: 'Foydalanuvchi topilmadi!' });
      }
      users[index] = { ...users[index], full_name, email, phone, address };
      saveFileData();
      return res.json({ success: true, user: { full_name, email, phone, address } });
    }
    
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE users SET full_name = $1, email = $2, phone = $3, address = $4 WHERE id = $5`,
        [full_name, email, phone, address || '', req.userId]
      );
      res.json({ success: true, message: 'Profil yangilandi!' });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Yangilashda xatolik!' });
  }
});

// CHANGE PASSWORD
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (useFileStorage) {
      const user = users.find(u => u.id === req.userId);
      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) {
        return res.status(400).json({ error: 'Eski parol notogri!' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
      saveFileData();
      return res.json({ success: true });
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT password FROM users WHERE id = $1', [req.userId]);
      const valid = await bcrypt.compare(oldPassword, result.rows[0].password);
      if (!valid) {
        return res.status(400).json({ error: 'Eski parol notogri!' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.userId]);
      res.json({ success: true, message: 'Parol ozgartirildi!' });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi!' });
  }
});

// ADD ORDER
app.post('/api/auth/orders', verifyToken, async (req, res) => {
  try {
    const { items, totalAmount, address, paymentDetails } = req.body;
    
    if (useFileStorage) {
      const userIndex = users.findIndex(u => u.id === req.userId);
      const order = {
        id: Date.now(),
        items,
        totalAmount,
        total: totalAmount,
        address,
        paymentMethod: paymentDetails?.method || 'cash',
        status: 'pending',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      users[userIndex].orders = [...(users[userIndex].orders || []), order];
      saveFileData();
      return res.json({ success: true, order });
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO orders (user_id, items, total_amount, address, payment_method) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.userId, JSON.stringify(items), totalAmount, address, paymentDetails?.method || 'cash']
      );
      res.json({ success: true, order: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Add order xatosi:', error);
    res.status(500).json({ error: 'Buyurtma berishda xatolik!' });
  }
});

// GET ORDERS
app.get('/api/auth/orders', verifyToken, async (req, res) => {
  try {
    if (useFileStorage) {
      const user = users.find(u => u.id === req.userId);
      return res.json(user?.orders || []);
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
        [req.userId]
      );
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Buyurtmalarni yuklashda xatolik!' });
  }
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Tizimdan chiqildi!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`
  ════════════════════════════════════════════
  ✅ SERVER ISHLAMOQDA!
  📡 PORT: ${PORT}
  🔗 API: http://localhost:${PORT}/api
  ════════════════════════════════════════════
  `);
});