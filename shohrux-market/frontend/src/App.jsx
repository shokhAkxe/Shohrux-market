import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context va Store
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useCartStore } from "./store/useCartStore";

// Layout komponentlar
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Modallar
import ProductModal from "./components/products/ProductModal";
import CartSidebar from "./components/cart/CartSidebar";
import CheckoutModal from "./components/checkout/CheckoutModal";
import AuthModal from "./components/auth/AuthModal";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

/**
 * AppContent alohida komponent sifatida: 
 * Bu yerda useAuth ishlaydi, chunki u AuthProvider ichida o'ralgan (pastga qarang).
 */
function AppContent() {
  // 1. AuthContext dan barcha kerakli holat va funksiyalarni olamiz
  const { 
    isAuthenticated, 
    openLogin, 
    openRegister, 
    isLoginOpen, 
    isRegisterOpen, 
    closeLogin, 
    closeRegister 
  } = useAuth();
  
  // 2. Store dan ma'lumotlar
  const { items, clearCart } = useCartStore();

  // 3. Lokal state-lar (Faqat UI modallar uchun)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 4. Jami narx hisoblash
  const totalPrice = items.reduce((s, i) => s + (i.narxi || 0) * (i.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Bildirishnomalar */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Navbar - proplarni to'g'ri nom bilan yuboramiz */}
      <Navbar
        setIsCartOpen={setIsCartOpen}
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
      />

      <main className="flex-1 mt-14 sm:mt-16 md:mt-20">
        <Routes>
          <Route path="/" element={<HomePage onProductClick={setSelectedProduct} />} />
          <Route path="/products" element={<ProductsPage onProductClick={setSelectedProduct} />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Profil sahifasi faqat login qilganlar uchun */}
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? <ProfilePage /> : <Navigate to="/" replace />
            } 
          />

          {/* Buyurtmalarim sahifasi faqat login qilganlar uchun */}
          <Route
            path="/my-orders"
            element={
              isAuthenticated ? <MyOrdersPage /> : <Navigate to="/" replace />
            }
          />

          {/* Buyurtma tafsilotlari sahifasi faqat login qilganlar uchun */}
          <Route
            path="/order/:orderId"
            element={
              isAuthenticated ? <OrderDetailsPage /> : <Navigate to="/" replace />
            }
          />

          {/* Bildirishnomalar sahifasi faqat login qilganlar uchun */}
          <Route
            path="/notifications"
            element={
              isAuthenticated ? <NotificationsPage /> : <Navigate to="/" replace />
            }
          />

          {/* Noma'lum sahifalar uchun redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* --- MODAL KOMPONENTLARI --- */}
      
      {/* 1. Mahsulot ko'rish modali */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onProductClick={setSelectedProduct}
        />
      )}

      {/* 2. Savatcha (Sidebar) */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 3. Buyurtma berish modali */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={items}
        totalPrice={totalPrice}
        clearCart={clearCart}
      />

      {/* 4. Login va Register modali (Context dan kelayotgan holat asosida) */}
      <AuthModal
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onCloseLogin={closeLogin}
        onCloseRegister={closeRegister}
        onSwitchToRegister={openRegister}
        onSwitchToLogin={openLogin}
      />
    </div>
  );
}

/**
 * Asosiy App komponenti:
 * Bu yerda Router va AuthProvider o'ralgan bo'lishi shart!
 */
function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;