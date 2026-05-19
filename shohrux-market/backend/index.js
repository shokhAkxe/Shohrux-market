const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shohrux_market_secret_key_2026';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ========== 1. MIDDLEWARE ==========
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
app.use('/uploads', express.static('uploads'));

// ========== 2. MULTER ==========
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'prod-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ========== 3. TELEGRAM HELPER ==========
const sendTelegram = async (text) => {
    if (!BOT_TOKEN || !CHAT_ID) return;
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' })
        });
    } catch (e) {
        console.error('Telegram xatosi:', e.message);
    }
};

// ========== 4. JWT MIDDLEWARE ==========
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token topilmadi' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(401).json({ error: 'Token yaroqsiz' });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Admin huquqi talab etiladi' });
    }
    next();
};

// ========== 5. AUTH API ==========

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { full_name, email, phone, password, login } = req.body;
        if (!full_name || !email || !password)
            return res.status(400).json({ error: 'Ism, email va parol majburiy' });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: "Bu email allaqachon ro'yxatdan o'tgan" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                full_name, email,
                login: login || email,
                phone: phone || null,
                password: hashed,
                role: email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER',
            }
        });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...u } = user;
        res.json({ success: true, user: u, token });
    } catch (e) {
        res.status(500).json({ error: "Ro'yxatdan o'tishda xatolik" });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;
        if (!emailOrPhone || !password)
            return res.status(400).json({ error: 'Login va parol majburiy' });

        const user = await prisma.user.findFirst({
            where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }, { login: emailOrPhone }] }
        });
        if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
        if (!user.password) return res.status(401).json({ error: 'Google orqali kiring' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Parol noto'g'ri" });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...u } = user;
        res.json({ success: true, user: u, token });
    } catch (e) {
        res.status(500).json({ error: 'Kirishda xatolik' });
    }
});

// GOOGLE LOGIN
app.post('/api/auth/google', async (req, res) => {
    const token = req.body.token || req.body.credential;
    if (!token) return res.status(400).json({ error: 'Token topilmadi' });
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, picture } = ticket.getPayload();
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email, full_name: name, picture: picture || '',
                    role: email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER',
                    password: ''
                }
            });
        }
        const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...u } = user;
        res.json({ success: true, user: u, token: accessToken });
    } catch (e) {
        console.error('Google Auth xatosi:', e.message);
        res.status(400).json({ error: 'Avtorizatsiya muvaffaqiyatsiz' });
    }
});

// GET ME
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, full_name: true, email: true, phone: true, address: true, role: true, picture: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: "Ma'lumot olishda xatolik" });
    }
});

// UPDATE PROFILE
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { full_name, phone, address } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(full_name && { full_name }),
                ...(phone !== undefined && { phone }),
                ...(address !== undefined && { address }),
            },
            select: { id: true, full_name: true, email: true, phone: true, address: true, role: true, picture: true, createdAt: true }
        });
        res.json({ success: true, user });
    } catch (e) {
        res.status(500).json({ error: 'Profilni yangilashda xatolik' });
    }
});

// CHANGE PASSWORD
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user.password) {
            const valid = await bcrypt.compare(oldPassword, user.password);
            if (!valid) return res.status(400).json({ error: "Eski parol noto'g'ri" });
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Parol o'zgartirishda xatolik" });
    }
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => res.json({ success: true }));

// ========== 6. ORDERS API ==========

