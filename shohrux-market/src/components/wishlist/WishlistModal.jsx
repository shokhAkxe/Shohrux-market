import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Heart } from "lucide-react";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCartStore } from "../../store/useCartStore";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

function WishlistModal({ isOpen, onClose }) {
  const { wishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { t, i18n } = useTranslation();

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(t("added_to_cart"));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-[201] overflow-hidden"
          >
            <div className="bg-slate-800 px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-white" />
                <h2 className="text-white font-semibold">{t("wishlist")}</h2>
                <span className="text-white/60 text-sm">({wishlist.length})</span>
              </div>
              <button onClick={onClose} className="p-1 text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-10">
                  <Heart size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t("empty_wishlist")}</p>
                  <button onClick={onClose} className="mt-4 text-blue-600 text-sm">
                    {t("browse_products")}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlist.map((product) => {
                    const name = product.nomi?.[i18n.language] || product.nomi?.uz || product.nomi;
                    return (
                      <div key={product.id} className="flex gap-3 bg-slate-50 p-3 rounded-xl">
                        <img src={product.img} alt={name} className="w-16 h-16 object-contain bg-white rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{name}</h3>
                          <p className="text-blue-600 font-bold text-sm">{product.narxi.toLocaleString()} so'm</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex-1 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                            >
                              {t("add_to_cart")}
                            </button>
                            <button
                              onClick={() => removeFromWishlist(product.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default WishlistModal;