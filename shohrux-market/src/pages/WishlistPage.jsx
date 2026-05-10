import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCartStore } from "../store/useCartStore";
import toast from "react-hot-toast";

function WishlistPage() {
  const { t } = useTranslation();
  const { wishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(t("added_to_cart"));
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Heart size={80} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("empty_wishlist")}</h2>
          <p className="text-slate-500 mb-6">{t("click_heart")}</p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {t("browse_products")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("wishlist")}</h1>
            <p className="text-slate-500 mt-1">{wishlist.length} ta mahsulot</p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
          >
            <ArrowLeft size={18} /> Mahsulotlar
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((product, idx) => {
            const name = product.nomi?.uz || product.nomi;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-50">
                    <img
                      src={product.img}
                      alt={name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromWishlist(product.id);
                        toast.success(t("removed_from_wishlist"));
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px] hover:text-blue-600 transition">
                      {name}
                    </h3>
                  </Link>
                  <p className="text-blue-600 font-bold mt-2">{product.narxi.toLocaleString()} so'm</p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                  >
                    <ShoppingBag size={16} /> {t("add_to_cart")}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WishlistPage;