const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// ==================== CORS SOZLAMALARI (TO'G'RILANGAN) ====================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5000',
  'https://shohrux-market-shohrux-s-projects.vercel.app',
  'https://shohrux-market.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// MUHIM: credentials true bo'lganda, origin ANIQ bo'lishi kerak, function emas
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked CORS origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // credentials mode 'include' bilan ishlaydi
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],  // Cookie'ni frontendga ko'rsatish uchun
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// OPTIONS so'rovlariga to'g'ri javob berish
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  }
  res.sendStatus(204);
});

app.use(express.json());
app.use(cookieParser());

console.log("🚀 Server starting...");
console.log("📁 Using FILE-BASED storage (data.json)");

// ==================== FILE-BASED STORAGE ====================
const DATA_FILE = path.join(__dirname, 'data.json');
let users = [];
let nextId = 1;

try {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    users = data.users || [];
    nextId = data.nextId || users.length + 1;
    console.log(`📂 Loaded ${users.length} users from file`);
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
    console.log('📝 Created test user: test@mail.com / 123456');
  }
} catch (err) {
  console.error('Error loading data:', err);
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users, nextId }, null, 2));
    console.log(`💾 Saved ${users.length} users to file`);
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

// ==================== JWT ====================
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'myrefreshkey12345';

// ==================== MIDDLEWARE ====================
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    console.log("📝 Register request:", { full_name, email, phone });
    
    const existingUser = users.find(u => u.email === email || u.phone === phone);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
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
    saveData();
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
    
    // Cookie sozlamalari - cross-origin uchun
    res.cookie('token', token, { 
      httpOnly: true, 
      sameSite: 'none',  // Cross-origin uchun 'none' bo'lishi kerak
      secure: true,      // HTTPS da ishlashi uchun
      domain: '.onrender.com'  // Render subdomainlari uchun
    });
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      sameSite: 'none',
      secure: true,
      domain: '.onrender.com'
    });
    
    // CORS headers
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    res.json({ success: true, user: { id: user.id, full_name, email, phone }, token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

// LOGIN (xuddi shu tarzda CORS header qo'shiladi)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    console.log("🔐 Login request:", { emailOrPhone });
    
    const user = users.find(u => u.email === emailOrPhone || u.phone === emailOrPhone);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
    
    res.cookie('token', token, { 
      httpOnly: true, 
      sameSite: 'none',
      secure: true,
      domain: '.onrender.com'
    });
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      sameSite: 'none',
      secure: true,
      domain: '.onrender.com'
    });
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    res.json({ success: true, user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone }, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// QOLGAN ROUTES (GET, PUT, DELETE) - bir xil CORS header qo'shiladi
// Buning o'rniga middleware yozish mumkin:

// CORS header middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// GET CURRENT USER
app.get('/api/auth/me', verifyToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE PROFILE
app.put('/api/auth/profile', verifyToken, (req, res) => {
  try {
    const { full_name, email, phone, address } = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex] = { ...users[userIndex], full_name, email, phone, address };
    saveData();
    
    const { password, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CHANGE PASSWORD
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const validPassword = await bcrypt.compare(oldPassword, users[userIndex].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }
    
    const salt = await bcrypt.genSalt(10);
    users[userIndex].password = await bcrypt.hash(newPassword, salt);
    saveData();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD ORDER
app.post('/api/auth/orders', verifyToken, (req, res) => {
  try {
    const { items, total } = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const order = {
      id: Date.now(),
      items,
      total,
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    users[userIndex].orders = [...(users[userIndex].orders || []), order];
    saveData();
    
    console.log(`📦 YANGI BUYURTMA!`);
    console.log(`   👤 User: ${users[userIndex].email}`);
    console.log(`   💰 Jami: ${total.toLocaleString()} so'm`);
    console.log(`   📦 Mahsulotlar: ${items.length} ta`);
    
    res.json({ success: true, order });
  } catch (error) {
    console.error("Add order error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET ORDERS
app.get('/api/auth/orders', verifyToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.orders || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { path: '/', domain: '.onrender.com', sameSite: 'none', secure: true });
  res.clearCookie('refreshToken', { path: '/', domain: '.onrender.com', sameSite: 'none', secure: true });
  res.json({ success: true });
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// DEBUG
app.get('/api/users', (req, res) => {
  const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
  res.json(usersWithoutPassword);
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Data saved to: ${DATA_FILE}`);
  console.log(`👥 Users count: ${users.length}`);
  console.log(`🌐 CORS enabled for Vercel frontend`);
});