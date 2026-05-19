import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, CreditCard, Calendar } from "lucide-react";
import { useState, useEffect } from "react"; // useEffect qo'shildi
import { useTranslation } from "react-i18next";
import { sendOrderToTelegram } from "../../api/telegram";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axios";

function CheckoutModal({ isOpen, onClose, cartItems, totalPrice, clearCart }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.full_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    paymentMethod: "cash",
    months: 3,
  });

  const [loading, setLoading] = useState(false);

  // SCROLL LOCK - Buyurtma berish oynasi ochiqligida skrollni qulflash
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error(t("fill_all_fields"));
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Telegramga yuborish
      await sendOrderToTelegram(cartItems, totalPrice, form);
      
      // 2. Backendga buyurtmani saqlash
      const res = await axiosInstance.post('/auth/orders', {
        items: cartItems,
        totalAmount: totalPrice,
        address: form.address,
        paymentDetails: {
          method: form.paymentMethod,
          months: form.paymentMethod === "installment" ? form.months : null
        }
      });

      if (res.data.success) {
        toast.success(t("order_sent"));
        clearCart();
        onClose();
      } else {
        toast.error(t("order_error"));
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.error || t("order_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold">{t("checkout")}</h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <input
                type="text"
                placeholder={t("name")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="tel"
                placeholder={t("phone")}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder={t("address")}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 transition-all"
              />

              <div>
                <p className="font-medium mb-2 text-sm text-slate-700">{t("payment_method")}</p>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setForm({ ...form, paymentMethod: "cash" })} className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${form.paymentMethod === "cash" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 hover:bg-slate-200"}`}><Wallet size={18} /> <span className="text-[12px]">{t("cash")}</span></button>
                  <button type="button" onClick={() => setForm({ ...form, paymentMethod: "card" })} className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${form.paymentMethod === "card" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 hover:bg-slate-200"}`}><CreditCard size={18} /> <span className="text-[12px]">{t("card")}</span></button>
                  <button type="button" onClick={() => setForm({ ...form, paymentMethod: "installment" })} className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${form.paymentMethod === "installment" ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-slate-100 hover:bg-slate-200"}`}><Calendar size={18} /> <span className="text-[12px]">{t("installment")}</span></button>
                </div>
              </div>

              {form.paymentMethod === "installment" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 6, 12].map((m) => (
                      <button key={m} type="button" onClick={() => setForm({ ...form, months: m })} className={`py-2 rounded-xl text-[12px] transition-all ${form.months === m ? "bg-blue-600 text-white" : "bg-white border hover:bg-slate-50"}`}>
                        {m} {t("months")}
                        <div className="text-[10px] opacity-80">{Math.round(totalPrice / m).toLocaleString()} so'm</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-5 border-t bg-slate-50/50">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-70 shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98]"
              >
                {loading ? t("sending") || "..." : `${t("confirm_order")} — ${totalPrice.toLocaleString()} so'm`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CheckoutModal;