const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// ==================== 1. CORS VA PREFLIGHT JAVOBI ====================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://marketshox.netlify.app',
    'https://marketshox.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

// OPTIONS so'rovlariga (Preflight) aniq 200 OK javobini qaytarish
app.options('*', cors());

const JWT_SECRET = process.env.JWT_SECRET || 'shohrux_market_2026';

// ==================== 2. COOKIE SOZLAMALARI ====================
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,      // HTTPS (Render/Netlify uchun shart)
  sameSite: 'none',  // Turli domenlar orasida ishlash uchun shart
  maxAge: 7 * 24 * 60 * 60 * 1000 
};

// ==================== 3. YO'NALISHLAR (ROUTES) ====================
// DIQQAT: Frontend'dagi axios /api/auth/... deb so'rov yuboradi

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { full_name, email, phone, password: hashedPassword }
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ success: true, token, user: { id: user.id, full_name: user.full_name } });
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
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ success: true, token, user: { id: user.id, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profil (verifyToken o'rniga oddiyroq tekshiruv)
app.get('/api/auth/profile', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Avtorizatsiya yo\'q' });

    const verified = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: Number(verified.id) },
      select: { id: true, full_name: true, email: true, phone: true }
    });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Sessiya muddati tugagan' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ success: true });
});

// Asosiy sahifa testi
app.get('/', (req, res) => res.send('🚀 Backend is live!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server is on port ${PORT}`));