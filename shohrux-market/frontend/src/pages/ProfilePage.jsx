import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User, Package, LogOut, Edit2, Save, ShoppingBag,
  Calendar, Trash2, UserX, Clock, CheckCircle, Truck,
  XCircle, ChevronRight, AlertTriangle, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/auth";
import toast from "react-hot-toast";

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIGS = {
  pending:   { labelKey: "pending",   icon: Clock,       badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-400"  },
  confirmed: { labelKey: "confirmed", icon: CheckCircle, badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"   },
  shipping:  { labelKey: "shipping",  icon: Truck,       badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  delivered: { labelKey: "delivered", icon: Package,     badge: "bg-emerald-100 text-emerald-700",dot:"bg-emerald-500"},
  cancelled: { labelKey: "cancelled", icon: XCircle,     badge: "bg-rose-100 text-rose-700",     dot: "bg-rose-400"   },
};

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIGS[status] || STATUS_CONFIGS.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${cfg.badge}`}>
      <Icon size={12} />
      {t(cfg.labelKey)}
    </span>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
          >
            <div className="w-16 h-16 bg-rose-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle size={28} className="text-rose-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">{title}</h3>
            <p className="text-slate-500 text-center text-sm mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition">
                {t("cancel") || "Bekor"}
              </button>
              <button onClick={onConfirm} className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-semibold hover:bg-rose-700 transition">
                {t("yes_delete") || "Ha, o'chirish"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, logout, loadUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", email: "", phone: "", address: "" });
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", onConfirm: null });
  const openConfirm = (title, message, onConfirm) => setConfirmDialog({ open: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmDialog(d => ({ ...d, open: false }));

  useEffect(() => {
    if (user) {
      setEditData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getOrders();
      setOrders(res.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (v) => (v || v === 0) ? Number(v).toLocaleString() : "0";
  const formatDate = (d) => {
    if (!d) return t("unknown_date") || "Noma'lum sana";
    try {
      const map = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" };
      return new Date(d).toLocaleDateString(map[i18n.language] || "uz-UZ");
    } catch { return t("unknown_date") || "Noma'lum sana"; }
  };

  const handleSave = async () => {
    const dataToUpdate = {};
    if (editData.full_name !== user?.full_name) dataToUpdate.full_name = editData.full_name;
    if (editData.email    !== user?.email)     dataToUpdate.email     = editData.email;
    if (editData.phone    !== user?.phone)     dataToUpdate.phone     = editData.phone;
    if (editData.address  !== user?.address)   dataToUpdate.address   = editData.address;
    if (!Object.keys(dataToUpdate).length) { toast.error(t("no_changes") || "Hech qanday o'zgarish yo'q"); setIsEditing(false); return; }
    const res = await updateProfile(dataToUpdate);
    if (res.success) { setIsEditing(false); await loadUser(); toast.success(t("profile_updated") || "Profil yangilandi!"); }
  };

  const handleChangePassword = async () => {
    if (!oldPass || !newPass) { toast.error(t("FillAllFields") || "Barcha maydonlarni to'ldiring"); return; }
    if (newPass.length < 4)   { toast.error(t("password_min_length") || "Parol kamida 4 belgi"); return; }
    const res = await changePassword(oldPass, newPass);
    if (res.success) { setOldPass(""); setNewPass(""); setShowPasswordForm(false); toast.success(t("password_changed") || "Parol o'zgartirildi!"); }
  };

  const deleteOrder = (orderId) => {
    openConfirm(
      t("delete_order_title") || "Buyurtmani o'chirish",
      t("delete_order_confirm") || "Bu buyurtma butunlay o'chiriladi. Davom etishni xohlaysizmi?",
      async () => {
        closeConfirm();
        try {
          await authAPI.deleteOrder(orderId);
          toast.success(t("order_deleted") || "Buyurtma o'chirildi");
          await fetchOrders();
        } catch { toast.error(t("error_occurred") || "Xatolik yuz berdi"); }
      }
    );
  };

  const clearAllOrders = () => {
    openConfirm(
      t("clear_all_orders_title") || "Barcha buyurtmalarni o'chirish",
      t("clear_all_orders_confirm", { count: orders.length }) || `${orders.length} ta buyurtmaning barchasi o'chiriladi. Bu amalni qaytarib bo'lmaydi!`,
      async () => {
        closeConfirm();
        try {
          for (const o of orders) await authAPI.deleteOrder(o.id);
          toast.success(t("orders_cleared") || "Buyurtmalar tarixi tozalandi");
          setOrders([]);
        } catch { toast.error(t("error_occurred") || "Xatolik yuz berdi"); }
      }
    );
  };

  const deleteAccount = async () => {
    if (!window.confirm(t("delete_account_confirm1") || "Haqiqatdan ham hisobingizni o'chirmoqchimisiz?")) return;
    if (!window.confirm(t("delete_account_confirm2") || "Barcha ma'lumotlaringiz o'chib ketadi. Davom etasizmi?")) return;
    try {
      await authAPI.deleteAccount();
      toast.success(t("account_deleted") || "Hisob o'chirildi");
      logout();
      navigate("/");
    } catch { toast.error(t("error_occurred") || "Xatolik yuz berdi"); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">

            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <User size={32} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">{user?.full_name || t("user")}</h1>
                    <p className="opacity-80 text-sm">{user?.email}</p>
                  </div>
                </div>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition flex items-center gap-2 text-sm font-medium">
                    <Edit2 size={16} /> {t("edit")}
                  </button>
                ) : (
                  <button onClick={handleSave}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl transition flex items-center gap-2 text-sm font-medium">
                    <Save size={16} /> {t("save") || "Saqlash"}
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* ── Personal Info ── */}
              <div>
                <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <User size={16} className="text-blue-600" /> {t("personal_info")}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: t("full_name"), key: "full_name", type: "text",  placeholder: "Ism Familiya" },
                    { label: t("email"),     key: "email",     type: "email", placeholder: "example@mail.com" },
                    { label: t("phone"),     key: "phone",     type: "tel",   placeholder: "+998 90 000 00 00" },
                    { label: t("address"),   key: "address",   type: "text",  placeholder: "Shahar, ko'cha, uy" },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{field.label}</label>
                      {isEditing ? (
                        <input
                          type={field.type}
                          value={editData[field.key]}
                          onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full p-3 border border-slate-200 rounded-xl mt-1 focus:outline-none focus:border-blue-500 focus:ring-4 ring-blue-500/10 transition text-sm"
                        />
                      ) : (
                        <p className="font-semibold text-slate-800 mt-1">{user?.[field.key] || t("not_provided")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            {/* ── Order History ── */}
<div className="border-t pt-6">
  <div className="flex justify-between items-center mb-5">
    <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
      <Package size={16} className="text-blue-600" /> {t("order_history") || "Buyurtmalar tarixi"}
      {orders.length > 0 && (
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {orders.length}
        </span>
      )}
    </h3>
    <div className="flex items-center gap-2">
      {orders.length > 0 && (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/my-orders")}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            {t("see_all") || "Barchasini ko'r"} <ChevronRight size={14} />
          </motion.button>
          
          {/* TOZALASh TUGMASIDAGI t("refresh") KALITI t("clear_history") GA ALMASHTIRILDI */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={clearAllOrders}
            className="text-sm text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
          >
            <Trash2 size={14} /> {t("clear_history") || "Tarixni tozalash"}
          </motion.button>
        </>
      )}
    </div>
  </div>

  {loading ? (
    <div className="text-center py-8">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
      <p className="text-slate-400 text-sm">{t("loading") || "Yuklanmoqda..."}</p>
    </div>
  ) : orders.length > 0 ? (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {orders
          .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
          .slice(0, 5)
          .map((order, idx) => {
            const totalAmount = order?.total_amount || order?.totalAmount || order?.total || 0;
            const cfg = STATUS_CONFIGS[order?.status] || STATUS_CONFIGS.pending;

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden group hover:border-blue-200 transition-all"
              >
                {/* Status stripe */}
                <div className={`h-1 ${cfg.dot}`} />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={16} className="text-blue-600 shrink-0" />
                      <div>
                        {/* BUYURTMA MATNI TO'LIQ t("order_number") BILAN ALMASHTIRILDI */}
                        <p className="font-bold text-slate-800 text-sm">{t("order_number") || "Buyurtma"} #{order.id}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} />
                          {formatDate(order?.created_at || order?.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order?.status} />
                      
                      {/* CARD ICHIDAGI O'CHIRISH TITLE'I t("delete") GA O'ZGARTIRILDI */}
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title={t("delete") || "O'chirish"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Items preview */}
                  {order?.items && order.items.length > 0 && (
                    <div className="bg-white rounded-xl p-3 mb-3 border border-slate-100 space-y-1.5">
                      {order.items.slice(0, 2).map((item, i) => {
                        const name = item?.nomi?.[i18n.language] || item?.nomi?.uz || item?.nomi || item?.name || "Mahsulot";
                        const price = item?.narxi || item?.price || 0;
                        const qty = item?.quantity || 1;
                        return (
                          <div key={i} className="flex justify-between text-xs items-center">
                            <span className="text-slate-600 truncate max-w-[60%]">{name} ×{qty}</span>
                            <span className="font-semibold text-slate-700 shrink-0">{formatPrice(price * qty)} {t("currency_suffix") || "so'm"}</span>
                          </div>
                        );
                      })}
                      {order.items.length > 2 && (
                        /* BU YERGA MAXSUS t("more_items_suffix") QO'YILDI */
                        <p className="text-xs text-slate-400 text-center">+{order.items.length - 2} {t("more_items_suffix") || "ta mahsulot"}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="font-black text-blue-600">
                      {formatPrice(totalAmount)} {t("currency_suffix") || "so'm"}
                    </p>
                    
                    {/* BATAFSIL TUGMASI t("view_details") GA O'ZGARTIRILDI */}
                    <button
                      onClick={() => navigate("/my-orders")}
                      className="text-xs text-slate-400 hover:text-blue-600 font-medium flex items-center gap-1 transition"
                    >
                      {t("view_details") || "Batafsil"} <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {orders.length > 5 && (
        <button
          onClick={() => navigate("/my-orders")}
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-300 hover:text-blue-600 text-sm font-medium transition"
        >
          {/* YANA FALONTA BUYURTMA MATNI TARTIBLANDI */}
          {t("view_more_orders", { count: orders.length - 5 }) || `Yana ${orders.length - 5} ta buyurtmani ko'rish →`}
        </button>
      )}
    </div>
  ) : (
    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      <Package size={48} className="text-slate-300 mx-auto mb-3" />
      <p className="text-slate-400 font-medium">{t("no_orders") || "Buyurtmalar yo'q"}</p>
      <button onClick={() => navigate("/")}
        className="mt-4 text-blue-600 text-sm font-semibold hover:text-blue-700 transition">
        {t("start_shopping") || "Xarid qilish"} →
      </button>
    </div>
  )}
