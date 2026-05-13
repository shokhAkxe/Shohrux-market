import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useAuth } from "../../context/AuthContext";

function Navbar({ isCartOpen, setIsCartOpen, onLoginClick, onRegisterClick }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { wishlist } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangHover, setIsLangHover] = useState(false);
  const [isUserHover, setIsUserHover] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const languages = [
    { code: "uz", label: "O'zbekcha", name: "Uzb", flag: "Uz" },
    { code: "en", label: "English", name: "Eng", flag: "Us" },
    { code: "ru", label: "Русский", name: "Rus", flag: "Ru" },
  ];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsLangHover(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language);

  // Scroll Lock - Modal ochiqligida orqa fonni qotiradi
  useEffect(() => {
    const shouldLock = isMobileMenuOpen || (typeof isCartOpen !== 'undefined' && isCartOpen);
    if (shouldLock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen, isCartOpen]);

  const navLinks = [
    { path: "/", label: t("Home") || "Bosh sahifa" },
    { path: "/products", label: t("Products") || "Mahsulotlar" },
    { path: "/wishlist", label: t("Wishlist") || "Sevimlilar" },
    { path: "/about", label: t("About_Us") || "Biz haqimizda" }, 
    { path: "/contact", label: t("Contact") || "Aloqa" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        {/* max-w-7xl markazga yig'adi, lekin px-4 oraliqni normallashtiradi */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 md:h-20 gap-2">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap shrink-0"
            >
              SHOHRUX MARKET
            </Link>

            {/* Desktop Menyu - justify-center markazda saqlaydi */}
            <div className="hidden lg:flex items-center justify-center flex-1 gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative px-2.5 py-2 text-sm xl:text-[15px] font-medium transition-all rounded-lg whitespace-nowrap
                    ${isActive ? "text-blue-600 bg-blue-50/50" : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {link.path === "/wishlist" && wishlist.length > 0 && (
                        <span className="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full align-top">
                          {wishlist.length}
                        </span>
                      )}
                      {isActive && (
                        <motion.div layoutId="nav-underline" className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* O'ng tarafdagi tugmalar - gap-2 qilib yaqinlashtirildi */}
            <div className="hidden lg:flex items-center justify-end gap-2 flex-nowrap shrink-0">
              
              {/* Til tanlash */}
              <div className="relative" onMouseEnter={() => setIsLangHover(true)} onMouseLeave={() => setIsLangHover(false)}>
                <button className="flex items-center gap-1.5 px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all text-sm">
                  <span className="text-base">{currentLang?.flag}</span>
                  <span className="font-medium text-[12px]">{currentLang?.name}</span>
                  <ChevronDown size={12} className={`transition-transform ${isLangHover ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isLangHover && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border overflow-hidden z-50">
                      {languages.map((lang) => (
                        <button key={lang.code} onClick={() => changeLanguage(lang.code)}
                          className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm ${i18n.language === lang.code ? "bg-blue-50 text-blue-600" : ""}`}>
                          <span className="text-xl">{lang.flag}</span> <span className="flex-1">{lang.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Kirish / Ro'yxatdan o'tish */}
              <div className="flex items-center gap-1.5 flex-nowrap">
                {isAuthenticated ? (
                  <div className="relative" onMouseEnter={() => setIsUserHover(true)} onMouseLeave={() => setIsUserHover(false)}>
                    <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium whitespace-nowrap">
                      <User size={14} />
                      <span className="max-w-[80px] truncate">{user?.full_name?.split(" ")[0]}</span>
                      <ChevronDown size={10} className={`transition-transform ${isUserHover ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isUserHover && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border overflow-hidden z-50">
                          <button onClick={() => { navigate("/profile"); setIsUserHover(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm"><User size={14} /> {t("profile")}</button>
                          <button onClick={() => { logout(); setIsUserHover(false); }} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 flex items-center gap-2 text-sm border-t"><User size={14} /> {t("logout")}</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <button onClick={onLoginClick} className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[13px] font-medium transition whitespace-nowrap">
                      {t("login")}
                    </button>
                    <button onClick={onRegisterClick} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-medium transition shadow-md whitespace-nowrap">
                      {t("register")}
                    </button>
                  </>
                )}
              </div>

              {/* Savat tugmasi */}
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl transition shrink-0"
              >
                <ShoppingCart size={16} />
                <span className="font-bold text-sm">{totalItems}</span>
              </button>
            </div>

            {/* Mobile Trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button onClick={() => setIsCartOpen(true)} className="relative p-1.5">
                <ShoppingCart size={22} />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center">{totalItems}</span>}
              </button>
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <Menu size={24} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Sidebar (O'zgarishsiz) */}
        <AnimatePresence>
  {isMobileMenuOpen && (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setIsMobileMenuOpen(false)} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="fixed right-0 top-0 w-72 h-full bg-white z-[101] shadow-xl"
      >
        <div className="flex justify-between items-center p-4 border-b">
          {/* Menu so'zi tarjima qilindi */}
          <h2 className="font-bold text-lg">{t("menu")}</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
            <X size={22} />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-2 overflow-y-auto h-[calc(100%-60px)]">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 hover:bg-slate-100 rounded-xl transition"
            >
              <span>{link.label}</span>
              {link.path === "/cart" && totalItems > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{totalItems}</span>
              )}
              {link.path === "/wishlist" && wishlist.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{wishlist.length}</span>
              )}
            </Link>
          ))}

          {/* Mobile Language Selection */}
          <div className="border-t my-2 pt-4">
            {/* Til tanlash so'zi tarjima qilindi */}
            <p className="text-xs text-slate-400 mb-2">{t("select_language")}</p>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { changeLanguage(lang.code); setIsMobileMenuOpen(false); }}
                  className={`flex-1 py-2 rounded-xl text-sm flex items-center justify-center gap-2 ${
                    i18n.language === lang.code ? "bg-blue-600 text-white" : "bg-slate-100"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {isAuthenticated ? (
            <>
              <div className="border-t pt-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm truncate">{user?.full_name || user?.email}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }} className="w-full py-2.5 bg-slate-100 rounded-xl text-sm font-medium">
                  {/* Profil so'zi tarjima qilindi */}
                  {t("profile")}
                </button>
              </div>
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-500 rounded-xl mt-2">
                {/* Chiqish so'zi tarjima qilindi */}
                <User size={18} /> {t("logout")}
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-4 border-t">
              {/* onLoginClick va onRegisterClick ishlatildi, tarjimalar qo'shildi */}
              <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-medium text-sm">
                {t("login")}
              </button>
              <button onClick={() => { onRegisterClick(); setIsMobileMenuOpen(false); }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm">
                {t("register")}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
    </>
  );
}

export default Navbar;