import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, CheckCircle, Clock, Truck, Package, XCircle, ArrowLeft, Trash2, X, ShoppingCart, XCircle as CancelIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/auth";
import toast from "react-hot-toast";

function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchNotifications();
  }, [user, navigate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fetch orders
      const ordersResponse = await authAPI.getOrders();
      const ordersData = ordersResponse.data || [];
      setOrders(ordersData);
      
      // Generate notifications from order status changes
      const generatedNotifications = ordersData.map(order => {
        const statusConfig = getStatusConfig(order.status);
        return {
          id: `order-${order.id}`,
          type: 'order_status',
          // Sarlavha va xabarlarni tilga moslab to'liq dinamik i18next formatiga o'tkazdik
          title: t("notification_order_title", { id: order.id }) || `${t("order_number")} #${order.id} ${t("notification_title_suffix")}`,
          message: t("notification_order_message", { status: statusConfig.label }) || `${t("notification_message_prefix")} "${statusConfig.label}" ${t("notification_message_suffix")}`,
          status: order.status,
          orderId: order.id,
          order: order,
          createdAt: order.updated_at || order.createdAt,
          isRead: order.status !== 'pending'
        };
      });
      
      setNotifications(generatedNotifications);
    } catch (error) {
      console.error("Bildirishnomalarni yuklashda xatolik:", error);
      toast.error(t("toast_error_fetch_notifications") || "Bildirishnomalarni yuklashda xatolik yuz berdi");
      setNotifications([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: t("status_pending") || "Kutilmoqda",
        icon: <Clock size={14} />,
        color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
      },
      confirmed: {
        label: t("status_confirmed") || "Tasdiqlandi",
        icon: <CheckCircle size={14} />,
        color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      },
      shipping: {
        label: t("status_shipping") || "Yo'lda",
        icon: <Truck size={14} />,
        color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
      },
      delivered: {
        label: t("status_delivered") || "Yetkazildi",
        icon: <Package size={14} />,
        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
      },
      cancelled: {
        label: t("status_cancelled") || "Bekor qilindi",
        icon: <XCircle size={14} />,
        color: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
      },
    };
    return configs[status] || configs.pending;
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    toast.success(t("toast_success_mark_all") || "Barcha bildirishnomalar o'qildi deb belgilandi");
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    toast.success(t("toast_success_delete_notification") || "Bildirishnoma o'chirildi");
  };

  const clearAll = () => {
    if (window.confirm(t("confirm_clear_all_notifications") || "Barcha bildirishnomalarni o'chirmoqchimisiz?")) {
      setNotifications([]);
      toast.success(t("toast_success_clear_all_notifications") || "Barcha bildirishnomalar o'chirildi");
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm(t("confirm_cancel_order") || "Rostdan ham buyurtmani bekor qilmoqchimisiz?")) return;
    
    try {
      setCancelling(orderId);
      await authAPI.cancelOrder(orderId);
      toast.success(t("toast_success_cancel_order") || "Buyurtma muvaffaqiyatli bekor qilindi");
      fetchNotifications();
    } catch (error) {
      console.error("Buyurtmani bekor qilishda xatolik:", error);
      toast.error(t("toast_error_cancel_order") || "Buyurtmani bekor qilishda xatolik yuz berdi");
    } finally {
      setCancelling(null);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm(t("confirm_delete_order") || "Rostdan ham buyurtmani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.")) return;
    
    try {
      await authAPI.deleteOrder(orderId);
      toast.success(t("toast_success_delete_order") || "Buyurtma o'chirildi");
      fetchNotifications();
    } catch (error) {
      console.error("Buyurtmani o'chirishda xatolik:", error);
      toast.error(t("toast_error_delete_order") || "Buyurtmani o'chirishda xatolik yuz berdi");
    }
  };

  const clearCancelledOrders = async () => {
    if (!window.confirm(t("confirm_clear_cancelled") || "Barcha bekor qilingan buyurtmalarni o'chirmoqchimisiz?")) return;
    
    try {
      const cancelledOrders = orders.filter(o => o.status === 'cancelled');
      for (const order of cancelledOrders) {
        await authAPI.deleteOrder(order.id);
      }
      toast.success(`${cancelledOrders.length} ${t("toast_success_clear_cancelled_suffix") || "bekor qilingan buyurtmalar o'chirildi"}`);
      fetchNotifications();
    } catch (error) {
      console.error("Buyurtmalarni o'chirishda xatolik:", error);
      toast.error(t("toast_error_delete_order") || "Buyurtmani o'chirishda xatolik yuz berdi");
    }
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/my-orders`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return t("unknown_date") || "Noma'lum sana";
    try {
      const langMap = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t("time_just_now") || "Hozirgina";
      if (diffMins < 60) return `${diffMins} ${t("time_mins_oldin") || "daqiqa oldin"}`;
      if (diffHours < 24) return `${diffHours} ${t("time_hours_oldin") || "soat oldin"}`;
      if (diffDays < 7) return `${diffDays} ${t("time_days_oldin") || "kun oldin"}`;
      return date.toLocaleDateString(langMap[i18n.language] || 'uz-UZ');
    } catch {
      return t("unknown_date") || "Noma'lum sana";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">{t("loading_data") || "Ma'lumotlar yuklanmoqda..."}</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition mb-4"
          >
            <ArrowLeft size={20} />
            <span>{t("back_to_profile") || "Profilga qaytish"}</span>
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Bell size={32} className="text-blue-600" />
                {t("notifications") || "Bildirishnomalar"}
              </h1>
              <p className="text-slate-500 mt-2">
                {unreadCount > 0 
                  ? `${unreadCount} ${t("unread_notifications_count") || "ta o'qilmagan bildirishnoma"}` 
                  : t("all_notifications_read") || "Barcha bildirishnomalar o'qildi"}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  {t("mark_all_as_read") || "Barchasini o'qildi deb belgilash"}
                </button>
              )}
              {orders.filter(o => o.status === 'cancelled').length > 0 && (
                <button
                  onClick={clearCancelledOrders}
                  className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-medium hover:bg-rose-100 transition flex items-center gap-2"
                >
                  <CancelIcon size={18} />
                  {t("clear_cancelled_btn") || "Bekor qilinganlarni o'chirish"} ({orders.filter(o => o.status === 'cancelled').length})
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  {t("clear_all_btn") || "Tozalash"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((notification) => {
                const statusConfig = getStatusConfig(notification.status);
                return (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                      !notification.isRead 
                        ? 'border-l-4 border-l-blue-500 border-slate-200' 
                        : 'border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.color}`}>
                            {statusConfig.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-lg mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-slate-600 mb-2">{notification.message}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title={t("title_mark_as_read") || "O'qildi deb belgilash"}
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => viewOrderDetails(notification.orderId)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title={t("title_view_order") || "Buyurtmani ko'rish"}
                          >
                            <ShoppingCart size={18} />
                          </button>
                          {notification.order && notification.order.status === 'pending' && (
                            <button
                              onClick={() => cancelOrder(notification.orderId)}
                              disabled={cancelling === notification.orderId}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                              title={t("title_cancel") || "Bekor qilish"}
                            >
                              <CancelIcon size={18} />
                            </button>
                          )}
                          {notification.order && notification.order.status === 'cancelled' && (
                            <button
                              onClick={() => deleteOrder(notification.orderId)}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              title={t("title_delete") || "O'chirish"}
                            >
                              <X size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title={t("title_delete_notification") || "Bildirishnomani o'chirish"}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Bell size={64} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-medium text-lg mb-2">{t("no_notifications") || "Bildirishnomalar yo'q"}</p>
            <p className="text-slate-400 text-sm mb-4">{t("notifications_empty_desc") || "Buyurtmalar holati o'zgarganda bildirishnomalar keladi"}</p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              {t("start_shopping") || "Xaridni boshlash"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;