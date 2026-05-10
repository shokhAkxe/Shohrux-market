const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// ========== ENG SODDA CORS (MUAMMOSIZ) ==========
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://shohrux-market-shohrux-s-projects.vercel.app',
    'https://shohrux-market.vercel.app'
  ],
  credentials: false,  // ← FALSE qilindi!
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// ========== FILE STORAGE ==========
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
    console.log('✅ Test user: test@mail.com / 123456');
  }
} catch (err) {
  console.error(err);
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users, nextId }, null, 2));
}

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey12345';

// ========== MIDDLEWARE ==========
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ========== ROUTES ==========

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
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
    saveData();
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      user: { id: user.id, full_name, email, phone },
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    
    const user = users.find(u => u.email === emailOrPhone || u.phone === emailOrPhone);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone },
      token 
    });
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
  const index = users.findIndex(u => u.id === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  
  users[index] = { ...users[index], ...req.body };
  saveData();
  
  const { password, ...rest } = users[index];
  res.json(rest);
});

// ADD ORDER
app.post('/api/auth/orders', verifyToken, (req, res) => {
  const index = users.findIndex(u => u.id === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  
  const order = {
    id: Date.now(),
    ...req.body,
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  users[index].orders = [...(users[index].orders || []), order];
  saveData();
  
  res.json({ success: true, order });
});

// GET ORDERS
app.get('/api/auth/orders', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  res.json(user?.orders || []);
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// HEALTH
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));