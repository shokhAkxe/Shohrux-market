import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ShoppingBag, Star, Minus, Plus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import products from "../data/products";
import toast from "react-hot-toast";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();

  const product = products.find(p => p.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Mahsulot topilmadi</h2>
          <button onClick={() => navigate("/")} className="mt-4 text-blue-600">Bosh sahifaga qaytish</button>
        </div>
      </div>
    );
  }

  const isInWishlist = wishlist.some((item) => item.id === product.id);
  const productName = product.nomi?.[t("language")] || product.nomi?.uz || product.nomi;
  const productDesc = product.desc?.[t("language")] || product.desc?.uz || product.desc;
  const productSpecs = product.specs?.[t("language")] || product.specs?.uz || [];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`${quantity} ${t("added_to_cart")}`);
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={20} /> Orqaga
        </button>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl overflow-hidden shadow-lg">
          {/* Image */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 p-8">
            <img
              src={product.img}
              alt={productName}
              className="w-full h-96 object-contain"
            />
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-600 text-sm font-bold bg-blue-100 px-3 py-1 rounded-full">
                {product.brand?.toUpperCase()}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-3">{productName}</h1>
            <p className="text-3xl font-black text-blue-600 mb-4">
              {product.narxi.toLocaleString()} so'm
            </p>
            <p className="text-slate-600 mb-6 leading-relaxed">{productDesc}</p>

            {productSpecs.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">{t("product_features")}</h3>
                <ul className="space-y-2">
                  {productSpecs.map((spec, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span> {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-6">
              <p className="font-medium mb-2">{t("quantity")}</p>
              <div className="flex items-center gap-3 bg-slate-100 rounded-2xl p-1 w-fit">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <ShoppingBag size={18} /> {t("add_to_cart")} ({quantity})
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`px-5 rounded-xl border-2 transition ${
                  isInWishlist ? "border-red-500 bg-red-50 text-red-500" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Heart size={22} className={isInWishlist ? "fill-red-500" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;