// Buyurtma berish (Foydalanuvchi)
app.post('/api/auth/orders', authenticateToken, async (req, res) => {
    try {
        const { items, totalAmount, address, paymentDetails, customerInfo } = req.body;

        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                items,
                totalAmount: parseFloat(totalAmount),
                address,
                paymentMethod: paymentDetails?.method || 'cash',
                paymentMonths: paymentDetails?.months || null,
                status: 'pending'
            },
            include: { user: { select: { full_name: true, email: true, phone: true } } }
        });

        // Telegram ga xabar yuborish
        const date = new Date().toLocaleString('uz-UZ');
        let msg = `🛍 *YANGI BUYURTMA #${order.id}!*\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `📅 *Vaqt:* ${date}\n\n`;
        msg += `👤 *Mijoz:* ${order.user.full_name}\n`;
        msg += `📞 *Tel:* ${order.user.phone || customerInfo?.phone || 'Kiritilmagan'}\n`;
        msg += `📍 *Manzil:* ${address}\n`;
        msg += `💳 *To'lov:* ${paymentDetails?.method === 'cash' ? 'Naqd' : paymentDetails?.method === 'card' ? 'Karta' : `Bo'lib to'lash (${paymentDetails?.months} oy)`}\n\n`;
        msg += `📦 *Mahsulotlar:*\n`;
        items.forEach((item, i) => {
            msg += `${i + 1}. ${item.nomi?.uz || item.name} x${item.quantity || 1} = ${((item.narxi || item.price) * (item.quantity || 1)).toLocaleString()} so'm\n`;
        });
        msg += `\n💰 *JAMI:* ${parseFloat(totalAmount).toLocaleString()} so'm\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━\n✅ *Buyurtma qabul qilindi!*`;

        await sendTelegram(msg);

        res.json({ success: true, order });
    } catch (e) {
        console.error('Order error:', e);
        res.status(500).json({ error: 'Buyurtma berishda xatolik' });
    }
});

// Foydalanuvchi buyurtmalari
app.get('/api/auth/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: 'Buyurtmalarni yuklashda xatolik' });
    }
});

// Foydalanuvchi buyurtmasini bekor qilish
app.put('/api/auth/orders/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const order = await prisma.order.findFirst({
            where: { id: parseInt(req.params.id), userId: req.user.id }
        });
        if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });
        if (order.status !== 'pending') return res.status(400).json({ error: 'Faqat kutilayotgan buyurtmalarni bekor qilish mumkin' });
        
        const updated = await prisma.order.update({
            where: { id: parseInt(req.params.id) },
            data: { status: 'cancelled' },
            include: { user: { select: { full_name: true, phone: true } } }
        });

        // Telegram ga xabar
        let msg = `📋 *BUYURTMA BEKOR QILINDI #${order.id}*\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `👤 *Mijoz:* ${updated.user.full_name}\n`;
        msg += `📞 *Tel:* ${updated.user.phone || 'Kiritilmagan'}\n`;
        msg += `💰 *Summa:* ${updated.totalAmount.toLocaleString()} so'm\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━`;
        await sendTelegram(msg);

        res.json({ success: true, order: updated });
    } catch (e) {
        res.status(500).json({ error: 'Bekor qilishda xatolik' });
    }
});

// Foydalanuvchi buyurtmasini o'chirish
app.delete('/api/auth/orders/:id', authenticateToken, async (req, res) => {
    try {
        const order = await prisma.order.findFirst({
            where: { id: parseInt(req.params.id), userId: req.user.id }
        });
        if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });
        
        await prisma.order.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "O'chirishda xatolik" });
    }
});

// Hisobni o'chirish (barcha buyurtmalar bilan birga)
app.delete('/api/auth/account', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Transaction orqali avval barcha buyurtmalarni o'chirish, keyin foydalanuvchini
        await prisma.$transaction(async (tx) => {
            // Avval barcha buyurtmalarni o'chirish
            await tx.order.deleteMany({ where: { userId } });
            
            // Keyin foydalanuvchini o'chirish
            await tx.user.delete({ where: { id: userId } });
        });
        
        res.json({ success: true });
    } catch (e) {
        console.error('Account deletion error:', e);
        if (e.code === 'P2024') {
            res.status(500).json({ error: "Database connection timeout. Iltimos qaytadan urinib ko'ring." });
        } else {
            res.status(500).json({ error: "Hisobni o'chirishda xatolik" });
        }
    }
});

// Admin: Barcha buyurtmalar
app.get('/api/orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, full_name: true, email: true, phone: true } }
            }
        });
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: 'Buyurtmalarni yuklashda xatolik' });
    }
});

