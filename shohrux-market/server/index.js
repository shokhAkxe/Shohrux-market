const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// JWT
const JWT_SECRET = process.env.JWT_SECRET || 'shohrux_market_secret_key_2026';

// Google OAuth
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

// PostgreSQL
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

// Init DB
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

// Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token topilmadi' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: 'Token notogri' });
  }
};

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), database: dbConnected ? 'connected' : 'disconnected' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { full_name, email, phone, password } = req.body;
    if (!full_name || !email || !phone || !password) return res.status(400).json({ error: 'Barcha maydonlarni toldiring' });

    const existing = await client.query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (full_name, email, phone, password, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone, address`,
      [full_name, email, phone, hashedPassword, '']
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user, token });
  } finally { client.release(); }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const client = await pool.connect();
  try {
    const { emailOrPhone, password } = req.body;
    const result = await client.query('SELECT * FROM users WHERE email = $1 OR phone = $1', [emailOrPhone]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ error: 'Wrong password' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, address: user.address }, token });
  } finally { client.release(); }
});

// GOOGLE LOGIN - MUHIM QISM!
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google token topilmadi' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name, picture, sub: googleId } = ticket.getPayload();

    const client = await pool.connect();
    let result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      const randomPassword = await bcrypt.hash(googleId + Date.now(), 10);
      result = await client.query(
        `INSERT INTO users (full_name, email, phone, password, address, google_id, picture) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, full_name, email, phone, address, picture`,
        [name || email.split('@')[0], email, '', randomPassword, '', googleId, picture || '']
      );
      user = result.rows[0];
    } else if (!user.google_id) {
      await client.query('UPDATE users SET google_id = $1, picture = $2 WHERE id = $3', [googleId, picture || '', user.id]);
      user.google_id = googleId;
      user.picture = picture;
    }
    client.release();

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, address: user.address, picture: user.picture }, token });
  } catch (err) {
    console.error('Google login error:', err.message);
    res.status(500).json({ error: 'Google orqali kirishda xatolik: ' + err.message });
  }
});

// Profile
app.get('/api/auth/me', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, full_name, email, phone, address, picture FROM users WHERE id = $1', [req.userId]);
    res.json(result.rows[0]);
  } finally { client.release(); }
});

app.put('/api/auth/profile', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { full_name, email, phone, address } = req.body;
    await client.query('UPDATE users SET full_name = $1, email = $2, phone = $3, address = $4 WHERE id = $5',
      [full_name, email, phone, address, req.userId]);
    res.json({ success: true });
  } finally { client.release(); }
});

app.put('/api/auth/change-password', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await client.query('SELECT password FROM users WHERE id = $1', [req.userId]);
    if (!await bcrypt.compare(oldPassword, result.rows[0].password)) return res.status(400).json({ error: 'Old password incorrect' });
    await client.query('UPDATE users SET password = $1 WHERE id = $2', [await bcrypt.hash(newPassword, 10), req.userId]);
    res.json({ success: true });
  } finally { client.release(); }
});

app.post('/api/auth/orders', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, totalAmount, address, paymentMethod } = req.body;
    const result = await client.query(
      `INSERT INTO orders (user_id, items, total_amount, address, payment_method) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, JSON.stringify(items), totalAmount, address, paymentMethod || 'cash']
    );
    res.json({ success: true, order: result.rows[0] });
  } finally { client.release(); }
});

app.get('/api/auth/orders', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
    res.json(result.rows);
  } finally { client.release(); }
});

app.post('/api/auth/logout', (req, res) => res.json({ success: true }));

app.use('*', (req, res) => res.status(404).json({ error: `Route ${req.originalUrl} not found` }));

app.listen(PORT, '0.0.0.0', () => console.log(`✅ Backend running on port ${PORT}`));