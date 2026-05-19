import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '../context/AdminContext';
import api from '../api/axios';
import {
    LayoutDashboard, ShoppingBag, MessageSquare, Users,
    ShoppingCart, Settings, Sun, Moon, Globe, LogOut, ChevronDown, Bell, Search, Package
} from 'lucide-react';
import Button from './Button';

const Layout = () => {
    const { t } = useTranslation();
    const { darkMode, setDarkMode, lang, setLang, user, logout } = useAdmin();
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        // Har 30 sekundda yangilash
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return t('invalid_date');
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return t('invalid_date');
        return date.toLocaleString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US');
    };

    const fetchNotifications = async () => {
        try {
            // Fetch recent orders and messages
            const [ordersRes, messagesRes] = await Promise.all([
                api.get('/orders?limit=5'),
                api.get('/messages?limit=5')
            ]);

            const orderNotifs = (ordersRes.data || []).slice(0, 3).map(order => {
                const orderDate = order.createdAt || order.created_at || order.date;
                return {
                    id: `order-${order.id}`,
                    type: 'order',
                    title: `${t('new_order')} #${order.id}`,
                    message: `${order.user?.full_name || t('anonymous')} - ${Number(order.totalAmount || order.total_amount || 0).toLocaleString()} ${t('sum')}`,
                    sender: order.user?.full_name || t('anonymous'),
                    time: formatDate(orderDate),
                    icon: <Package size={16} className="text-indigo-500" />
                };
            });

            const messageNotifs = (messagesRes.data || []).slice(0, 3).map(msg => ({
                id: `message-${msg.id}`,
                type: 'message',
                title: `${t('new_message_from')} ${msg.full_name || t('anonymous')}`,
                message: msg.text?.substring(0, 60) + (msg.text?.length > 60 ? '...' : '') || t('no_message_text'),
                sender: msg.full_name || t('anonymous'),
                time: formatDate(msg.created_at),
                icon: <MessageSquare size={16} className="text-emerald-500" />
            }));

            const allNotifs = [...orderNotifs, ...messageNotifs].sort((a, b) => 
                new Date(b.time) - new Date(a.time)
            ).slice(0, 10);

            setNotifications(allNotifs);
            // Yangi xabarlar soni (hozircha barchasini ko'rsatadi)
            setUnreadCount(allNotifs.length);
        } catch (error) {
            console.error('Bildirishnomalarni yuklashda xatolik:', error);
        }
    };

    const languages = [
        { code: 'uz', label: 'O\'zbek', flag: '🇺🇿' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'en', label: 'English', flag: '🇬🇧' }
    ];

    const menuItems = [
        { name: 'dashboard',      path: '/admin',            icon: <LayoutDashboard size={20}/> },
        { name: 'products',       path: '/admin/products',   icon: <ShoppingBag size={20}/> },
        { name: 'orders',         path: '/admin/orders',     icon: <ShoppingCart size={20}/> },
        { name: 'users',          path: '/admin/users',      icon: <Users size={20}/> },
        { name: 'messages',       path: '/admin/messages',   icon: <MessageSquare size={20}/> },
        { name: 'admins',         path: '/admin/management', icon: <Settings size={20}/> },
    ];

    const handleLogout = () => { logout(); navigate('/login'); };

    const pageName = menuItems.find(i =>
        location.pathname === i.path ||
        (i.path !== '/admin' && location.pathname.startsWith(i.path))
    )?.name || 'dashboard';

    return (
        <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-[#0B1120] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
            {/* Sidebar */}
            <aside className={`w-72 flex flex-col transition-colors duration-300 ${darkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'} border-r`}>
                <div className="h-20 flex items-center px-8 border-b border-inherit">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">S</div>
                    <span className="ml-3 text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
                        SH-Market
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link key={item.path} to={item.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`}
                            >
                                {item.icon} {t(item.name)}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-inherit">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        icon={LogOut}
                    >
                        {t('logout')}
                    </Button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className={`h-20 flex items-center justify-between px-8 border-b transition-colors duration-300 ${darkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h2 className="text-xl font-bold">{t(pageName)}</h2>
                    <div className="flex items-center gap-5">
                        {/* Search Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/admin/orders')}
                            icon={Search}
                            className="p-2.5"
                        />

                        {/* Notifications */}
                        <div className="relative group">
                            <button className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:scale-105 transition-transform text-slate-600 dark:text-slate-300">
                                <Bell size={20}/>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <div className={`absolute top-full right-0 mt-2 w-96 rounded-xl shadow-lg border overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <h4 className="font-bold text-slate-800 dark:text-white">{t('notifications_title')}</h4>
                                    {unreadCount > 0 && (
                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{unreadCount} {t('new')}</span>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400">
                                            {t('no_notifications')}
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div 
                                                key={notif.id}
                                                onClick={() => {
                                                    if (notif.type === 'order') navigate('/admin/orders');
                                                    if (notif.type === 'message') navigate('/admin/messages');
                                                }}
                                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex-shrink-0">
                                                        {notif.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-[10px] text-slate-400">
                                                                {notif.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                                    <button 
                                        onClick={() => navigate('/admin/orders')} 
                                        className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                    >
                                        {t('view_all_orders')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Language Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 font-bold text-sm hover:text-indigo-500 transition-colors">
                                <Globe size={18}/> {lang.toUpperCase()} <ChevronDown size={14} className="text-slate-400"/>
                            </button>

                            <div className={`absolute top-full right-0 mt-2 w-40 rounded-xl shadow-lg border overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-slate-200'}`}>
                                {languages.map((lng) => (
                                    <button
                                        key={lng.code}
                                        onClick={() => setLang(lng.code)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-500/10 ${lang === lng.code ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-600 dark:text-slate-300'}`}
                                    >
                                        <span className="text-lg">{lng.flag}</span>
                                        {lng.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dark Mode Toggle */}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2.5"
                            icon={darkMode ? Sun : Moon}
                        />
                        <div className="flex items-center gap-3 pl-5 border-l dark:border-slate-700 border-slate-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold leading-tight">{user?.full_name || 'Admin'}</p>
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{user?.role || 'Super Admin'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet/>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;