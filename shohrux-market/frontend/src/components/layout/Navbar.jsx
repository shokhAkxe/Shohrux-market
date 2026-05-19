import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart, User, Menu, X, ChevronDown, Bell,
  Package, CheckCircle, Truck, Clock, XCircle, ArrowRight,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/auth";
import toast from "react-hot-toast";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIGS = {
  pending:   { label: "Kutilmoqda",  icon: Clock,        color: "text-amber-500",  bg: "bg-amber-50",   badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-400" },
  confirmed: { label: "Tasdiqlandi", icon: CheckCircle,  color: "text-blue-500",   bg: "bg-blue-50",    badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"  },
  shipping:  { label: "Yo'lda",      icon: Truck,        color: "text-purple-500", bg: "bg-purple-50",  badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500"},
  delivered: { label: "Yetkazildi",  icon: Package,      color: "text-emerald-500",bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500"},
  cancelled: { label: "Bekor qilindi",icon: XCircle,     color: "text-rose-500",   bg: "bg-rose-50",    badge: "bg-rose-100 text-rose-700",     dot: "bg-rose-400"  },
};

// ─── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({ orders, onClose, onCancel, navigate, cancelling }) {
  const unread = orders.filter(o => o.status === "pending" || o.status === "confirmed" || o.status === "shipping");
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
      onClick={(e) => e.stopPropagation()}
    >
{/* Header */}
<div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
  <div className="flex items-center gap-2">
    <Bell size={18} />
    {/* STATIK MATN O'RNIGA t() FUNKSIYASI QO'YILDI */}
    <span className="font-bold">{t("my_orders") || "Buyurtmalarim"}</span>
    {orders.length > 0 && (
      <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        {orders.length}
      </span>
    )}
  </div>
  <button
    onClick={() => { navigate("/my-orders"); onClose(); }}
    className="flex items-center gap-1 text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition"
  >
    {/* BARCHASI MATNI HAM TARJIMA QILINDI */}
    {t("view_all") || "Barchasi"} <ArrowRight size={12} />
  </button>
</div>

      {/* Content */}
      {orders.length === 0 ? (
        <div className="py-12 text-center">
          <Bell size={40} className="text-slate-200 mx-auto mb-3" />
          {/* 1. BUYURTMALAR YO'Q MATNI TARJIMA QILINDI */}
          <p className="text-slate-400 text-sm font-medium">{t("no_orders") || "Buyurtmalar yo'q"}</p>
          <button
            onClick={() => { navigate("/products"); onClose(); }}
            className="mt-3 text-blue-600 text-sm font-medium hover:underline"
          >
            {/* 2. XARID QILISh MATNI TARJIMA QILINDI */}
            {t("start_shopping") || "Xarid qilish"} →
          </button>
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
          {orders
            .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
            .slice(0, 8)
            .map((order, idx) => {
              const cfg = STATUS_CONFIGS[order.status] || STATUS_CONFIGS.pending;
              const Icon = cfg.icon;
              const canCancel = order.status === "pending";
              const items = order.items || [];
              
              // 3. MAHSULOT SO'ZI TARJIMA QILINDI
              const firstName = items[0]?.nomi?.uz || items[0]?.nomi || items[0]?.name || t("product_default" || "Mahsulot");

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group hover:bg-slate-50 transition"
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <Icon size={17} className={cfg.color} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        {/* 4. BUYURTMA # MATNI TARJIMA QILINDI */}
                        <p className="font-semibold text-sm text-slate-800">{t("order_number") || "Buyurtma"} #{order.id}</p>
                        {/* 5. STATUS ENGLIQLARI DINAMIK TARJIMA QILINDI */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
                          {t(`status_${order.status}`) || cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {items.length > 0
                          ? `${firstName}${items.length > 1 ? ` +${items.length - 1} ${t("items_count_suffix") || "ta"}` : ""}`
                          : t("no_product_info" || "Mahsulot ma'lumotlari yo'q")}
                      </p>
                      {/* 6. VALYUTA SO'MI TARJIMA QILINDI */}
                      <p className="text-xs font-bold text-blue-600 mt-1">
                        {Number(order.total_amount || order.totalAmount || order.total || 0).toLocaleString()} {t("currency_suffix") || "so'm"}
                      </p>
                    </div>
                  </div>

                  {/* Status progress bar */}
                  {order.status !== "cancelled" && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-1">
                        {["pending", "confirmed", "shipping", "delivered"].map((s, i) => {
                          const step = ["pending", "confirmed", "shipping", "delivered"].indexOf(order.status);
                          return (
                            <div
                              key={s}
                              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                                i <= step ? cfg.dot : "bg-slate-100"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cancel button for pending */}
                  {canCancel && (
                    <div className="px-4 pb-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onCancel(order.id); }}
                        disabled={cancelling === order.id}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle size={13} />
                        {/* 7. BEKOR QILINMOQDA VA BUYURTMANI BEKOR QILISh TARJIMA QILINDI */}
                        {cancelling === order.id ? t("cancelling_btn" || "Bekor qilinmoqda...") : t("cancel_order_btn" || "Buyurtmani bekor qilish")}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
        </div>
      )}

      {orders.length > 8 && (
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => { navigate("/my-orders"); onClose(); }}
            className="w-full py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition"
          >
            {/* 8. YANA FALONTA BUYURTMANI KO'RISh TARJIMA QILINDI */}
            {t("view_more_orders", { count: orders.length - 8 }) || `Yana ${orders.length - 8} ta buyurtmani ko'rish →`}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
function Navbar({ isCartOpen, setIsCartOpen, onLoginClick, onRegisterClick }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { wishlist } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangHover, setIsLangHover] = useState(false);
  const [isUserHover, setIsUserHover] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // ── Orders state for notifications ────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [cancelling, setCancelling] = useState(null);
  const [prevOrders, setPrevOrders] = useState([]);
  const notifRef = useRef(null);

  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Active buyurtmalar soni (pending + confirmed + shipping)
  const activeCount = orders.filter(o =>
    ["pending", "confirmed", "shipping"].includes(o.status)
  ).length;

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await authAPI.getOrders();
      const newOrders = res.data || [];

      // Status o'zgarishlarini tekshir
      if (prevOrders.length > 0) {
        newOrders.forEach(o => {
          const old = prevOrders.find(p => p.id === o.id);
          if (old && old.status !== o.status) {
            const cfg = STATUS_CONFIGS[o.status];
            if (cfg) {
              toast.success(`Buyurtma #${o.id}: ${cfg.label}`, {
                icon: o.status === "delivered" ? "🎉" : o.status === "cancelled" ? "❌" : "📦",
                duration: 5000,
              });
            }
          }
        });
      }

      setPrevOrders(newOrders);
      setOrders(newOrders);
    } catch {
      // silent fail
    }
  }, [isAuthenticated, prevOrders]);

  useEffect(() => {
    fetchOrders();
    // Har 20 soniyada avtomatik yangilanish
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Cancel order ──────────────────────────────────────────────────────────
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Rostdan ham buyurtmani bekor qilmoqchimisiz?")) return;
    try {
      setCancelling(orderId);
      await authAPI.cancelOrder(orderId);
      toast.success("Buyurtma bekor qilindi");
      await fetchOrders();
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setCancelling(null);
    }
  };

  // Scroll lock
  useEffect(() => {
    const shouldLock = isMobileMenuOpen || (typeof isCartOpen !== "undefined" && isCartOpen);
    document.body.style.overflow = shouldLock ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen, isCartOpen]);

  const languages = [
    { code: "uz", label: "O'zbekcha", name: "Uzb", flag: "🇺🇿" },
    { code: "en", label: "English",   name: "Eng", flag: "🇺🇸" },
    { code: "ru", label: "Русский",   name: "Рус", flag: "🇷🇺" },
  ];

  const changeLanguage = (code) => { i18n.changeLanguage(code); setIsLangHover(false); };
  const currentLang = languages.find(l => l.code === i18n.language);

  const navLinks = [
    { path: "/",        label: t("Home")     || "Bosh sahifa" },
    { path: "/products",label: t("Products") || "Mahsulotlar" },
    { path: "/wishlist",label: t("Wishlist") || "Sevimlilar"  },
    { path: "/about",   label: t("About_Us") || "Biz haqimizda" },
    { path: "/contact", label: t("Contact")  || "Aloqa" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 md:h-20 gap-2">

            {/* Logo */}
            <Link
              to="/"
              className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap shrink-0"
            >
              SHOHRUX MARKET
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center justify-center flex-1 gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative px-2.5 py-2 text-sm xl:text-[15px] font-medium transition-all rounded-lg whitespace-nowrap
                    ${isActive ? "text-blue-600 bg-blue-50/50" : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {link.path === "/wishlist" && wishlist.length > 0 && (
                        <span className="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full align-top">
                          {wishlist.length}
                        </span>
                      )}
                      {isActive && (
                        <motion.div layoutId="nav-underline" className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center justify-end gap-2 flex-nowrap shrink-0">

              {/* Language selector */}
              <div className="relative" onMouseEnter={() => setIsLangHover(true)} onMouseLeave={() => setIsLangHover(false)}>
                <button className="flex items-center gap-1.5 px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-sm">
                  <span className="text-base">{currentLang?.flag}</span>
                  <span className="font-medium text-[12px]">{currentLang?.name}</span>
                  <ChevronDown size={12} className={`transition-transform ${isLangHover ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isLangHover && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
                    >
                      {languages.map((lang) => (
                        <button key={lang.code} onClick={() => changeLanguage(lang.code)}
                          className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm ${i18n.language === lang.code ? "bg-blue-50 text-blue-600" : ""}`}>
                          <span className="text-xl">{lang.flag}</span>
                          <span className="flex-1">{lang.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth */}
              <div className="flex items-center gap-1.5">
                {isAuthenticated ? (
                  <div className="relative" onMouseEnter={() => setIsUserHover(true)} onMouseLeave={() => setIsUserHover(false)}>
                    <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium whitespace-nowrap">
                      <User size={14} />
                      <span className="max-w-[80px] truncate">{user?.full_name?.split(" ")[0]}</span>
                      <ChevronDown size={10} className={`transition-transform ${isUserHover ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isUserHover && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
                        >
                          <button onClick={() => { navigate("/profile"); setIsUserHover(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm">
                            <User size={14} /> {t("profile")}
                          </button>
                        <button 
  onClick={() => { navigate("/my-orders"); setIsUserHover(false); }}
  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm"
>
  <Package size={14} /> 
  {/* STATIK MATN TARJIMA FUNKSIYASIGA ALMASHTIRILDI */}
  {t("my_orders") || "Buyurtmalarim"}
</button>
                          <button onClick={() => { logout(); setIsUserHover(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 flex items-center gap-2 text-sm border-t">
                            <X size={14} /> {t("logout")}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <button onClick={onLoginClick} className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[13px] font-medium transition whitespace-nowrap">
                      {t("login")}
                    </button>
                    <button onClick={onRegisterClick} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-medium transition shadow-md whitespace-nowrap">
                      {t("register")}
                    </button>
                  </>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl transition shrink-0"
              >
                <ShoppingCart size={16} />
                <span className="font-bold text-sm">{totalItems}</span>
              </button>

              {/* ── NOTIFICATION BELL ── */}
              {isAuthenticated && (
                <div ref={notifRef} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <Bell size={18} className="text-slate-700" />

                    {/* Unread badge */}
                    <AnimatePresence>
                      {activeCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black shadow-sm"
                        >
                          {activeCount > 9 ? "9+" : activeCount}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Pulse animation for new orders */}
                    {activeCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-50" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <NotificationPanel
                        orders={orders}
                        onClose={() => setIsNotifOpen(false)}
                        onCancel={cancelOrder}
                        navigate={navigate}
                        cancelling={cancelling}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button onClick={() => setIsCartOpen(true)} className="relative p-1.5">
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile notification bell */}
              {isAuthenticated && (
                <div ref={null} className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-1.5"
                  >
                    <Bell size={22} />
                    {activeCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                        {activeCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 w-72 h-full bg-white z-[101] shadow-xl"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold text-lg">{t("menu")}</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X size={22} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-2 overflow-y-auto h-[calc(100%-60px)]">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 hover:bg-slate-100 rounded-xl transition">
                    <span>{link.label}</span>
                    {link.path === "/wishlist" && wishlist.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{wishlist.length}</span>
                    )}
                  </Link>
                ))}

                {/* Language */}
                <div className="border-t my-2 pt-4">
                  <p className="text-xs text-slate-400 mb-2">{t("select_language")}</p>
                  <div className="flex gap-2">
                    {languages.map((lang) => (
                      <button key={lang.code}
                        onClick={() => { changeLanguage(lang.code); setIsMobileMenuOpen(false); }}
                        className={`flex-1 py-2 rounded-xl text-sm flex items-center justify-center gap-1 ${
                          i18n.language === lang.code ? "bg-blue-600 text-white" : "bg-slate-100"
                        }`}>
                        <span>{lang.flag}</span><span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {isAuthenticated ? (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm truncate">{user?.full_name || user?.email}</p>
                          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <button onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }}
                        className="w-full py-2.5 bg-slate-100 rounded-xl text-sm font-medium mb-2">
                        {t("profile")}
                      </button>
                
                    </div>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-500 rounded-xl mt-2">
                      <X size={18} /> {t("logout")}
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3 pt-4 border-t">
                    <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 bg-slate-100 rounded-xl font-medium text-sm">
                      {t("login")}
                    </button>
                    <button onClick={() => { onRegisterClick(); setIsMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm">
                      {t("register")}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
