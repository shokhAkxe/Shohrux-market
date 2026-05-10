const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// ==================== CORS SOZLAMALARI ====================
// Bu qism frontend (Netlify) dan kelayotgan so'rovlarga ruxsat beradi
app.use(cors({
  origin: true, // Test jarayonida hamma joydan kelgan so'rovga ruxsat berish (Xavfsiz va aniq yo'l)
  credentials: true, // Cookie va Tokenlar o'tishi uchun shart
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(cookieParser());

// OPTIONS so'rovlari (preflight) uchun alohida javob qaytarish
app.options('*', cors());

const JWT_SECRET = process.env.JWT_SECRET || 'shohrux_market_2026';

// Cookie sozlamalari (Netlify va Render orasida ishlashi uchun)
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,      // Faqat HTTPS orqali (Renderda HTTPS bor)
  sameSite: 'none',  // Cross-site cookie almashish uchun shart
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 kunlik muddat
};

// ==================== AUTH MIDDLEWARE ====================
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Avtorizatsiyadan o\'ting' });
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Sessiya xatosi' });
  }
};

// ==================== ROUTES ====================

// 1. Profil ma'lumotlarini olish
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
      select: { id: true, full_name: true, email: true, phone: true, address: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Buyurtma berish
app.post('/api/auth/orders', verifyToken, async (req, res) => {
  try {
    const { items, totalAmount, address } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: "Savat bo'sh" });

    const newOrder = await prisma.order.create({
      data: {
        userId: Number(req.user.id),
        items,
        totalAmount: parseFloat(totalAmount),
        address: address || "Manzil ko'rsatilmagan",
        status: "pending"
      }
    });
    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { full_name, email, phone, password: hashedPassword }
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ success: true, user: { id: user.id, full_name: user.full_name } });
  } catch (err) {
    res.status(400).json({ error: "Email yoki telefon band bo'lishi mumkin" });
  }
});

// 4. Login
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

// 5. Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ success: true });
});

// Test uchun asosiy yo'nalish
app.get('/', (req, res) => {
  res.send('✅ Shohrux Market API ishlamoqda...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT}-portda yondi` ));