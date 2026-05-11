const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { OAuth2Client } = require('google-auth-library');
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

// ========== GOOGLE OAUTH2 ==========
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// ========== POSTGRESQL ==========
const pool = new Pool({
  host: 'dpg-d80381hj2pic73euqa8g-a.frankfurt-postgres.render.com',
  port: 5432,
  database: 'shohrux_market',
  user: 'shohrux_admin',
  password: 'SaW9BiujCzAFxqlgSVAPVjOChTpqEh5a',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

let dbConnected = false;

// ========== DATABASE TABLES ==========
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL ulandi!');
    dbConnected = true;

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        password VARCHAR(255) NOT NULL,
        address TEXT DEFAULT '',
        google_id VARCHAR(255) DEFAULT NULL,
        picture TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');

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
    console.log('✅ Orders table ready');

    const testUser = await client.query('SELECT * FROM users WHERE email = $1', ['test@mail.com']);
    if (testUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await client.query(
        `INSERT INTO users (full_name, email, phone, password, address) VALUES ($1, $2, $3, $4, $5)`,
        ['Test User', 'test@mail.com', '+998991234567', hashedPassword, 'Test manzil']
      );
      console.log('✅ Test user: test@mail.com / 123456');
    }

    console.log('🎉 DATABASE READY!');
  } catch (err) {
    console.error('DB init error:', err.message);
    dbConnected = false;
  } finally {
    client.release();
  }
}

initDatabase();

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

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), database: dbConnected ? 'connected' : 'disconnected' });
});

// ========== REGISTER ==========
app.post('/api/auth/register', async (req, res) => {
  if (!dbConnected) return res.status(503).json({ error: 'Database ulanmagan!' });
  
  const client = await pool.connect();
  try {
    const { full_name, email, phone, password } = req.body;
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Barcha maydonlarni toldiring!' });
    }

    const existing = await client.query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Bu email yoki telefon oldin royhatdan otgan!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (full_name, email, phone, password, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone, address`,
      [full_name, email, phone, hashedPassword, '']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, message: 'Royxatdan otish muvaffaqiyatli!', user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server xatosi!' });
  } finally {
    client.release();
  }
});

// ========== LOGIN ==========
app.post('/api/auth/login', async (req, res) => {
  if (!dbConnected) return res.status(503).json({ error: 'Database ulanmagan!' });
  
  const client = await pool.connect();
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Email/Telefon va parolni kiriting!' });
    }

    const result = await client.query('SELECT * FROM users WHERE email = $1 OR phone = $1', [emailOrPhone]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Foydalanuvchi topilmadi!' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Parol notogri!' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Kirish muvaffaqiyatli!',
      user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, address: user.address || '' },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server xatosi!' });
  } finally {
    client.release();
  }
});

// ========== GOOGLE LOGIN ==========
app.post('/api/auth/google', async (req, res) => {
  if (!dbConnected) return res.status(503).json({ error: 'Database ulanmagan!' });
  
  const client = await pool.connect();
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Google token topilmadi!' });
    }
    
    // Google token ni tekshirish
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    
    console.log('🔐 Google login:', { email, name });
    
    // Foydalanuvchi mavjudligini tekshirish
    let result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];
    
    if (!user) {
      // Yangi foydalanuvchi yaratish
      const randomPassword = await bcrypt.hash(googleId + Date.now(), 10);
      const insertResult = await client.query(
        `INSERT INTO users (full_name, email, phone, password, address, google_id, picture) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, full_name, email, phone, address, picture`,
        [name || email.split('@')[0], email, '', randomPassword, '', googleId, picture || '']
      );
      user = insertResult.rows[0];
      console.log('✅ New Google user created:', email);
    } else if (!user.google_id) {
      // Mavjud foydalanuvchiga google_id qo'shish
      await client.query('UPDATE users SET google_id = $1, picture = $2 WHERE id = $3', [googleId, picture || '', user.id]);
      user.google_id = googleId;
      user.picture = picture;
      console.log('✅ Google ID added to existing user:', email);
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      message: 'Google orqali kirish muvaffaqiyatli!',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        picture: user.picture || null
      },
      token
    });
    
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google orqali kirishda xatolik yuz berdi!' });
  } finally {
    client.release();
  }
});

// ========== GET PROFILE ==========
app.get('/api/auth/me', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, full_name, email, phone, address, picture, created_at FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Foydalanuvchi topilmadi!' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi!' });
  } finally {
    client.release();
  }
});

// ========== UPDATE PROFILE ==========
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { full_name, email, phone, address } = req.body;
    
    const current = await client.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Foydalanuvchi topilmadi!' });
    
    const cur = current.rows[0];
    
    if (email && email !== cur.email) {
      const exists = await client.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, req.userId]);
      if (exists.rows.length > 0) return res.status(400).json({ error: 'Bu email boshqa foydalanuvchida mavjud!' });
    }
    
    if (phone && phone !== cur.phone) {
      const exists = await client.query('SELECT * FROM users WHERE phone = $1 AND id != $2', [phone, req.userId]);
      if (exists.rows.length > 0) return res.status(400).json({ error: 'Bu telefon boshqa foydalanuvchida mavjud!' });
    }
    
    const newFullName = full_name || cur.full_name;
    const newEmail = email || cur.email;
    const newPhone = phone || cur.phone;
    const newAddress = address !== undefined ? address : cur.address;
    
    await client.query('UPDATE users SET full_name = $1, email = $2, phone = $3, address = $4 WHERE id = $5',
      [newFullName, newEmail, newPhone, newAddress, req.userId]);
    
    const updated = await client.query('SELECT id, full_name, email, phone, address, picture, created_at FROM users WHERE id = $1', [req.userId]);
    res.json({ success: true, message: 'Profil yangilandi!', user: updated.rows[0] });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Yangilashda xatolik!' });
  } finally {
    client.release();
  }
});

// ========== CHANGE PASSWORD ==========
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Eski va yangi parolni kiriting!' });
    
    const result = await client.query('SELECT password FROM users WHERE id = $1', [req.userId]);
    const valid = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!valid) return res.status(400).json({ error: 'Eski parol notogri!' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.userId]);
    res.json({ success: true, message: 'Parol ozgartirildi!' });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi!' });
  } finally {
    client.release();
  }
});

// ========== ADD ORDER ==========
app.post('/api/auth/orders', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, totalAmount, address, paymentMethod } = req.body;
    if (!items || !totalAmount) return res.status(400).json({ error: 'Buyurtma malumotlari toldirilmagan!' });
    
    const result = await client.query(
      `INSERT INTO orders (user_id, items, total_amount, address, payment_method, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, JSON.stringify(items), totalAmount, address || '', paymentMethod || 'cash', 'pending']
    );
    console.log(`📦 New order! User: ${req.userId}, Total: ${totalAmount?.toLocaleString()} so'm`);
    res.json({ success: true, message: 'Buyurtma qabul qilindi!', order: result.rows[0] });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: 'Buyurtma berishda xatolik!' });
  } finally {
    client.release();
  }
});

// ========== GET ORDERS ==========
app.get('/api/auth/orders', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Buyurtmalarni yuklashda xatolik!' });
  } finally {
    client.release();
  }
});

// ========== LOGOUT ==========
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Tizimdan chiqildi!' });
});

// ========== 404 HANDLER ==========
app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ========== START SERVER ==========
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