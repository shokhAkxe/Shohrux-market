import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingBag, Calendar, Package, XCircle, Clock,
  CheckCircle, Truck, ArrowLeft, X, ChevronRight,
  Trash2, AlertTriangle, RefreshCw, ShoppingCart,
  MapPin, Phone, CreditCard, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/auth";
import toast from "react-hot-toast";

// ─── Status konfiguratsiyasi ──────────────────────────────────────────────────
const getStatusConfigs = (t) => ({
  pending: {
    label: t("status_pending") || "Kutilmoqda",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
    step: 0,
  },
  confirmed: {
    label: t("status_confirmed") || "Tasdiqlandi",
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    step: 1,
  },
  shipping: {
    label: t("status_shipping") || "Yo'lda",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
    step: 2,
  },
  delivered: {
    label: t("status_delivered") || "Yetkazildi",
    icon: Package,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    step: 3,
  },
  cancelled: {
    label: t("status_cancelled") || "Bekor qilindi",
    icon: XCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-400",
    step: -1,
  },
});

const getStatusSteps = (t) => [
  { key: "pending",   label: t("status_pending") || "Kutilmoqda",   icon: Clock },
  { key: "confirmed", label: t("status_confirmed") || "Tasdiqlandi", icon: CheckCircle },
  { key: "shipping",  label: t("status_shipping") || "Yo'lda",      icon: Truck },
  { key: "delivered", label: t("status_delivered") || "Yetkazildi",  icon: Package },
];

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText, danger = true }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
          >
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${danger ? "bg-rose-100" : "bg-amber-100"}`}>
              <AlertTriangle size={28} className={danger ? "text-rose-600" : "text-amber-600"} />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">{title}</h3>
            <p className="text-slate-500 text-center text-sm mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition"
              >
                {t("cancel") || "Bekor"}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 text-white rounded-2xl font-semibold transition ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-500 hover:bg-amber-600"}`}
              >
                {confirmText || (t("yes") || "Ha")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Order Status Tracker ─────────────────────────────────────────────────────
function OrderStatusTracker({ status, statusConfigs, statusSteps }) {
  const { t } = useTranslation();
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
          <XCircle size={20} className="text-rose-600" />
        </div>
        <div>
          <p className="font-bold text-rose-700">{t("order_cancelled_title") || "Buyurtma bekor qilindi"}</p>
          <p className="text-xs text-rose-500">{t("order_cancelled_desc") || "Bu buyurtma qayta tiklanmaydi"}</p>
        </div>
      </div>
    );
  }

  const currentStep = statusConfigs[status]?.step ?? 0;

  return (
    <div className="relative px-2 py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-5 right-5 h-1 bg-slate-100 rounded-full z-0" />
        {/* Progress line fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / 3) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="absolute top-5 left-5 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full z-0"
        />

        {statusSteps.map((step, idx) => {
          const done = idx <= currentStep;
          const active = idx === currentStep;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ duration: 0.3 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                  done
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white border-slate-200 text-slate-400"
                } ${active ? "ring-4 ring-blue-100" : ""}`}
              >
                <Icon size={16} />
              </motion.div>
              <span className={`text-[10px] font-semibold text-center ${done ? "text-blue-600" : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onCancel, onDelete, cancelling, i18nLanguage, formatDate, formatPrice, statusConfigs, statusSteps }) {
  const { t } = useTranslation();
  if (!order) return null;
  const config = statusConfigs[order.status] || statusConfigs.pending;
  const StatusIcon = config.icon;
  const canCancel = order.status === "pending";
  const canDelete = order.status === "cancelled";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${config.bg}`}>
              <StatusIcon size={20} className={config.color} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-lg">{t("order_number") || "Buyurtma"} #{order.id}</h2>
              <p className="text-xs text-slate-400">{formatDate(order.created_at || order.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Tracker */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase mb-3">{t("order_status") || "Buyurtma holati"}</p>
            <OrderStatusTracker status={order.status} statusConfigs={statusConfigs} statusSteps={statusSteps} />
          </div>

          {/* Items */}
          <div>
           <p className="text-xs font-bold text-slate-400 uppercase mb-3">
  {t("products") || "Mahsulotlar"} ({order.items?.length || 0} {t("items_count_suffix")})
</p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => {
                  // 3 tildagi nomlarni backend formatiga mos holda tekshirish
                  const name = 
                    item?.[`name_${i18nLanguage}`] || 
                    item?.[`nomi_${i18nLanguage}`] || 
                    item?.nomi?.[i18nLanguage] || 
                    item?.name_uz || 
                    item?.nomi?.uz || 
                    item?.name || 
                    item?.nomi || 
                    (t("product") || "Mahsulot");

                  const price = item?.narxi || item?.price || 0;
                  const qty = item?.quantity || 1;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                    >
                      {item.img ? (
                        <img src={item.img} alt={name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                          <Package size={20} className="text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">{name}</p>
                        <p className="text-xs text-slate-400">{qty} {t("pcs") || "ta"} × {formatPrice(price)} {t("sum") || "so'm"}</p>
                      </div>
                      <p className="font-black text-sm text-slate-800 shrink-0">{formatPrice(price * qty)} {t("sum") || "so'm"}</p>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">{t("no_product_info") || "Mahsulot ma'lumotlari yo'q"}</p>
              )}
            </div>
          </div>

          {/* Info */}
          {order.address && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <MapPin size={16} className="text-slate-400 shrink-0" />
              <p className="text-sm text-sm text-slate-600">{order.address}</p>
            </div>
          )}
          {order.phone && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <Phone size={16} className="text-slate-400 shrink-0" />
              <p className="text-sm text-sm text-slate-600">{order.phone}</p>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white">
            <span className="font-semibold">{t("total_amount") || "Jami summa"}:</span>
            <span className="font-black text-xl">
              {formatPrice(order.total_amount || order.totalAmount || order.total)} {t("sum") || "so'm"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {canCancel && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCancel(order.id)}
                disabled={cancelling === order.id}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-rose-50 text-rose-600 rounded-2xl font-semibold hover:bg-rose-100 transition disabled:opacity-50"
              >
                <XCircle size={18} />
                {cancelling === order.id ? (t("cancelling") || "Bekor qilinmoqda...") : (t("cancel_order") || "Bekor qilish")}
              </motion.button>
            )}
            {canDelete && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDelete(order.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-semibold hover:bg-slate-200 transition"
              >
                <Trash2 size={18} />
                {t("delete") || "O'chirish"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function MyOrdersPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling]   = useState(null);

  // Dinamik statuslar tarjimasi uchun
  const STATUS_CONFIGS = getStatusConfigs(t);
  const STATUS_STEPS = getStatusSteps(t);

  // Confirm dialogs
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", onConfirm: null, confirmText: "", danger: true });

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    fetchOrders();
    // Auto-refresh har 30 soniyada
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const response = await authAPI.getOrders();
      const newOrders = response.data || [];

      // Status o'zgargan buyurtmalarni topib toast ko'rsat
      if (silent && orders.length > 0) {
        newOrders.forEach(newOrder => {
          const old = orders.find(o => o.id === newOrder.id);
          if (old && old.status !== newOrder.status) {
            const cfg = STATUS_CONFIGS[newOrder.status] || STATUS_CONFIGS.pending;
            toast.success(`${t("order_number") || "Buyurtma"} #${newOrder.id}: ${cfg.label}`, { icon: "📦" });
          }
        });
      }

      setOrders(newOrders);
      // Agar ochiq modal bo'lsa, uni ham yangilaymiz
      if (selectedOrder) {
        const updated = newOrders.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch {
      if (!silent) toast.error(t("error_loading_orders") || "Buyurtmalarni yuklashda xatolik");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orders, selectedOrder, t, STATUS_CONFIGS]);

  const formatPrice = (v) => (v || v === 0) ? Number(v).toLocaleString() : "0";
  const formatDate = (d) => {
    if (!d) return t("unknown_date") || "Noma'lum sana";
    try {
      const map = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" };
      return new Date(d).toLocaleDateString(map[i18n.language] || "uz-UZ", {
        year: "numeric", month: "long", day: "numeric"
      });
    } catch { return t("unknown_date") || "Noma'lum sana"; }
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  // 🔒 SCROLL LOCK: Confirm dialog ochiqligida orqa fon skrollini qulflash
useEffect(() => {
  if (confirmDialog?.open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "unset";
  }

  // Sahifa o'zgarganda yoki komponent yopilganda skrollni xavfsiz ochib yuborish
  return () => {
    document.body.style.overflow = "unset";
  };
}, [confirmDialog?.open]);
const openConfirm = (title, message, onConfirm, confirmText, danger = true) =>
  setConfirmDialog({ open: true, title, message, onConfirm, confirmText, danger });
const closeConfirm = () =>
  setConfirmDialog(d => ({ ...d, open: false }));

const cancelOrder = (orderId) => {
  openConfirm(
    t("cancel_order_title") || "Buyurtmani bekor qilish",
    t("cancel_order_confirm") || "Rostdan ham bu buyurtmani bekor qilmoqchimisiz? Bu amalni qaytarib bo'lmaydi.",
    async () => {
      closeConfirm();
      try {
        setCancelling(orderId);
        await authAPI.cancelOrder(orderId);
        // Toast muvaffaqiyat xabari i18n tizimiga ulandi
        toast.success(t("order_cancelled_success") || "Buyurtma bekor qilindi");
        await fetchOrders();
        setSelectedOrder(null);
      } catch {
        // Toast xatolik xabari i18n tizimiga ulandi
        toast.error(t("error_occurred") || "Xatolik yuz berdi");
      } finally {
        setCancelling(null);
      }
    },
    t("yes_cancel") || "Ha, bekor qilish",
    true
  );
};
  const deleteOrder = (orderId) => {
    openConfirm(
      t("delete_order_title") || "Buyurtmani o'chirish",
      t("delete_order_confirm") || "Bu buyurtma butunlay o'chiriladi. Davom etishni xohlaysizmi?",
      async () => {
        closeConfirm();
        try {
          await authAPI.deleteOrder(orderId);
          toast.success(t("order_deleted_success") || "Buyurtma o'chirildi");
          setSelectedOrder(null);
          await fetchOrders();
        } catch {
          toast.error(t("error_occurred") || "Xatolik yuz berdi");
        }
      },
      t("yes_delete") || "Ha, o'chirish",
      true
    );
  };

  const clearCancelledOrders = () => {
    const cancelled = orders.filter(o => o.status === "cancelled");
    openConfirm(
      t("clear_cancelled_title") || "Bekor qilinganlarni o'chirish",
      `${cancelled.length} ${t("clear_cancelled_confirm") || "ta bekor qilingan buyurtma o'chiriladi."}`,
      async () => {
        closeConfirm();
        try {
          for (const o of cancelled) await authAPI.deleteOrder(o.id);
          toast.success(`${cancelled.length} ${t("orders_deleted_msg") || "ta buyurtma o'chirildi"}`);
          await fetchOrders();
        } catch {
          toast.error(t("error_occurred") || "Xatolik yuz berdi");
        }
      },
      t("yes_delete") || "Ha, o'chirish",
      true
    );
  };

  const clearAllOrders = () => {
    openConfirm(
      t("clear_all_title") || "Barcha buyurtmalarni o'chirish",
      `${orders.length} ${t("clear_all_confirm") || "ta buyurtmaning barchasi o'chiriladi. Bu amalni qaytarib bo'lmaydi!"}`,
      async () => {
        closeConfirm();
        try {
          for (const o of orders) await authAPI.deleteOrder(o.id);
          toast.success(t("all_orders_deleted") || "Barcha buyurtmalar o'chirildi");
          setOrders([]);
        } catch {
          toast.error(t("error_occurred") || "Xatolik yuz berdi");
        }
      },
      t("yes_clear_all") || "Barchasini o'chirish",
      true
    );
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-500 font-medium">{t("loading_orders") || "Buyurtmalar yuklanmoqda..."}</p>
        </div>
      </div>
    );
  }

  const cancelledCount = orders.filter(o => o.status === "cancelled").length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-5 text-sm font-medium"
            >
              <ArrowLeft size={18} /> {t("back_to_profile") || "Profilga qaytish"}
            </button>

            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                  <span className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <ShoppingBag size={20} className="text-white" />
                  </span>
                  {t("my_orders") || "Buyurtmalarim"}
                </h1>
               <p className="text-slate-400 mt-2 ml-[52px]"> {t("total")}: {orders.length} {t("order_count_suffix")}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => fetchOrders(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition"
                >
                  <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                  {t("refresh") || "Yangilash"}
                </motion.button>

                {cancelledCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={clearCancelledOrders}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-medium hover:bg-rose-100 transition"
                  >
                    <XCircle size={15} />
                    {t("cancelled_orders_btn") || "Bekor qilinganlar"} ({cancelledCount})
                  </motion.button>
                )}

                {orders.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={clearAllOrders}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
                  >
                    <Trash2 size={15} />
                    {t("clear_all_btn") || "Barchasini tozalash"}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Stats ── */}
          {orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
            >
              {Object.entries(STATUS_CONFIGS).map(([key, cfg]) => {
                const count = orders.filter(o => o.status === key).length;
                const Icon = cfg.icon;
                return (
                  <div key={key} className={`${cfg.bg} ${cfg.border} border rounded-2xl p-4 text-center`}>
                    <Icon size={18} className={`${cfg.color} mx-auto mb-1`} />
                    <p className={`text-2xl font-black ${cfg.color}`}>{count}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cfg.label}</p>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ── Orders List ── */}
          {orders.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {orders
                  .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
                  .map((order, idx) => {
                    const config = STATUS_CONFIGS[order.status] || STATUS_CONFIGS.pending;
                    const StatusIcon = config.icon;
                    const canCancel = order.status === "pending";
                    const canDelete = order.status === "cancelled";

                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50, transition: { duration: 0.25 } }}
                        transition={{ delay: idx * 0.04 }}
                        className={`bg-white rounded-2xl border ${config.border} shadow-sm hover:shadow-md transition-all overflow-hidden`}
                      >
                        {/* Status stripe */}
                        <div className={`h-1 w-full ${config.dot}`} />

                        <div className="p-5">
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                                <StatusIcon size={20} className={config.color} />
                              </div>
                              <div>
                                <p className="font-black text-slate-900">{t("order_number") || "Buyurtma"} #{order.id}</p>
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Calendar size={11} />
                                  {formatDate(order.created_at || order.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${config.badge}`}>
                                {config.label}
                              </span>
                            </div>
                          </div>

                          {/* Items preview */}
                          {order.items && order.items.length > 0 && (
                            <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5">
                              {order.items.slice(0, 2).map((item, i) => {
                                // 3 tildagi nomlarni dinamik aniqlash
                                const name = 
                                  item?.[`name_${i18n.language}`] || 
                                  item?.[`nomi_${i18n.language}`] || 
                                  item?.nomi?.[i18n.language] || 
                                  item?.name_uz || 
                                  item?.nomi?.uz || 
                                  item?.name || 
                                  item?.nomi || 
                                  (t("product") || "Mahsulot");

                                const price = item?.narxi || item?.price || 0;
                                const qty = item?.quantity || 1;
                                return (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-slate-600 truncate max-w-[60%]">{name} ×{qty}</span>
                                    <span className="font-semibold text-slate-800 shrink-0">{formatPrice(price * qty)} {t("sum") || "so'm"}</span>
                                  </div>
                                );
                              })}
                              {order.items.length > 2 && (
                                <p className="text-xs text-slate-400 text-center pt-1">
                                  +{order.items.length - 2} {t("more_products_msg") || "ta mahsulot ko'proq"}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wide">{t("total") || "Jami"}</p>
                              <p className="font-black text-blue-600 text-lg">
                                {formatPrice(order.total_amount || order.totalAmount || order.total)} {t("sum") || "so'm"}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {canCancel && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  onClick={(e) => { e.stopPropagation(); cancelOrder(order.id); }}
                                  disabled={cancelling === order.id}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-100 transition disabled:opacity-50"
                                >
                                  <XCircle size={14} />
                                  {t("cancel") || "Bekor"}
                                </motion.button>
                              )}
                              {canDelete && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
                                >
                                  <Trash2 size={14} />
                                  {t("delete") || "O'chirish"}
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedOrder(order)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                              >
                                {t("view") || "Ko'rish"} <ChevronRight size={14} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-700 mb-2">{t("no_orders_title") || "Hali buyurtmalar yo'q"}</h3>
              <p className="text-slate-400 text-sm mb-6">{t("no orders desc") || "Xarid qilishni boshlang va buyurtmalaringiz shu yerda ko'rinadi"}</p>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/products")}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                {t("start_shopping") || "Xaridni boshlash"}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onCancel={cancelOrder}
            onDelete={deleteOrder}
            cancelling={cancelling}
            i18nLanguage={i18n.language}
            formatDate={formatDate}
            formatPrice={formatPrice}
            statusConfigs={STATUS_CONFIGS}
            statusSteps={STATUS_STEPS}
          />
        )}
      </AnimatePresence>

      {/* ── Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
        confirmText={confirmDialog.confirmText}
        danger={confirmDialog.danger}
      />
    </>
  );
}

export default MyOrdersPage;