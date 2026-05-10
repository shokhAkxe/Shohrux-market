const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// ========== CORS ==========
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://shohrux-market-shohrux-s-projects.vercel.app',
    'https://shohrux-market.vercel.app'
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

// ========== POSTGRESQL CONNECTION ==========
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

// ========== CREATE TABLES ==========
const initDB = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ PostgreSQL connected');
    
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
    console.log('✅ Users table ready');

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        items JSONB NOT NULL,
        total_amount BIGINT NOT NULL,
        address TEXT NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Orders table ready');

    // Test user (agar mavjud bo'lmasa)
    const testUser = await client.query('SELECT * FROM users WHERE email = $1', ['test@mail.com']);
    if (testUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await client.query(
        'INSERT INTO users (full_name, email, phone, password) VALUES ($1, $2, $3, $4)',
        ['Test User', 'test@mail.com', '+998991234567', hashedPassword]
      );
      console.log('✅ Test user created: test@mail.com / 123456');
    } else {
      console.log('✅ Test user already exists');
    }

    console.log('🎉 Database initialization complete!');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
    if (err.message.includes('ECONNRESET')) {
      console.error('   ⚠️ Connection reset - retrying in 5 seconds...');
      setTimeout(initDB, 5000);
    }
  } finally {
    if (client) client.release();
  }
};

// Start database connection
initDB();

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey12345';

// ========== MIDDLEWARE ==========
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ========== ROUTES ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  let client;
  try {
    const { full_name, email, phone, password } = req.body;
    console.log("📝 Register:", email);

    client = await pool.connect();
    
    const existing = await client.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      'INSERT INTO users (full_name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, phone, address',
      [full_name, email, phone, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  let client;
  try {
    const { emailOrPhone, password } = req.body;
    console.log("🔐 Login:", emailOrPhone);

    client = await pool.connect();
    
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $1',
      [emailOrPhone]
    );

    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, address: user.address },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
});

// GET ME
app.get('/api/auth/me', verifyToken, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT id, full_name, email, phone, address, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
});

// ADD ORDER
app.post('/api/auth/orders', verifyToken, async (req, res) => {
  let client;
  try {
    const { items, totalAmount, address, paymentDetails } = req.body;
    
    client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO orders (user_id, items, total_amount, address, payment_method) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, JSON.stringify(items), totalAmount, address, paymentDetails?.method || 'cash']
    );
    
    console.log(`📦 New order from user ${req.userId}: ${totalAmount?.toLocaleString()} so'm`);
    
    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error('Add order error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
});

// GET ORDERS
app.get('/api/auth/orders', verifyToken, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
});

// UPDATE PROFILE
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  let client;
  try {
    const { full_name, email, phone, address } = req.body;
    client = await pool.connect();
    await client.query(
      'UPDATE users SET full_name = $1, email = $2, phone = $3, address = $4 WHERE id = $5',
      [full_name, email, phone, address, req.userId]
    );
    res.json({ success: true, full_name, email, phone, address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
});

// CHANGE PASSWORD
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
  let client;
  try {
    const { oldPassword, newPassword } = req.body;
    client = await pool.connect();
    
    const result = await client.query('SELECT password FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Old password is incorrect' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.userId]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});