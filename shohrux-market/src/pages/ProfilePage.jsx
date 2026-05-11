import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Package, LogOut, Edit2, Save, ShoppingBag, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/auth";
import toast from "react-hot-toast";

function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, logout, loadUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // User ma'lumotlari o'zgarganda editData ni yangilash
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

  // Buyurtmalarni yuklash
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error("Buyurtmalarni yuklashda xatolik:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const dataToUpdate = {};
    if (editData.full_name !== user?.full_name) dataToUpdate.full_name = editData.full_name;
    if (editData.email !== user?.email) dataToUpdate.email = editData.email;
    if (editData.phone !== user?.phone) dataToUpdate.phone = editData.phone;
    if (editData.address !== user?.address) dataToUpdate.address = editData.address;
    
    if (Object.keys(dataToUpdate).length === 0) {
      toast.error(t("no_changes") || "Hech qanday o'zgarish yo'q!");
      setIsEditing(false);
      return;
    }
    
    const res = await updateProfile(dataToUpdate);
    if (res.success) {
      setIsEditing(false);
      await loadUser();
      toast.success(t("profile_updated_success") || "Profil muvaffaqiyatli yangilandi!");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPass || !newPass) {
      toast.error(t("FillAllFields"));
      return;
    }
    if (newPass.length < 4) {
      toast.error(t("password_short") || "Yangi parol kamida 4 belgidan iborat bo'lishi kerak!");
      return;
    }
    const res = await changePassword(oldPass, newPass);
    if (res.success) {
      setOldPass("");
      setNewPass("");
      setShowPasswordForm(false);
      toast.success(t("password_changed_success") || "Parol muvaffaqiyatli o'zgartirildi!");
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "0";
    return Number(price).toLocaleString();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return t("unknown_date") || "Noma'lum sana";
    try {
      const langMap = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
      return new Date(dateStr).toLocaleDateString(langMap[i18n.language] || 'uz-UZ');
    } catch {
      return t("unknown_date") || "Noma'lum sana";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">{t("loading_data") || "Ma'lumotlar yuklanmoqda..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user?.full_name || t("user_default")}</h1>
                  <p className="opacity-80">{user?.email || t("no_email")}</p>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition flex items-center gap-2"
                >
                  <Edit2 size={16} /> {t("Edit")}
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 rounded-xl hover:bg-green-600 transition flex items-center gap-2"
                >
                  <Save size={16} /> {t("save_button") || "Saqlash"}
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={18} /> {t("PersonalInfo")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">{t("FullName")}</label>
                  {isEditing ? (
                    <input
                      value={editData.full_name}
                      onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                      className="w-full p-2 border rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                      placeholder={t("FullName")}
                    />
                  ) : (
                    <p className="font-medium mt-1">{user?.full_name || t("no_info")}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-slate-500">{t("Email")}</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full p-2 border rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                      placeholder={t("Email")}
                    />
                  ) : (
                    <p className="font-medium mt-1">{user?.email || t("no_info")}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-slate-500">{t("Phone")}</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full p-2 border rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                      placeholder={t("Phone")}
                    />
                  ) : (
                    <p className="font-medium mt-1">{user?.phone || t("no_info")}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-slate-500">{t("Address")}</label>
                  {isEditing ? (
                    <input
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      className="w-full p-2 border rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                      placeholder={t("Address")}
                    />
                  ) : (
                    <p className="font-medium mt-1">{user?.address || t("no_info")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package size={18} /> {t("OrderHistory")}
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-400 mt-2">{t("loading_orders") || "Buyurtmalar yuklanmoqda..."}</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order, idx) => {
                    const orderId = order?.id || idx;
                    const totalAmount = order?.total_amount || order?.totalAmount || order?.total || 0;
                    
                    return (
                      <div key={orderId} className="bg-slate-50 border border-slate-100 p-4 rounded-xl hover:shadow-md transition">
                        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={16} className="text-blue-600" />
                            <span className="font-bold text-slate-700">
                              #{String(orderId).slice(-6).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm">
                            <Calendar size={14} />
                            <span>{formatDate(order?.created_at || order?.createdAt || order?.date)}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3 bg-white p-3 rounded-lg border border-slate-100">
                          {order?.items && order.items.length > 0 ? (
                            order.items.map((item, itemIdx) => {
                              const itemName = item?.nomi?.[i18n.language] || item?.nomi?.uz || item?.nomi || t("product_default");
                              const itemPrice = item?.narxi || 0;
                              const itemQty = item?.quantity || 1;
                              
                              return (
                                <div key={itemIdx} className="flex justify-between text-sm items-center">
                                  <span className="text-slate-600 font-medium">
                                    {itemName} 
                                    <span className="text-slate-400 ml-1">x{itemQty}</span>
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {formatPrice(itemPrice * itemQty)} {t("Sum")}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center text-slate-400 text-sm py-2">
                              {t("no_product_info") || "Mahsulot ma'lumotlari mavjud emas"}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${order?.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {order?.status === 'pending' ? t("Pending") : t("Completed")}
                          </span>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase tracking-wider">{t("OrderTotal")}</p>
                            <p className="font-bold text-blue-600 text-lg">
                              {formatPrice(totalAmount)} {t("Sum")}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Package size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">{t("no_orders") || "Hali buyurtmalar yo'q"}</p>
                  <button 
                    onClick={() => navigate("/")} 
                    className="mt-4 text-blue-600 text-sm font-semibold hover:text-blue-700 transition"
                  >
                    {t("start_shopping") || "Xaridni boshlash"}
                  </button>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="border-t pt-6">
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {t("ChangePassword")}
                </button>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-700">{t("ChangePassword")}</h3>
                  <input
                    type="password"
                    placeholder={t("old_password") || "Eski parol"}
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="password"
                    placeholder={t("new_password") || "Yangi parol"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleChangePassword}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      {t("save_button") || "Saqlash"}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setOldPass("");
                        setNewPass("");
                      }}
                      className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-100 transition"
                    >
                      {t("cancel_button") || "Bekor qilish"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <div className="border-t pt-6">
              <button
                onClick={logout}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition font-bold"
              >
                <LogOut size={18} /> {t("Logout")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;