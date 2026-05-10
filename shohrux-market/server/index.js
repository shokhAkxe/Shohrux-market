const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// ========== CORS SOZLAMALARI ==========
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://shohrux-market-shohrux-s-projects.vercel.app',
  'https://shohrux-market.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked CORS origin:', origin);
      callback(null, true);
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());
app.use(express.json());
app.use(cookieParser());

console.log("🚀 Server starting...");
console.log("📁 Using FILE-BASED storage (data.json)");

// ========== FILE STORAGE ==========
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

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey12345';

// ========== MIDDLEWARE ==========
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
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

// ========== AUTH ROUTES ==========

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
    
    res.json({ success: true, user: { id: user.id, full_name, email, phone }, token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
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
    
    res.json({ success: true, user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone }, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
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
    const { items, totalAmount, address, paymentDetails } = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const order = {
      id: Date.now(),
      items: items || [],
      totalAmount: totalAmount || items?.reduce((sum, item) => sum + (item.narxi * (item.quantity || 1)), 0),
      total: totalAmount || items?.reduce((sum, item) => sum + (item.narxi * (item.quantity || 1)), 0),
      address: address || '',
      paymentDetails: paymentDetails || {},
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    users[userIndex].orders = [...(users[userIndex].orders || []), order];
    saveData();
    
    console.log(`📦 YANGI BUYURTMA!`);
    console.log(`   👤 User: ${users[userIndex].email}`);
    console.log(`   💰 Jami: ${order.totalAmount.toLocaleString()} so'm`);
    console.log(`   📦 Mahsulotlar: ${order.items.length} ta`);
    
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Data saved to: ${DATA_FILE}`);
  console.log(`👥 Users count: ${users.length}`);
});