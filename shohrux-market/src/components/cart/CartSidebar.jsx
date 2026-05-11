import { useEffect } from "react"; // useEffect qo'shildi
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

  // 1. Sidebar ochilganda asosiy sahifa (body) skrolini to'xtatish
  useEffect(() => {
    if (isOpen) {
      // Skrol o'chganda sayt qimirlab qolmasligi uchun scrollbar kengligini hisoblash
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  const totalPrice = items.reduce((sum, item) => sum + item.narxi * (item.quantity || 1), 0);
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleOrderClick = () => {
    if (!user) {
      toast.error(t("please_login_first")); // Tarjima kaliti ishlatildi
      onClose();
      // Agar sizda login modal bo'lsa modalni oching, bo'lmasa navigate ishlatiladi
      navigate("/login"); 
      return;
    }
    onCheckout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex justify-end">
          {/* Overlay - Orqa fonni xiralashtirish */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{t("cart")}</h2>
                <p className="text-sm text-slate-400">
                  {totalItems} {t("products_count")}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Mahsulotlar ro'yxati (Faqat shu qism skrol bo'ladi) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 overscroll-contain">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t("empty_cart")}</p>
                </div>
              ) : (
                items.map((item) => {
                  // i18n tarjimalarini tekshirish
                  const name = item.nomi?.[i18n.language] || item.nomi?.uz || item.nomi;
                  return (
                    <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition-colors">
                      <img src={item.img} alt={name} className="w-16 h-16 object-contain bg-white rounded-lg shadow-sm" />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm line-clamp-1">{name}</h3>
                        <p className="text-blue-600 font-bold text-sm">{item.narxi.toLocaleString()} {t("sum")}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => decreaseQuantity(item.id)} className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-blue-50 active:scale-95 transition-all"><Minus size={14} /></button>
                          <span className="font-medium w-6 text-center">{item.quantity || 1}</span>
                          <button onClick={() => addToCart(item)} className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-blue-50 active:scale-95 transition-all"><Plus size={14} /></button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer - Jami va buyurtma */}
            {items.length > 0 && (
              <div className="p-5 border-t bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-slate-600">{t("total")}</span>
                  <span className="text-xl font-bold text-slate-900">{totalPrice.toLocaleString()} {t("sum")}</span>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleOrderClick}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
                  >
                    {t("checkout")}
                  </button>
                  <button onClick={clearCart} className="w-full py-2 text-sm text-red-400 hover:text-red-600 transition-colors">
                    {t("clear_cart")}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CartSidebar;