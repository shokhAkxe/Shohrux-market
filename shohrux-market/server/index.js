const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// ==================== 1. CORS SOZLAMALARI (MUKAMMAL) ====================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://marketshox.netlify.app' // Aniq linkni yozish xavfsizroq
  ],
  credentials: true, // Cookie va avtorizatsiya uchun SHART
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

// Preflight so'rovlariga barcha yo'nalishlar bo'yicha ruxsat berish
app.options('*', cors());

const JWT_SECRET = process.env.JWT_SECRET || 'shohrux_market_2026';

// ==================== 2. COOKIE SOZLAMALARI (MUHIM) ====================
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,      // Render HTTPS ishlatgani uchun shart
  sameSite: 'none',  // Netlify va Render orasida ishlashi uchun shart
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 kun
};

// ==================== 3. AUTH MIDDLEWARE ====================
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Avtorizatsiyadan o\'ting' });
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Sessiya muddati tugagan' });
  }
};

// ==================== 4. YO'NALISHLAR (ROUTES) ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    
    // Foydalanuvchi borligini tekshirish
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    if (existingUser) return res.status(400).json({ error: "Email yoki telefon band" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { full_name, email, phone, password: hashedPassword }
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ success: true, user: { id: user.id, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: "Serverda xatolik: " + err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
    });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Login yoki parol xato' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ success: true, user: { id: user.id, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ success: true });
});

// Profil va Buyurtmalar (MiddleWare bilan)
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.id) },
    select: { id: true, full_name: true, email: true, phone: true, address: true }
  });
  res.json(user);
});

// Test linki
app.get('/', (req, res) => res.send('🚀 Shohrux Market API tayyor!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server ${PORT}-portda ishlamoqda`));