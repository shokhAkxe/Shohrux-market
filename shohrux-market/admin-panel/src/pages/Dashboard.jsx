import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 👈 i18n ulandi
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
    DollarSign, ShoppingBag, Users, TrendingUp,
    Clock, CheckCircle, Truck, Package, XCircle, ArrowRight
} from 'lucide-react';
import api from '../api/axios';

// Backenddan keladigan har qanday formatdagi kun nomini JSON kalitlariga moslash lug'ati
const dayNameMap = {
    'dush': 'mon', 'sesh': 'tue', 'chor': 'wed', 'pay': 'thu', 'jum': 'fri', 'shan': 'sat', 'yak': 'sun',
    'dushanba': 'mon', 'seshanba': 'tue', 'chorshanba': 'wed', 'payshanba': 'thu', 'juma': 'fri', 'shanba': 'sat', 'yakshanba': 'sun',
    'mon': 'mon', 'tue': 'tue', 'wed': 'wed', 'thu': 'thu', 'fri': 'fri', 'sat': 'sat', 'sun': 'sun',
    'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed', 'thursday': 'thu', 'friday': 'fri', 'saturday': 'sat', 'sunday': 'sun'
};

const Dashboard = () => {
    const { t } = useTranslation(); // 👈 Tarjima funksiyasi
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Summalarni qisqartirish va tarjima qilish (mln, ming)
    const formatSum = (n) => {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ` ${t('mln_som').split(' ')[0]}`; // faqat 'mln' qismini oladi
        if (n >= 1_000) return (n / 1_000).toFixed(0) + ' ming';
        return n?.toLocaleString() || '0';
    };

    // Dinamik status sozlamalari
    const statusConfig = {
        pending:   { label: t('waiting'),      icon: <Clock size={16}/>,        color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
        confirmed: { label: t('confirmed', 'Tasdiqlandi'), icon: <CheckCircle size={16}/>, color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' }, 
        shipping:  { label: t('shipping', "Yo'lda"),       icon: <Truck size={16}/>,        color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
        delivered: { label: t('delivered', 'Yetkazildi'),   icon: <Package size={16}/>,      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
        cancelled: { label: t('cancelled', 'Bekor qilindi'),icon: <XCircle size={16}/>,      color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' },
    };

    // Stat Karta Komponenti (fayl ichida qulay bo'lishi uchun ko'chirildi)
    const StatCard = ({ title, value, sub, icon, color, onClick }) => (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}
        >
            <div className={`p-4 rounded-2xl ${color} text-white shadow-lg flex-shrink-0`}>{icon}</div>
            <div className="min-w-0">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider truncate">{title}</p>
                <h2 className="text-2xl font-black mt-1 text-slate-800 dark:text-white tabular-nums">{value}</h2>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
            {onClick && <ArrowRight size={18} className="ml-auto text-slate-300 flex-shrink-0" />}
        </div>
    );

    useEffect(() => {
        api.get('/stats')
            .then(r => setStats(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
        </div>
    );

    if (!stats) return <div className="text-center text-slate-500 py-20">{t('no_data', 'Ma\'lumot yuklanmadi')}</div>;

    // Grafik kunlarini (Chor, Pay va h.k.) mutlaqo to'g'ri o'giradigan qismi
    const translatedChartData = stats.last7days?.map(item => {
        const rawName = item.name?.toLowerCase().trim(); // Masalan: "chor"
        const i18nKey = dayNameMap[rawName] || rawName;  // Lug'atdan mosini topadi: "wed"
        return {
            ...item,
            name: t(i18nKey, item.name) // Agar JSON topilsa tarjimasi, bo'lmasa o'zi chiqadi
        };
    }) || [];

    return (
        <div className="space-y-8">

            {/* Stat Kartalar */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title={t('daily_earnings')}
                    value={`${formatSum(stats.todayRevenue)} ${t('mln_som').split(' ').slice(1).join(' ')}`} // 'so'm' yoki 'сум' qismini chiqaradi
                    sub={t('today_orders')}
                    icon={<DollarSign size={24}/>}
                    color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
                />
                <StatCard
                    title={t('orders')}
                    value={`${stats.totalOrders} ${t('ta')}`}
                    sub={`${t('waiting')}: ${stats.statusStats?.pending || 0} ${t('ta')}`}
                    icon={<ShoppingBag size={24}/>}
                    color="bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/30"
                    onClick={() => navigate('/admin/orders')}
                />
                <StatCard
                    title={t('customers')}
                    value={`${stats.totalUsers} ${t('ta')}`}
                    sub={t('registered_users')}
                    icon={<Users size={24}/>}
                    color="bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/30"
                    onClick={() => navigate('/admin/users')}
                />
                <StatCard
                    title={t('net_profit')}
                    value={`${formatSum(stats.netProfit)} ${t('mln_som').split(' ').slice(1).join(' ')}`}
                    sub={`${t('of_total_earnings')} 24%`}
                    icon={<TrendingUp size={24}/>}
                    color="bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30"
                />
            </div>

            {/* Grafiklar */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Savdo Dinamikasi */}
                <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-1 dark:text-white">{t('sales_dynamics')}</h3>
                    <p className="text-xs text-slate-400 mb-6">{t('last_7_days')}</p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={translatedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gSavdo" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15}/>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:12}}/>
                                <YAxis axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:11}} tickFormatter={v => formatSum(v)}/>
                                <Tooltip
                                    contentStyle={{backgroundColor:'#1e293b',border:'none',borderRadius:'12px',color:'#fff'}}
                                    formatter={(v) => [`${v.toLocaleString()} ${t('mln_som').split(' ').slice(1).join(' ')}`]}
                                />
                                <Area type="monotone" dataKey="savdo" name={t('sales')} stroke="#6366f1" strokeWidth={3} fill="url(#gSavdo)"/>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Foyda Ko'rsatkichi */}
                <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-1 dark:text-white">{t('profit_indicator')}</h3>
                    <p className="text-xs text-slate-400 mb-6">{t('sales_vs_profit')}</p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={translatedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15}/>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:12}}/>
                                <YAxis axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:11}} tickFormatter={v => formatSum(v)}/>
                                <Tooltip
                                    contentStyle={{backgroundColor:'#1e293b',border:'none',borderRadius:'12px',color:'#fff'}}
                                    formatter={(v) => [`${v.toLocaleString()} ${t('mln_som').split(' ').slice(1).join(' ')}`]}
                                />
                                <Legend wrapperStyle={{fontSize:'12px'}}/>
                                <Bar dataKey="savdo" name={t('sales')} fill="#6366f1" radius={[6,6,0,0]} barSize={20}/>
                                <Bar dataKey="foyda" name={t('profit')} fill="#10b981" radius={[6,6,0,0]} barSize={20}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quyi qism: Buyurtma statuslari + So'nggi buyurtmalar */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Status statistika */}
                <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 dark:text-white">{t('order_statuses', 'Buyurtma Statuslari')}</h3>
                    <div className="space-y-3">
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1e293b]">
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                                    {cfg.icon} {cfg.label}
                                </div>
                                <span className="font-black text-slate-700 dark:text-white text-lg">
                                    {stats.statusStats?.[key] || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* So'nggi buyurtmalar */}
                <div className="xl:col-span-2 bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold dark:text-white">{t('recent_orders', 'So\'nggi Buyurtmalar')}</h3>
                        <button onClick={() => navigate('/admin/orders')} className="text-sm text-indigo-500 font-bold hover:underline flex items-center gap-1">
                            {t('all', 'Barchasi')} <ArrowRight size={14}/>
                        </button>
                    </div>
                    <div className="space-y-3">
                        {stats.recentOrders?.length === 0 && (
                            <p className="text-slate-400 text-center py-8">{t('no_orders_yet', 'Hozircha buyurtmalar yo\'q')}</p>
                        )}
                        {stats.recentOrders?.map(order => {
                            const cfg = statusConfig[order.status] || statusConfig.pending;
                            return (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                                            #{order.id}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm">{order.user?.full_name}</p>
                                            <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-800 dark:text-white">{order.totalAmount?.toLocaleString()} {t('mln_som').split(' ').slice(1).join(' ')}</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* So'nggi foydalanuvchilar */}
            <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold dark:text-white">{t('new_users', 'Yangi Foydalanuvchilar')}</h3>
                    <button onClick={() => navigate('/admin/users')} className="text-sm text-indigo-500 font-bold hover:underline flex items-center gap-1">
                        {t('all', 'Barchasi')} <ArrowRight size={14}/>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.recentUsers?.map(u => (
                        <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1e293b] rounded-2xl">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0">
                                {u.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{u.full_name}</p>
                                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;