import React from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const ProductCard = React.forwardRef(({ product, onProductClick }, ref) => {
  const { addToCart } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { t, i18n } = useTranslation();

  const isInWishlist = wishlist.some((item) => item.id === product.id);
  const productName = product.nomi?.[i18n.language] || product.nomi?.uz || product.nomi;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(t("added_to_cart"));
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
    toast.success(isInWishlist ? t("removed_from_wishlist") : t("added_to_wishlist"));
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onClick={() => onProductClick(product)}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-slate-100 cursor-pointer flex flex-col h-full transition-all duration-300"
    >
      <div className="relative overflow-hidden h-52 sm:h-56 md:h-64 bg-gradient-to-br from-slate-100 to-slate-50">
        <img
          src={product.img}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-md z-10"
        >
          <Heart
            size={18}
            className={`transition-all ${isInWishlist ? "fill-red-500 text-red-500" : "text-slate-600"}`}
          />
        </button>
        <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {t(product.cat)}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {product.brand?.toUpperCase()}
          </span>
          {product.rating && (
            <div className="flex items-center gap-0.5">
              <span className="text-yellow-500">★</span>
              <span className="text-xs font-medium text-slate-600">{product.rating}</span>
            </div>
          )}
        </div>

        <h3 className="mt-1 text-base font-bold text-slate-800 line-clamp-2 min-h-[48px]">
          {productName}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-xl font-black tracking-tighter text-slate-900">
              {product.narxi.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 ml-1">so'm</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            <ShoppingBag size={18} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;