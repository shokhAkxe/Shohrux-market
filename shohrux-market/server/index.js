const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// 1. CORS sozlamasi (Hamma domenlar uchun ochiq)
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

// Preflight so'rovlariga ruxsat
app.options('*', cors());

const JWT_SECRET = process.env.JWT_SECRET || 'shohrux_market_2026';

// Middleware: Tokenni tekshirish (Profil va Buyurtmalar uchun kerak)
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token noto'g'ri yoki muddati o'tgan" });
    req.userId = decoded.id;
    next();
  });
};

// ==================== AUTH YO'NALISHLARI ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { full_name, email, phone, password: hashedPassword }
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(201).json({ success: true, token, user: { id: user.id, full_name: user.full_name } });
  } catch (err) {
    res.status(400).json({ error: "Email yoki telefon band bo'lishi mumkin" });
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
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ success: true, token, user: { id: user.id, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profilni olish
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, full_name: true, email: true, phone: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Profilni yuklab bo'lmadi" });
  }
});

// Profilni yangilash (Siz so'ragan PUT so'rovi)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, email, phone } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { full_name, email, phone }
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: "Yangilashda xatolik yuz berdi" });
  }
});

// ==================== BUYURTMALAR YO'NALISHLARI ====================

// Buyurtma qo'shish
app.post('/api/auth/orders', authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount, address } = req.body;
    const order = await prisma.order.create({
      data: {
        userId: req.userId,
        items: JSON.stringify(items),
        totalAmount,
        address,
        status: 'PENDING'
      }
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: "Buyurtma saqlanmadi: " + err.message });
  }
});

// Foydalanuvchi buyurtmalarini olish
app.get('/api/auth/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Buyurtmalarni olib bo'lmadi" });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ success: true });
});

app.get('/', (req, res) => res.send('🚀 Shohrux Market API ishlamoqda!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server ${PORT}-portda yondi`));