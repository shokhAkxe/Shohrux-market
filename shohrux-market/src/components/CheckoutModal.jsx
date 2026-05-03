import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, CreditCard, Calendar } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendOrderToTelegram } from "../telegram";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

function CheckoutModal({ isOpen, onClose, cartItems, totalPrice, clearCart }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    name: user?.full_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    paymentMethod: "cash",
    months: 3,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error(t("fill_all_fields"));
      return;
    }
    setLoading(true);
    const success = await sendOrderToTelegram(cartItems, totalPrice, form);
    if (success) {
      toast.success(t("order_sent"));
      clearCart();
      onClose();
    } else {
      toast.error(t("order_error"));
    }
    setLoading(false);
  };

  const monthly = form.paymentMethod === "installment" ? Math.round(totalPrice / form.months) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/70">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold">{t("checkout")}</h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <input
                type="text"
                placeholder={t("name")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
              />
              <input
                type="tel"
                placeholder={t("phone")}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder={t("address")}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
              />

              <div>
                <p className="font-medium mb-2">{t("payment_method")}</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setForm({ ...form, paymentMethod: "cash" })}
                    className={`py-2 rounded-xl flex flex-col items-center gap-1 ${form.paymentMethod === "cash" ? "bg-emerald-600 text-white" : "bg-slate-100"}`}
                  >
                    <Wallet size={18} /> {t("cash")}
                  </button>
                  <button
                    onClick={() => setForm({ ...form, paymentMethod: "card" })}
                    className={`py-2 rounded-xl flex flex-col items-center gap-1 ${form.paymentMethod === "card" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
                  >
                    <CreditCard size={18} /> {t("card")}
                  </button>
                  <button
                    onClick={() => setForm({ ...form, paymentMethod: "installment" })}
                    className={`py-2 rounded-xl flex flex-col items-center gap-1 ${form.paymentMethod === "installment" ? "bg-purple-600 text-white" : "bg-slate-100"}`}
                  >
                    <Calendar size={18} /> {t("installment")}
                  </button>
                </div>
              </div>

              {form.paymentMethod === "installment" && (
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="font-medium mb-2">{t("select_months")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 6, 12].map((m) => (
                      <button
                        key={m}
                        onClick={() => setForm({ ...form, months: m })}
                        className={`py-2 rounded-xl text-sm ${form.months === m ? "bg-blue-600 text-white" : "bg-white border"}`}
                      >
                        {m} {t("months")}
                        <div className="text-xs font-bold">{(totalPrice / m).toLocaleString()} so'm</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm mt-3">
                    {t("monthly_payment")}: <span className="font-bold text-blue-600">{monthly.toLocaleString()} so'm</span>
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-70"
              >
                {loading ? <div className="loader mx-auto" /> : `${t("confirm_order")} — ${totalPrice.toLocaleString()} so'm`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CheckoutModal;