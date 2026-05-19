import { useState, useEffect } from "react"; // useEffect qo'shildi
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext"; 
import { useNavigate } from "react-router-dom"; 
import toast from "react-hot-toast"; 

function CartSidebar({ isOpen, onClose, onCheckout }) {
  const { items, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCartStore();
  const { t, i18n } = useTranslation();
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const totalPrice = items.reduce((sum, item) => sum + item.narxi * (item.quantity || 1), 0);
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // SCROLL LOCK - Savat ochiqligida orqa fon skroll bo'lmasligi uchun
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

  // Buyurtma berish tugmasi bosilganda ishlaydigan mantiq
  const handleOrderClick = () => {
    if (!user) {
      toast.error(t("Iltimos, avval ro'yxatdan o'ting!"));
      onClose(); // Sidebar'ni yopish
      navigate("/login"); // Login sahifasiga yo'naltirish
      return;
    }
    onCheckout(); // Agar kirgan bo'lsa, modalni ochish
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
          >
            <div className="p-5 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{t("cart")}</h2>
                <p className="text-sm text-slate-400">{totalItems} {t("products")}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t("empty_cart")}</p>
                </div>
              ) : (
                items.map((item) => {
                  const name = item.nomi?.[i18n.language] || item.nomi?.uz || item.nomi;
                  return (
                    <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-xl">
                      <img src={item.img} alt={name} className="w-16 h-16 object-contain bg-white rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{name}</h3>
                        <p className="text-blue-600 font-bold text-sm">{item.narxi.toLocaleString()} so'm</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => decreaseQuantity(item.id)} className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-slate-100 transition-colors"><Minus size={14} /></button>
                          <span className="font-medium w-6 text-center">{item.quantity || 1}</span>
                          <button onClick={() => addToCart(item)} className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-slate-100 transition-colors"><Plus size={14} /></button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t bg-white">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">{t("total")}</span>
                  <span className="text-xl font-bold">{totalPrice.toLocaleString()} so'm</span>
                </div>
                <button
                  onClick={handleOrderClick}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                  {t("checkout")}
                </button>
                <button onClick={clearCart} className="w-full mt-2 py-2 text-sm text-red-500 hover:underline transition-all">
                  {t("clear")}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CartSidebar;