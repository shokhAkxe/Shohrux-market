import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, X, CreditCard, Wallet, Calendar, Check } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCartStore();
  const { isAuthenticated, openLogin, user } = useAuth();

  // Modal va To'lov holatlari
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // cash, card, installment
  const [installmentMonth, setInstallmentMonth] = useState(3);

  const totalPrice = items.reduce((sum, item) => sum + item.narxi * (item.quantity || 1), 0);
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      toast.error(t("please_login") || "Iltimos, avval kiring!");
      openLogin();
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    toast.success("Buyurtmangiz muvaffaqiyatli qabul qilindi!");
    setIsCheckoutOpen(false);
    clearCart();
    navigate("/");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-32 flex flex-col items-center px-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
          <ShoppingBag size={48} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t("CartEmptyTitle")}</h2>
        <p className="text-slate-500 mb-8">{t("CartEmptyDesc")}</p>
        <button 
          onClick={() => navigate("/")} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100"
        >
          {t("ViewProductsBtn")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> {t("back_to_shop") || "Orqaga"}
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mahsulotlar ro'yxati */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-3xl font-black text-slate-900 mb-6">{t("cart")} ({totalItems})</h1>
            {items.map((item) => {
              const name = item.nomi?.[i18n.language] || item.nomi?.uz || item.nomi;
              return (
                <div key={item.id} className="bg-white border border-slate-100 rounded-[24px] p-5 flex gap-5 items-center shadow-sm hover:shadow-md transition-shadow">
                  <img src={item.img} alt={name} className="w-24 h-24 object-contain bg-slate-50 rounded-2xl p-2" />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{name}</h3>
                    <p className="text-blue-600 font-black text-xl">{item.narxi.toLocaleString()} {t("Sum")}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center bg-slate-100/80 rounded-xl p-1">
                        <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-blue-600 transition-colors">
                          <Minus size={16} />
                        </button>
                        <span className="font-bold w-10 text-center text-slate-700">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-blue-600 transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Buyurtma hisobi (Sticky Side) */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm h-fit sticky top-28">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{t("order_summary")}</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-500">
                <span>{t("subtotal")}</span>
                <span className="font-semibold text-slate-900">{totalPrice.toLocaleString()} {t("Sum")}</span>
              </div>
              <div className="flex justify-between text-slate-500 border-b pb-4">
                <span>{t("delivery")}</span>
                <span className="text-green-500 font-bold">{t("free")}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="font-bold text-slate-900">{t("total")}</span>
                <span className="text-2xl font-black text-blue-600">{totalPrice.toLocaleString()} {t("Sum")}</span>
              </div>
            </div>
            <button 
              onClick={handleOpenCheckout}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {t("checkout")}
            </button>
            <button onClick={clearCart} className="w-full mt-4 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors">
              {t("clear_cart")}
            </button>
          </div>
        </div>
      </div>

      {/* --- CHECKOUT MODAL --- */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative bg-white w-full max-w-lg rounded-[35px] p-8 shadow-2xl overflow-y-auto max-h-[95vh]"
            >
              <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
              
              <h2 className="text-2xl font-black text-slate-900 mb-8">{t("complete_order")}</h2>
              
              <form onSubmit={handleOrderSubmit} className="space-y-6">
                {/* Shaxsiy ma'lumotlar */}
                <div className="grid gap-4">
                  <input required type="text" placeholder="Ism va familiya" defaultValue={user?.name} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium" />
                  <input required type="tel" placeholder="Telefon raqam" defaultValue={user?.phone} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium" />
                  <textarea required placeholder="Manzil" rows="2" className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium" />
                </div>

                {/* To'lov usullari */}
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider">To'lov turi</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'cash', icon: Wallet, label: 'Naqd' },
                      { id: 'card', icon: CreditCard, label: 'Karta' },
                      { id: 'installment', icon: Calendar, label: 'Bo\'lib to\'lash' }
                    ].map((method) => (
                      <button 
                        key={method.id}
                        type="button" 
                        onClick={() => setPaymentMethod(method.id)}
                        className={`relative flex flex-col items-center gap-2 p-4 border-2 rounded-[20px] transition-all ${paymentMethod === method.id ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                      >
                        {paymentMethod === method.id && <Check size={14} className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5" />}
                        <method.icon size={22} />
                        <span className="text-[11px] font-black uppercase text-center leading-3">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bo'lib to'lash qismi */}
                {paymentMethod === "installment" && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-4 bg-blue-50/50 p-5 rounded-[24px] border border-blue-100">
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">To'lov muddati</p>
                    <div className="flex gap-2">
                      {[3, 6, 12].map((month) => (
                        <button key={month} type="button" onClick={() => setInstallmentMonth(month)} className={`flex-1 py-3 rounded-xl font-bold transition-all ${installmentMonth === month ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500'}`}>{month} oy</button>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-medium text-blue-400 italic">Oylik to'lov:</span>
                      <span className="font-black text-blue-700">{Math.round(totalPrice / installmentMonth).toLocaleString()} {t("Sum")}</span>
                    </div>
                  </motion.div>
                )}

                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                   <div className="flex justify-between items-center px-2">
                      <span className="font-bold text-slate-400">Jami:</span>
                      <span className="text-2xl font-black text-slate-900">{totalPrice.toLocaleString()} {t("Sum")}</span>
                   </div>
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                    {t("confirm_order") || "Tasdiqlash"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CartPage;