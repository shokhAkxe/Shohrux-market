const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========== CORS ==========
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ========== JWT SECRET ==========
const JWT_SECRET = process.env.JWT_SECRET || 'shohrux_market_secret_key_2026';

// ========== POSTGRESQL ULanish (SSL bilan, sertifikat tekshiruvi o'chirilgan) ==========
let pool = null;
let dbConnected = false;

async function connectDatabase() {
  try {
    console.log('📡 PostgreSQL ga ulanish...');
    
    // Render internal connection - host, port, database, user, password bilan
    pool = new Pool({
      host: 'dpg-d80381hj2pic73euqa8g-a.frankfurt-postgres.render.com',
      port: 5432,
      database: 'shohrux_market',
      user: 'shohrux_admin',
      password: 'SaW9BiujCzAFxqlgSVAPVjOChTpqEh5a',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL ulandi!', result.rows[0].now);
    client.release();
    dbConnected = true;
    
    await createTables();
    
  } catch (err) {
    console.error('❌ PostgreSQL ulanish xatosi:', err.message);
    dbConnected = false;
    console.log('🔄 10 soniyadan keyin qayta uriniladi...');
    setTimeout(connectDatabase, 10000);
  }
}

async function createTables() {
  const client = await pool.connect();
  try {
    // Users table
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

    // Orders table
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
      console.log('✅ Test user yaratildi: test@mail.com / 123456');
    } else {
      console.log('✅ Test user mavjud: test@mail.com / 123456');
    }

    console.log('🎉 DATABASE TAYYOR!');
  } catch (err) {
    console.error('❌ Tablitsa yaratish xatosi:', err.message);
  } finally {
    client.release();
  }
}

// Database ulanishni boshlash
connectDatabase();

// ========== MIDDLEWARE ==========
const verifyToken = async (req, res, next) => {
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

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    message: 'Server ishlayapti!'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', time: new Date().toISOString() });
});

// ========== REGISTER ==========
app.post('/api/auth/register', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database ulanmagan. Keyinroq urinib koring!' });
  }
  
  const client = await pool.connect();
  try {
    const { full_name, email, phone, password } = req.body;
    
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Barcha maydonlarni toldiring!' });
    }

    const existing = await client.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Bu email yoki telefon oldin royhatdan otgan!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (full_name, email, phone, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, full_name, email, phone, address`,
      [full_name, email, phone, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      success: true, 
      message: 'Royxatdan otish muvaffaqiyatli!',
      user, 
      token 
    });
    
  } catch (error) {
    console.error('Register xatosi:', error);
    res.status(500).json({ error: 'Server xatosi. Keyinroq urinib koring!' });
  } finally {
    client.release();
  }
});

// ========== LOGIN ==========
app.post('/api/auth/login', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database ulanmagan. Keyinroq urinib koring!' });
  }
  
  const client = await pool.connect();
  try {
    const { emailOrPhone, password } = req.body;
    
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Email/Telefon va parolni kiriting!' });
    }

    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $1',
      [emailOrPhone]
    );

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
      message: 'Kirish muvaffaqiyatli!',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address || ''
      },
      token
    });
    
  } catch (error) {
    console.error('Login xatosi:', error);
    res.status(500).json({ error: 'Server xatosi. Keyinroq urinib koring!' });
  } finally {
    client.release();
  }
});

// ========== GET CURRENT USER ==========
app.get('/api/auth/me', verifyToken, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database ulanmagan!' });
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
  } catch (error) {
    console.error('Get user xatosi:', error);
    res.status(500).json({ error: 'Server xatosi!' });
  } finally {
    client.release();
  }
});

// ========== UPDATE PROFILE ==========
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database ulanmagan!' });
  }
  
  const client = await pool.connect();
  try {
    const { full_name, email, phone, address } = req.body;
    
    await client.query(
      `UPDATE users SET full_name = $1, email = $2, phone = $3, address = $4 WHERE id = $5`,
      [full_name, email, phone, address || '', req.userId]
    );
    
    res.json({ success: true, message: 'Profil yangilandi!' });
  } catch (error) {
    console.error('Update profile xatosi:', error);
    res.status(500).json({ error: 'Yangilashda xatolik!' });
  } finally {
    client.release();
  }
});

// ========== CHANGE PASSWORD ==========
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database ulanmagan!' });
  }
  
  const client = await pool.connect();
  try {
    const { oldPassword, newPassword } = req.body;
    
    const result = await client.query('SELECT password FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Eski parol notogri!' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.userId]);
    
    res.json({ success: true, message: 'Parol ozgartirildi!' });
  } catch (error) {
    console.error('Change password xatosi:', error);
    res.status(500).json({ error: 'Server xatosi!' });
  } finally {
    client.release();
  }
});

// ========== ADD ORDER ==========
app.post('/api/auth/orders', verifyToken, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database ulanmagan!' });
  }
  
  const client = await pool.connect();
  try {
    const { items, totalAmount, address, paymentDetails } = req.body;
    
    const result = await client.query(
      `INSERT INTO orders (user_id, items, total_amount, address, payment_method) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [req.userId, JSON.stringify(items), totalAmount, address, paymentDetails?.method || 'cash']
    );
    
    console.log(`📦 Yangi buyurtma! User: ${req.userId}, Jami: ${totalAmount?.toLocaleString()} som`);
    
    res.json({ success: true, message: 'Buyurtma qabul qilindi!', order: result.rows[0] });
  } catch (error) {
    console.error('Add order xatosi:', error);
    res.status(500).json({ error: 'Buyurtma berishda xatolik!' });
  } finally {
    client.release();
  }
});

// ========== GET ORDERS ==========
app.get('/api/auth/orders', verifyToken, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database ulanmagan!' });
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders xatosi:', error);
    res.status(500).json({ error: 'Buyurtmalarni yuklashda xatolik!' });
  } finally {
    client.release();
  }
});

// ========== LOGOUT ==========
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Tizimdan chiqildi!' });
});

// ========== SERVER START ==========
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ═══════════════════════════════════════════════════
  ✅ SHOHRUX MARKET BACKEND ISHLAMOQDA!
  📡 PORT: ${PORT}
  🗄️  DATABASE: PostgreSQL
  🔗 API: http://localhost:${PORT}/api
  🧪 TEST: http://localhost:${PORT}/api/health
  ═══════════════════════════════════════════════════
  `);
});