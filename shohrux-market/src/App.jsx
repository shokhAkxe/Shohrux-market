import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "./store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { sendOrderToTelegram } from './telegram'; // Telegram funksiyasini import qildik

function App() {
  const { t, i18n } = useTranslation();
  const { items, addToCart, removeFromCart, clearCart } = useCartStore();
  const [search, setSearch] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- TELEGRAMGA YUBORISH FUNKSIYASI ---
  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Test uchun mijoz ma'lumotlari
    const customerInfo = {
      name: "Shohrux (Saytdan test)",
      phone: "+998 00 000 00 00",
      address: "Urganch shahar"
    };

    const success = await sendOrderToTelegram(items, totalPrice, customerInfo);

    if (success) {
      alert("Buyurtma botga yuborildi! ✅");
      clearCart(); // Savatchani tozalash
      setIsCartOpen(false); // Savatchani yopish
    } else {
      alert("Xatolik yuz berdi! ❌");
    }
  };

  const products = [
    { id: 1, nomi: "iPhone 15 Pro", narxi: 14500000, img: "/image/iphone 15 pro.jpg", cat: "phone" },
    { id: 2, nomi: "Samsung S24 Ultra", narxi: 13200000, img: "/image/samsung s 24 ultra.jpg", cat: "phone" },
    { id: 3, nomi: "MacBook Pro M3", narxi: 22000000, img: "/image/macbuk m3 pro.jpg", cat: "laptop" },
    { id: 4, nomi: "AirPods Pro 2", narxi: 3200000, img: "/image/air pods.jpg", cat: "accessory" },
    { id: 5, nomi: "Apple Watch 9", narxi: 5800000, img: "/image/watch.jpg", cat: "accessory" },
    { id: 6, nomi: "HP Victus Gaming", narxi: 10500000, img: "/image/hp.jpg", cat: "laptop" }
  ];

  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalPrice = items.reduce((a, b) => a + (b.narxi * (b.quantity || 1)), 0);

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1, 
      y: 0,
      transition: {
        delay: i * 0.12,
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1] 
      }
    }),
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      transition: { duration: 0.4 } 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="backdrop-blur-md bg-white/80 sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic tracking-tighter"
          >
            SHOHRUX AI
          </motion.h1>
          
          <div className="flex items-center gap-4">
            <select 
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)} 
              className="bg-slate-100 p-2 rounded-xl text-xs font-bold cursor-pointer outline-none border-none shadow-sm"
            >
              <option value="uz">O'ZBEK</option>
              <option value="en">ENGLISH</option>
              <option value="ru">РУССКИЙ</option>
            </select>
            
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-3 bg-blue-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="text-lg">🛒</span>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={totalItems}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="font-bold border-l border-blue-400 pl-2"
                >
                  {totalItems}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="py-16 px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl font-black mb-8 text-slate-800 leading-tight"
        >
          {t('welcome')}
        </motion.h2>
        <div className="max-w-xl mx-auto relative">
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="w-full p-5 rounded-[30px] bg-white border border-slate-100 shadow-2xl outline-none focus:ring-4 ring-blue-50 transition-all text-center text-lg"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* --- MAHSULOTLAR RO'YXATI --- */}
      <main className="max-w-7xl mx-auto p-6 pb-24">
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10"
        >
          <AnimatePresence mode="popLayout">
            {products
              .filter(p => p.nomi.toLowerCase().includes(search.toLowerCase()))
              .map((product, index) => (
                <motion.div 
                  key={product.id}
                  layout
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white p-5 rounded-[45px] shadow-sm hover:shadow-2xl transition-shadow border border-slate-100 group flex flex-col h-full"
                >
                  <div className="overflow-hidden rounded-[35px] mb-6 h-72 w-full bg-slate-50 relative border border-slate-50">
                    <img 
                      src={product.img} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
                      alt={product.nomi}
                    />
                  </div>
                  
                  <div className="px-3 flex-1">
                    <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-4 py-2 rounded-full uppercase tracking-[0.2em]">
                      {t(product.cat)}
                    </span>
                    <h3 className="text-2xl font-bold mt-4 text-slate-800 tracking-tight italic">
                      {product.nomi}
                    </h3>
                    <p className="text-emerald-500 text-sm mt-2 mb-8 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> {t('stock')}
                    </p>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded-[30px] shadow-lg mt-auto">
                    <span className="text-xl font-black text-white ml-4 tracking-tighter">
                      {product.narxi.toLocaleString()} <span className="text-[10px] text-slate-400">SO'M</span>
                    </span>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => addToCart(product)} 
                      className="bg-blue-600 text-white w-14 h-14 rounded-[22px] flex items-center justify-center text-3xl shadow-lg hover:bg-white hover:text-blue-600 transition-colors"
                    >
                      +
                    </motion.button>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* --- SIDEBAR SAVATCHA --- */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
              onClick={() => setIsCartOpen(false)}
            />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full p-10 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-black italic tracking-tighter text-slate-800 uppercase">{t('cart')}</h2>
                <motion.button 
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => setIsCartOpen(false)} 
                  className="text-2xl p-3 bg-slate-50 rounded-full"
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {items.length === 0 ? (
                  <div className="text-center py-20 opacity-20">
                    <span className="text-8xl">🛒</span>
                    <p className="mt-4 font-bold uppercase tracking-widest">{t('empty_cart')}</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={item.id} 
                      className="flex gap-5 bg-slate-50 p-4 rounded-[35px] items-center border border-slate-100"
                    >
                      <img src={item.img} className="w-20 h-20 bg-white rounded-2xl object-cover shadow-sm" alt="" />
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 leading-tight">
                          {item.nomi} <span className="text-blue-600 ml-2">x{item.quantity}</span>
                        </p>
                        <p className="text-blue-600 font-black text-sm mt-1">
                          {(item.narxi * (item.quantity || 1)).toLocaleString()} so'm
                        </p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-2 hover:text-red-600 transition-colors">🗑️</button>
                    </motion.div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-10">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">{t('total')}:</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{totalPrice.toLocaleString()} so'm</span>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout} // <--- Telegram funksiyasini shu yerga bog'ladik
                    className="w-full bg-blue-600 text-white py-6 rounded-[28px] font-black text-xl shadow-2xl shadow-blue-100 uppercase tracking-widest"
                  >
                    {t('buy')} 🚀
                  </motion.button>

                  <motion.button 
                    whileHover={{ color: "#ef4444" }}
                    onClick={clearCart} 
                    className="w-full mt-6 text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>🧹</span> {t('clear')}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;