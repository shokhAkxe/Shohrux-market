import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { ShoppingCart, Search, X, CheckCircle, Clock, Truck, Package, XCircle, Trash2, ShoppingBag, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useScrollLock } from '../hooks/useScrollLock';
import { useTranslation } from 'react-i18next';

const statusFlow = ['pending', 'confirmed', 'shipping', 'delivered'];

// Auto-refresh intervali (soniyada)
const REFRESH_INTERVAL = 30;

const Orders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
    const [lastUpdated, setLastUpdated] = useState(null);
    const prevOrderCount = useRef(0);

    useScrollLock(!!selected);

    // Dinamik status konfiguratsiyasi (i18n tarjimalari bilan)
    const statusConfig = {
        pending:   { label: t('status_pending', 'Kutilmoqda'),    icon: <Clock size={14}/>,        color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
        confirmed: { label: t('status_confirmed', 'Tasdiqlandi'),   icon: <CheckCircle size={14}/>,  color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
        shipping:  { label: t('status_shipping', "Yo'lda"),        icon: <Truck size={14}/>,        color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
        delivered: { label: t('status_delivered', 'Yetkazildi'),    icon: <Package size={14}/>,      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
        cancelled: { label: t('status_cancelled', 'Bekor qilindi'), icon: <XCircle size={14}/>,      color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' },
    };

    // ─── Filter ───────────────────────────────────────
    useEffect(() => {
        let res = orders;
        if (search) {
            const s = search.toLowerCase();
            res = res.filter(o =>
                o.user?.full_name?.toLowerCase().includes(s) ||
                o.address?.toLowerCase().includes(s) ||
                String(o.id).includes(s)
            );
        }
        if (statusFilter !== 'ALL') res = res.filter(o => o.status === statusFilter);
        setFiltered(res);
    }, [search, statusFilter, orders]);

    // ─── Buyurtmalarni yuklash ─────────────────────────
    const fetchOrders = async (silent = false) => {
        try {
            const res = await api.get('/orders');
            const newOrders = res.data;

            // Yangi buyurtma kelganini tekshirish
            if (prevOrderCount.current > 0 && newOrders.length > prevOrderCount.current) {
                const diff = newOrders.length - prevOrderCount.current;
                toast.success(`🛍 ${diff} ${t('new_orders_toast', 'ta yangi buyurtma keldi!')}`, {
                    duration: 5000,
                    icon: '🔔',
                    style: {
                        background: '#6366f1',
                        color: '#fff',
                        fontWeight: 'bold',
                    }
                });
            }
            prevOrderCount.current = newOrders.length;

            setOrders(newOrders);
            setLastUpdated(new Date());
        } catch {
            if (!silent) toast.error(t('toast_fetch_error', 'Buyurtmalarni yuklashda xatolik'));
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // ─── Birinchi yuklash ─────────────────────────────
    useEffect(() => {
        fetchOrders();
    }, []);

    // ─── Auto-refresh (har 30 soniyada) ───────────────
    useEffect(() => {
        const countdownTimer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchOrders(true); // Silent refresh
                    return REFRESH_INTERVAL;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownTimer);
    }, []);

    // ─── Status yangilash ─────────────────────────────
    const updateStatus = async (orderId, status) => {
        setUpdating(orderId);
        try {
            await api.put(`/orders/${orderId}/status`, { status });
            toast.success(`${t('toast_status_updated', 'Status yangilandi:')} ${statusConfig[status].label}`);
            // Lokal holatni yangilash
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            if (selected?.id === orderId) setSelected(prev => ({ ...prev, status }));
        } catch {
            toast.error(t('toast_error_generic', 'Xatolik yuz berdi'));
        } finally {
            setUpdating(null);
        }
    };

    // ─── O'chirish ────────────────────────────────────
    const deleteOrder = async (id, e) => {
        e?.stopPropagation();
        if (!window.confirm(t('confirm_delete_order', "Buyurtmani o'chirasizmi?"))) return;
        try {
            await api.delete(`/orders/${id}`);
            toast.success(t('toast_deleted', "O'chirildi"));
            setSelected(null);
            setOrders(prev => prev.filter(o => o.id !== id));
        } catch {
            toast.error(t('toast_delete_error', "O'chirishda xatolik"));
        }
    };

    // ─── Countlar ─────────────────────────────────────
    const counts = {
        ALL: orders.length,
        pending:   orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        shipping:  orders.filter(o => o.status === 'shipping').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
        </div>
    );

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight dark:text-white">{t('orders_title', 'Buyurtmalar')}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-slate-400 text-sm">{t('total_orders', 'Jami')} {orders.length} {t('ta_count', 'ta')}</p>
                        {/* Auto-refresh indicator */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>
                            <span>{countdown}s {t('refresh_countdown', 'da yangilanadi')}</span>
                            <button
                                onClick={() => { fetchOrders(); setCountdown(REFRESH_INTERVAL); }}
                                className="p-1 hover:text-indigo-500 transition-colors"
                                title={t('hint_refresh_now', 'Hozir yangilash')}
                            >
                                <RefreshCw size={12}/>
                            </button>
                        </div>
                        {lastUpdated && (
                            <span className="text-xs text-slate-300 dark:text-slate-600 hidden sm:inline">
                                {lastUpdated.toLocaleTimeString('uz-UZ')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm w-full sm:w-72">
                    <Search size={18} className="text-slate-400 flex-shrink-0"/>
                    <input
                        placeholder={t('search_placeholder', 'Mijoz ismi, manzil, #id...')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm dark:text-white placeholder-slate-400"
                    />
                    {search && <button onClick={() => setSearch('')}><X size={16} className="text-slate-400"/></button>}
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${statusFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-[#0F172A] text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}
                >
                    {t('tab_all', 'Barchasi')} ({counts.ALL})
                </button>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${statusFilter === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-[#0F172A] text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}
                    >
                        {cfg.icon} {cfg.label} ({counts[key] || 0})
                    </button>
                ))}
            </div>

            {/* Jadval */}
            <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                {[
                                    t('th_id', '#'), 
                                    t('th_customer', 'Mijoz'), 
                                    t('th_address', 'Manzil'), 
                                    t('th_sum', 'Summa'), 
                                    t('th_payment', "To'lov"), 
                                    t('th_status', 'Status'), 
                                    t('th_date', 'Sana'), 
                                    t('th_actions', 'Amal')
                                ].map((h, i) => (
                                    <th key={i} className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-4 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(order => {
                                const sc = statusConfig[order.status] || statusConfig.pending;
                                return (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelected(order)}
                                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-indigo-50/40 dark:hover:bg-[#1E293B] transition-colors cursor-pointer group"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="font-black text-indigo-500">#{order.id}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm flex-shrink-0">
                                                    {order.user?.full_name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{order.user?.full_name}</p>
                                                    <p className="text-xs text-slate-400">{order.user?.phone || order.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[130px] truncate">
                                            {order.address}
                                        </td>
                                        <td className="px-5 py-4 font-black text-sm text-slate-800 dark:text-white whitespace-nowrap">
                                            {Number(order.totalAmount || 0).toLocaleString()} {t('currency', "so'm")}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {order.paymentMethod === 'cash' ? `💵 ${t('pay_cash', 'Naqd')}`
                                                : order.paymentMethod === 'card' ? `💳 ${t('pay_card', 'Karta')}`
                                                : `📅 ${order.paymentMonths} ${t('pay_months', 'oy')}`}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full w-fit ${sc.color}`}>
                                                {sc.icon} {sc.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                                            <br/>
                                            <span className="text-slate-300 dark:text-slate-600">
                                                {new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={(e) => deleteOrder(order.id, e)}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="py-20 text-center text-slate-400">
                            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30"/>
                            <p>{t('orders_not_found', 'Buyurtmalar topilmadi')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal — qator bosilganda ochiladi */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
                    <div
                        className="bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="sticky top-0 bg-white dark:bg-[#0F172A] p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-xl font-black dark:text-white">{t('order_detail_title', 'Buyurtma')} #{selected.id}</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {new Date(selected.createdAt).toLocaleString('uz-UZ')}
                                </p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="p-6 space-y-5">

                            {/* Mijoz ma'lumotlari */}
                            <div className="p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-3">{t('lbl_customer_info', '👤 Mijoz ma\'lumotlari')}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-slate-400 text-xs">{t('cust_name', 'Ism')}</p>
                                        <p className="font-bold dark:text-white">{selected.user?.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs">{t('cust_phone', 'Telefon')}</p>
                                        <p className="font-bold dark:text-white">{selected.user?.phone || '—'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-slate-400 text-xs">Email</p>
                                        <p className="font-bold dark:text-white">{selected.user?.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-slate-400 text-xs">{t('lbl_delivery_address', '📍 Yetkazish manzili')}</p>
                                        <p className="font-bold dark:text-white">{selected.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs">{t('lbl_payment_method', '💳 To\'lov usuli')}</p>
                                        <p className="font-bold dark:text-white">
                                            {selected.paymentMethod === 'cash' ? t('pay_cash_full', 'Naqd pul')
                                                : selected.paymentMethod === 'card' ? t('pay_card_full', 'Karta')
                                                : `${t('pay_split', "Bo'lib to'lash")} (${selected.paymentMonths} ${t('pay_months', 'oy')})`}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs">{t('lbl_order_date', '📅 Buyurtma sanasi')}</p>
                                        <p className="font-bold dark:text-white">{new Date(selected.createdAt).toLocaleDateString('uz-UZ')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mahsulotlar */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-3">
                                    {t('lbl_ordered_products', '📦 Mahsulotlar')} ({(Array.isArray(selected.items) ? selected.items : []).length} {t('ta_count', 'ta')})
                                </p>
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {(Array.isArray(selected.items) ? selected.items : []).map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#1e293b] rounded-xl">
                                            <div className="flex items-center gap-3">
                                                {item.img && (
                                                    <img src={item.img} alt="" className="w-11 h-11 rounded-lg object-cover flex-shrink-0"/>
                                                )}
                                                <div>
                                                    <p className="font-bold text-sm dark:text-white">{item.nomi?.uz || item.name_uz || item.name || t('generic_product', 'Mahsulot')}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {item.quantity || 1} {t('ta_count', 'ta')} × {Number(item.narxi || item.price || 0).toLocaleString()} {t('currency', "so'm")}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-black text-sm dark:text-white whitespace-nowrap">
                                                {((item.narxi || item.price || 0) * (item.quantity || 1)).toLocaleString()} {t('currency', "so'm")}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-3 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                                    <span className="font-bold text-indigo-700 dark:text-indigo-300">{t('lbl_total_sum', 'Jami summa:')}</span>
                                    <span className="font-black text-xl text-indigo-700 dark:text-indigo-300">
                                        {Number(selected.totalAmount || 0).toLocaleString()} {t('currency', "so'm")}
                                    </span>
                                </div>
                            </div>

                            {/* Status yangilash */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-3">{t('lbl_update_status', '📌 Statusni yangilash')}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {statusFlow.map(s => {
                                        const sc = statusConfig[s];
                                        const isActive = selected.status === s;
                                        return (
                                            <button
                                                key={s}
                                                disabled={!!updating}
                                                onClick={() => updateStatus(selected.id, s)}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
                                                    isActive
                                                        ? `${sc.color} ring-2 ring-current`
                                                        : 'bg-slate-50 dark:bg-[#1e293b] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                {sc.icon} {sc.label}
                                                {isActive && <span className="ml-auto">✓</span>}
                                            </button>
                                        );
                                    })}
                                    <button
                                        disabled={!!updating}
                                        onClick={() => updateStatus(selected.id, 'cancelled')}
                                        className={`col-span-2 flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
                                            selected.status === 'cancelled'
                                                ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-400'
                                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100'
                                        }`}
                                    >
                                        <XCircle size={14}/> {t('btn_cancel_order', 'Bekor qilish')}
                                        {selected.status === 'cancelled' && <span className="ml-auto">✓</span>}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-center">
                                    💡 {t('telegram_notice', 'Status o\'zgarganda Telegram ga xabar ketadi')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;