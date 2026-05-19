import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle, Clock, Truck, Package, XCircle, X, Trash2, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/auth";
import toast from "react-hot-toast";

function OrderDetailsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchOrderDetails();
  }, [user, orderId, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getOrders();
      const orders = response.data || [];
      const foundOrder = orders.find(o => o.id === parseInt(orderId));
      setOrder(foundOrder);
    } catch (error) {
      console.error("Buyurtma ma'lumotlarini yuklashda xatolik:", error);
      toast.error("Buyurtma ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Kutilmoqda",
        icon: <Clock size={16} />,
        color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
      },
      confirmed: {
        label: "Tasdiqlandi",
        icon: <CheckCircle size={16} />,
        color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      },
      shipping: {
        label: "Yo'lda",
        icon: <Truck size={16} />,
        color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
      },
      delivered: {
        label: "Yetkazildi",
        icon: <Package size={16} />,
        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
      },
      cancelled: {
        label: "Bekor qilindi",
        icon: <XCircle size={16} />,
        color: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
      },
    };
    return configs[status] || configs.pending;
  };

  const cancelOrder = async () => {
    if (!window.confirm("Rostdan ham buyurtmani bekor qilmoqchimisiz?")) return;
    
    try {
      setCancelling(true);
      await authAPI.cancelOrder(order.id);
      toast.success("Buyurtma muvaffaqiyatli bekor qilindi");
      fetchOrderDetails();
    } catch (error) {
      console.error("Buyurtmani bekor qilishda xatolik:", error);
      toast.error("Buyurtmani bekor qilishda xatolik yuz berdi");
    } finally {
      setCancelling(false);
    }
  };

  const deleteOrder = async () => {
    if (!window.confirm("Rostdan ham buyurtmani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.")) return;
    
    try {
      await authAPI.deleteOrder(order.id);
      toast.success("Buyurtma o'chirildi");
      navigate("/my-orders");
    } catch (error) {
      console.error("Buyurtmani o'chirishda xatolik:", error);
      toast.error("Buyurtmani o'chirishda xatolik yuz berdi");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Noma'lum sana";
    try {
      const langMap = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
      const date = new Date(dateStr);
      return date.toLocaleDateString(langMap[i18n.language] || 'uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Noma'lum sana";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart size={64} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-medium text-lg mb-2">Buyurtma topilmadi</p>
          <button
            onClick={() => navigate("/my-orders")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Buyurtmalar tarixiga qaytish
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition mb-4"
          >
            <ArrowLeft size={20} />
            <span>Buyurtmalar tarixiga qaytish</span>
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <ShoppingCart size={32} className="text-blue-600" />
                Buyurtma #{order.id}
              </h1>
              <p className="text-slate-500 mt-2">{formatDate(order.created_at || order.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              {order.status === 'pending' && (
                <button
                  onClick={cancelOrder}
                  disabled={cancelling}
                  className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-medium hover:bg-rose-100 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Bekor qilish
                </button>
              )}
              {order.status === 'cancelled' && (
                <button
                  onClick={deleteOrder}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  O'chirish
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${statusConfig.color}`}>
              {statusConfig.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{statusConfig.label}</h2>
              <p className="text-slate-500">Buyurtma holati</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Buyurtma mahsulotlari</h3>
          <div className="space-y-4">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingCart size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{item.name || item.product_name || 'Mahsulot'}</h4>
                    <p className="text-sm text-slate-500">Miqdor: {item.quantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">
                      {Number(item.price || item.total || 0).toLocaleString()} so'm
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">Mahsulotlar ma'lumotlari yo'q</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Buyurtma xulosasi</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>Mahsulotlar jami</span>
              <span>{Number(order.totalAmount || order.total || 0).toLocaleString()} so'm</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Yetkazib berish</span>
              <span>Bepul</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-lg text-slate-800">
              <span>Jami</span>
              <span>{Number(order.totalAmount || order.total || 0).toLocaleString()} so'm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
