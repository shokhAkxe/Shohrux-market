const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// ==================== SODDA CORS (ISHLASHI KERAK) ====================
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://shohrux-market-git-main-shohrux-s-projects.vercel.app',
    'https://shohrux-market.vercel.app',
    'https://shohrux-market-shohrux-s-projects.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

// ==================== FILE-BASED STORAGE ====================
const DATA_FILE = path.join(__dirname, 'data.json');
let users = [];
let nextId = 1;

try {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    users = data.users || [];
    nextId = data.nextId || users.length + 1;
    console.log(`📂 Loaded ${users.length} users`);
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
    saveData();
    console.log('📝 Test user: test@mail.com / 123456');
  }
} catch (err) {
  console.error(err);
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users, nextId }, null, 2));
}

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey12345';

// ==================== MIDDLEWARE ====================
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== ROUTES ====================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    console.log("Register:", email);
    
    if (users.find(u => u.email === email || u.phone === phone)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const user = {
      id: nextId++,
      full_name,
      email,
      phone,
      password: await bcrypt.hash(password, salt),
      address: '',
      orders: [],
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveData();
    
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ success: true, user: { id: user.id, full_name, email, phone }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    console.log("Login:", emailOrPhone);
    
    const user = users.find(u => u.email === emailOrPhone || u.phone === emailOrPhone);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    if (!await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ success: true, user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ME
app.get('/api/auth/me', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...rest } = user;
  res.json(rest);
});

// UPDATE PROFILE
app.put('/api/auth/profile', verifyToken, (req, res) => {
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  
  users[idx] = { ...users[idx], ...req.body };
  saveData();
  const { password, ...rest } = users[idx];
  res.json(rest);
});

// ADD ORDER
app.post('/api/auth/orders', verifyToken, (req, res) => {
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  
  const order = {
    id: Date.now(),
    items: req.body.items,
    total: req.body.total,
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  users[idx].orders = [...(users[idx].orders || []), order];
  saveData();
  console.log(`📦 Order: ${users[idx].email}, Total: ${req.body.total}`);
  res.json({ success: true, order });
});

// GET ORDERS
app.get('/api/auth/orders', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  res.json(user?.orders || []);
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// HEALTH
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Data: ${DATA_FILE}`);
  console.log(`👥 Users: ${users.length}`);
});