// Admin: Buyurtma statusini yangilash + Telegram xabar
app.put('/api/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status))
            return res.status(400).json({ error: "Noto'g'ri status" });

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status },
            include: { user: { select: { full_name: true, phone: true } } }
        });

        // Telegram ga status haqida xabar
        const statusLabels = {
            pending: "⏳ Kutilmoqda",
            confirmed: "✅ Tasdiqlandi",
            shipping: "🚚 Yo'lda",
            delivered: "📦 Yetkazildi",
            cancelled: "❌ Bekor qilindi"
        };

        let msg = `📋 *BUYURTMA #${order.id} STATUS YANGILANDI*\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `👤 *Mijoz:* ${order.user.full_name}\n`;
        msg += `📞 *Tel:* ${order.user.phone || 'Kiritilmagan'}\n`;
        msg += `💰 *Summa:* ${order.totalAmount.toLocaleString()} so'm\n`;
        msg += `📌 *Yangi status:* ${statusLabels[status]}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━`;

        await sendTelegram(msg);

        res.json({ success: true, order });
    } catch (e) {
        res.status(500).json({ error: 'Statusni yangilashda xatolik' });
    }
});

// Admin: Buyurtmani o'chirish
app.delete('/api/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await prisma.order.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "O'chirishda xatolik" });
    }
});

// Admin: Dashboard statistikasi
app.get('/api/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalUsers,
            totalOrders,
            totalProducts,
            todayOrders,
            allOrders,
            recentOrders,
            recentUsers
        ] = await Promise.all([
            prisma.user.count(),
            prisma.order.count(),
            prisma.product.count(),
            prisma.order.findMany({ where: { createdAt: { gte: today, lt: tomorrow } } }),
            prisma.order.findMany({ select: { totalAmount: true, createdAt: true, status: true } }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { full_name: true } } }
            }),
            prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, full_name: true, email: true, createdAt: true } })
        ]);

        const todayRevenue = todayOrders.reduce((s, o) => s + o.totalAmount, 0);
        const totalRevenue = allOrders.reduce((s, o) => s + o.totalAmount, 0);
        const netProfit = totalRevenue * 0.24;

        // So'nggi 7 kunlik savdo grafigi
        const last7days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const nextD = new Date(d);
            nextD.setDate(nextD.getDate() + 1);
            const dayOrders = allOrders.filter(o => new Date(o.createdAt) >= d && new Date(o.createdAt) < nextD);
            const dayRevenue = dayOrders.reduce((s, o) => s + o.totalAmount, 0);
            last7days.push({
                name: d.toLocaleDateString('uz-UZ', { weekday: 'short' }),
                savdo: Math.round(dayRevenue),
                foyda: Math.round(dayRevenue * 0.24),
                buyurtmalar: dayOrders.length
            });
        }

        // Status bo'yicha statistika
        const statusStats = {
            pending: allOrders.filter(o => o.status === 'pending').length,
            confirmed: allOrders.filter(o => o.status === 'confirmed').length,
            shipping: allOrders.filter(o => o.status === 'shipping').length,
            delivered: allOrders.filter(o => o.status === 'delivered').length,
            cancelled: allOrders.filter(o => o.status === 'cancelled').length,
        };

        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            todayRevenue,
            totalRevenue,
            netProfit,
            last7days,
            statusStats,
            recentOrders,
            recentUsers
        });
    } catch (e) {
        console.error('Stats error:', e);
        res.status(500).json({ error: 'Statistikani yuklashda xatolik' });
    }
});

// ========== 7. USERS API ==========

// Barcha foydalanuvchilar (Admin)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, full_name: true, email: true, phone: true, address: true, role: true, picture: true, createdAt: true },
        });
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Foydalanuvchilarni yuklashda xatolik' });
    }
});

