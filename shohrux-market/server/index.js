const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
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

// ========== POSTGRESQL POOL ==========
let pool = null;
let dbConnected = false;

// Database ulanish funksiyasi
async function connectDatabase() {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    
    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully!');
    client.release();
    dbConnected = true;
    
    // Create tables
    await createTables();
    
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    dbConnected = false;
    console.log('🔄 Retrying in 10 seconds...');
    setTimeout(connectDatabase, 10000);
  }
}

// Create tables
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
    console.log('✅ Users table ready');

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
    console.log('✅ Orders table ready');

    // Test user
    const testUser = await client.query('SELECT * FROM users WHERE email = $1', ['test@mail.com']);
    if (testUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await client.query(
        `INSERT INTO users (full_name, email, phone, password) 
         VALUES ($1, $2, $3, $4)`,
        ['Test User', 'test@mail.com', '+998991234567', hashedPassword]
      );
      console.log('✅ Test user created: test@mail.com / 123456');
    }

    console.log('🎉 Database ready!');
  } catch (err) {
    console.error('❌ Table creation error:', err.message);
  } finally {
    client.release();
  }
}

// Start database connection
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

// ========== HEALTH CHECKS ==========
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', time: new Date().toISOString() });
});

// ========== REGISTER ==========
app.post('/api/auth/register', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database is not connected. Please try again!' });
  }
  
  const client = await pool.connect();
  try {
    const { full_name, email, phone, password } = req.body;
    
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    // Check if user exists
    const existing = await client.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email or phone already exists!' });
    }

    // Create user
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
      message: 'Registration successful!',
      user, 
      token 
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error. Please try again!' });
  } finally {
    client.release();
  }
});

// ========== LOGIN ==========
app.post('/api/auth/login', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database is not connected. Please try again!' });
  }
  
  const client = await pool.connect();
  try {
    const { emailOrPhone, password } = req.body;
    
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required!' });
    }

    // Find user
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $1',
      [emailOrPhone]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ error: 'User not found!' });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid password!' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful!',
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error. Please try again!' });
  } finally {
    client.release();
  }
});

// ========== GET CURRENT USER ==========
app.get('/api/auth/me', verifyToken, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database is not connected!' });
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, full_name, email, phone, address, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found!' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error!' });
  } finally {
    client.release();
  }
});

// ========== UPDATE PROFILE ==========
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database is not connected!' });
  }
  
  const client = await pool.connect();
  try {
    const { full_name, email, phone, address } = req.body;
    
    await client.query(
      `UPDATE users 
       SET full_name = $1, email = $2, phone = $3, address = $4 
       WHERE id = $5`,
      [full_name, email, phone, address || '', req.userId]
    );
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully!'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Update failed!' });
  } finally {
    client.release();
  }
});

// ========== CHANGE PASSWORD ==========
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database is not connected!' });
  }
  
  const client = await pool.connect();
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Get current password
    const result = await client.query('SELECT password FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    
    // Verify old password
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Old password is incorrect!' });
    }
    
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.userId]);
    
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error!' });
  } finally {
    client.release();
  }
});

// ========== ADD ORDER ==========
app.post('/api/auth/orders', verifyToken, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database is not connected!' });
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
    
    console.log(`📦 New order! User: ${req.userId}, Total: ${totalAmount?.toLocaleString()} so'm`);
    
    res.json({ 
      success: true, 
      message: 'Order placed successfully!',
      order: result.rows[0] 
    });
  } catch (error) {
    console.error('Add order error:', error);
    res.status(500).json({ error: 'Failed to place order!' });
  } finally {
    client.release();
  }
});

// ========== GET ORDERS ==========
app.get('/api/auth/orders', verifyToken, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database is not connected!' });
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to load orders!' });
  } finally {
    client.release();
  }
});

// ========== LOGOUT ==========
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully!' });
});

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ═══════════════════════════════════════════════════
  ✅ SHOHRUX MARKET BACKEND IS RUNNING!
  📡 PORT: ${PORT}
  🗄️  DATABASE: PostgreSQL
  🔗 API: http://localhost:${PORT}/api
  🧪 TEST: http://localhost:${PORT}/api/health
  ═══════════════════════════════════════════════════
  `);
});