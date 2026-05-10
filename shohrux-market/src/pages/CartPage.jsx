import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../context/AuthContext";

function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCartStore();
  const { isAuthenticated } = useAuth();

  const totalPrice = items.reduce((sum, item) => sum + item.narxi * (item.quantity || 1), 0);
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert("Iltimos, avval kiring!");
      return;
    }
    // Checkout modal yoki sahifasiga o'tish
    navigate("/");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingBag size={80} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("empty_cart")}</h2>
          <p className="text-slate-500 mb-6">Savatda hech qanday mahsulot yo'q</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Mahsulotlarni ko'rish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={20} /> Orqaga
        </button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6">{t("cart")} ({totalItems} ta)</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const name = item.nomi?.uz || item.nomi;
              return (
                <div key={item.id} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm">
                  <img src={item.img} alt={name} className="w-20 h-20 object-contain bg-slate-50 rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{name}</h3>
                    <p className="text-blue-600 font-bold">{item.narxi.toLocaleString()} so'm</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-medium w-8 text-center">{item.quantity || 1}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-4">Buyurtma xulosa</h2>
            <div className="space-y-3 border-b pb-4 mb-4">
              {items.map((item) => {
                const name = item.nomi?.uz || item.nomi;
                const subtotal = item.narxi * (item.quantity || 1);
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{name} x{item.quantity || 1}</span>
                    <span>{subtotal.toLocaleString()} so'm</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>{t("total")}</span>
              <span className="text-blue-600">{totalPrice.toLocaleString()} so'm</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
            >
              {t("checkout")}
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-3 py-2 text-red-500 hover:underline text-sm"
            >
              {t("clear")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;