const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'shohrux_market_2026';

// ==================== AUTH MIDDLEWARE ====================
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Avtorizatsiyadan o\'ting (Token topilmadi)' });
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Sessiya muddati tugagan yoki xato token' });
  }
};

// ==================== USER ROUTES ====================

app.get('/api/auth/profile', verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.id) },
    select: { id: true, full_name: true, email: true, phone: true, address: true }
  });
  res.json(user);
});

app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { full_name, email, phone, address } = req.body;
    const updated = await prisma.user.update({
      where: { id: Number(req.user.id) },
      data: { full_name, email, phone, address }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ORDER ROUTES (BUYURTMA BERISH) ====================

// 1. Yangi buyurtma yaratish
app.post('/api/auth/orders', verifyToken, async (req, res) => {
  try {
    const { items, totalAmount, address } = req.body;

    // Xavfsizlik: Bo'sh buyurtma berishni oldini olish
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Savat bo'sh bo'lishi mumkin emas" });
    }

    const newOrder = await prisma.order.create({
      data: {
        userId: Number(req.user.id),
        items: items,
        totalAmount: parseFloat(totalAmount),
        address: address || "Manzil ko'rsatilmagan",
        status: "pending"
      }
    });

    res.status(201).json({ success: true, message: "Buyurtma qabul qilindi", order: newOrder });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "Buyurtma berishda xatolik: " + err.message });
  }
});

// 2. Foydalanuvchi buyurtmalar tarixini olish
app.get('/api/auth/orders', verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: Number(req.user.id) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== AUTH LOGIC ====================
app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { full_name, email, phone, password: hashedPassword }
  });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ success: true, user });
});

app.post('/api/auth/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Login yoki parol xato' });
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ success: true, user });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server: http://localhost:${PORT}`));