</div>

              {/* ── Change Password ── */}
              <div className="border-t pt-6">
                {!showPasswordForm ? (
                  <button onClick={() => setShowPasswordForm(true)}
                    className="text-blue-600 hover:underline font-medium text-sm">
                    {t("change_password")}
                  </button>
                ) : (
                  <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-slate-700">{t("change_password")}</h3>
                    <input type="password" placeholder={t("old_password") || "Eski parol"} value={oldPass}
                      onChange={e => setOldPass(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 ring-blue-500/10 focus:border-blue-500 outline-none text-sm" />
                    <input type="password" placeholder={t("new_password") || "Yangi parol"} value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 ring-blue-500/10 focus:border-blue-500 outline-none text-sm" />
                    <div className="flex gap-3 pt-1">
                      <button onClick={handleChangePassword}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm">
                        {t("save") || "Saqlash"}
                      </button>
                      <button onClick={() => { setShowPasswordForm(false); setOldPass(""); setNewPass(""); }}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition text-sm">
                        {t("cancel") || "Bekor"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Logout / Delete ── */}
              <div className="border-t pt-6">
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="flex-1 py-3 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition font-bold text-sm"
                  >
                    <LogOut size={18} /> {t("logout")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={deleteAccount}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition font-bold text-sm"
                  >
                    <UserX size={18} /> {t("delete_account")}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
}

export default ProfilePage;