// Foydalanuvchi rolini yangilash
app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { full_name, role } = req.body;
        const user = await prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: { ...(full_name && { full_name }), ...(role && { role }) },
            select: { id: true, full_name: true, email: true, role: true }
        });
        res.json({ success: true, user });
    } catch (e) {
        res.status(500).json({ error: 'Yangilashda xatolik' });
    }
});

// Foydalanuvchini o'chirish
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Transaction orqali avval barcha buyurtmalarni o'chirish, keyin foydalanuvchini
        await prisma.$transaction(async (tx) => {
            // Avval barcha buyurtmalarni o'chirish
            await tx.order.deleteMany({ where: { userId } });
            
            // Keyin foydalanuvchini o'chirish
            await tx.user.delete({ where: { id: userId } });
        });
        
        res.json({ success: true });
    } catch (e) {
        console.error('User deletion error:', e);
        if (e.code === 'P2024') {
            res.status(500).json({ error: "Database connection timeout. Iltimos qaytadan urinib ko'ring." });
        } else {
            res.status(500).json({ error: "O'chirishda xatolik" });
        }
    }
});

// ========== 8. PRODUCTS API ==========

app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: "Mahsulotlarni yuklashda xatolik" });
    }
});

app.post('/api/products', authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const { brand, category, price, name_uz, name_ru, name_en, desc_uz, desc_ru, desc_en } = req.body;
        const files = req.files || [];
        const image_urls = files.map(f => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
        const product = await prisma.product.create({
            data: {
                brand: brand || '', category: category || '',
                price: parseFloat(price) || 0,
                image_url: image_urls[0] || '',
                gallery: image_urls,
                name_uz: name_uz || '', name_ru: name_ru || '', name_en: name_en || '',
                desc_uz: desc_uz || '', desc_ru: desc_ru || '', desc_en: desc_en || ''
            }
        });
        res.json({ success: true, product });
    } catch (e) {
        res.status(500).json({ error: 'Saqlashda xatolik' });
    }
});

app.put('/api/products/:id', authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const { brand, category, price, name_uz, name_ru, name_en, desc_uz, desc_ru, desc_en } = req.body;
        let data = { brand, category, price: parseFloat(price), name_uz, name_ru, name_en, desc_uz, desc_ru, desc_en };
        if (req.files?.length > 0) {
            const urls = req.files.map(f => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
            data.image_url = urls[0];
            data.gallery = urls;
        }
        const product = await prisma.product.update({ where: { id: parseInt(req.params.id) }, data });
        res.json({ success: true, product });
    } catch (e) {
        res.status(500).json({ error: 'Yangilashda xatolik' });
    }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "O'chirishda xatolik" });
    }
});

// ========== 9. MESSAGES API ==========

app.post('/api/messages', async (req, res) => {
    try {
        const { full_name, email, subject, message } = req.body;
        const msg = await prisma.message.create({
            data: { full_name, email, subject: subject || 'Yangi murojaat', message }
        });

        // Telegram ga xabar
        let tgMsg = `📩 *YANGI MUROJAAT!*\n━━━━━━━━━━━━━━━━━━━━━━\n`;
        tgMsg += `👤 *Ism:* ${full_name}\n📧 *Email:* ${email}\n`;
        tgMsg += `📌 *Mavzu:* ${subject || 'Yangi murojaat'}\n`;
        tgMsg += `💬 *Xabar:* ${message}\n━━━━━━━━━━━━━━━━━━━━━━`;
        await sendTelegram(tgMsg);

        res.json({ success: true, data: msg });
    } catch (e) {
        res.status(500).json({ error: 'Xabar saqlanmadi' });
    }
});

app.get('/api/messages', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(messages);
    } catch (e) {
        res.status(500).json({ error: 'Xabarlarni yuklashda xatolik' });
    }
});

app.put('/api/messages/:id/read', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await prisma.message.update({ where: { id: parseInt(req.params.id) }, data: { status: 'read' } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Xatolik' });
    }
});

app.delete('/api/messages/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await prisma.message.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "O'chirishda xatolik" });
    }
});

// ========== 10. SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Shohrux Market Backend: http://localhost:${PORT}`);
});
