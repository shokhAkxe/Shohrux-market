import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; // NavLink qo'shildi
import { useTranslation } from "react-i18next";
import { ShoppingCart, User, Heart, Menu, X, Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useAuth } from "../../context/AuthContext";

function Navbar({ setIsCartOpen, setIsLoginOpen, setIsRegisterOpen }) {
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
    { code: "uz", label: "O'zbekcha", name: "Uzb", flag: "🇺🇿" },
    { code: "en", label: "English", name: "Eng", flag: "🇺🇸" },
    { code: "ru", label: "Русский", name: "Rus", flag: "🇷🇺" },
  ];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsLangHover(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language);
  // Mobil menyu ochiqligida skrolni bloklash
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);
  // Navbar yashirinishi uchun holatlar
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 150) {
        setIsVisible(false); // Pastga tushganda yashirish
      } else {
        setIsVisible(true);  // Tepaga chiqqanda ko'rsatish
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Tarjimalar bilan boyitilgan menyu ro'yxati
 const navLinks = [
  { path: "/", label: t("Home") },
  { path: "/products", label: t("Products") },
  { path: "/wishlist", label: t("Wishlist") },
  { path: "/cart", label: t("Cart") }, // SHU QATOR BORLIGINI TEKSHIRING!
  { path: "/contact", label: t("Contact") },
];
  return (
    <>
    <motion.div
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -160 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      ></motion.div>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-base sm:text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap"
            >
              SHOHRUX MARKET
            </Link>

            {/* Desktop Navigation - NavLink bilan yangilandi */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative px-3 py-2 text-sm xl:text-base font-medium transition-all duration-300 rounded-lg
                    ${isActive ? "text-blue-600 bg-blue-50/50" : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {/* Savat yoki Yoqtirilganlar uchun sanagichlar */}
                      {link.path === "/wishlist" && wishlist.length > 0 && (
                        <span className="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full align-top">
                          {wishlist.length}
                        </span>
                      )}
                      {/* Aktiv chiziq - indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* O'ng tarafdagi tugmalar (Til, Profil, Savat) */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3">
              {/* Language Dropdown */}
              <div className="relative" onMouseEnter={() => setIsLangHover(true)} onMouseLeave={() => setIsLangHover(false)}>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all text-sm">
                  <span className="text-lg">{currentLang?.flag}</span>
                  <span className="font-medium text-xs">{currentLang?.name}</span>
                  <ChevronDown size={12} className={`transition-transform ${isLangHover ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isLangHover && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm ${
                            i18n.language === lang.code ? "bg-blue-50 text-blue-600" : ""
                          }`}
                        >
                          <span className="text-xl">{lang.flag}</span>
                          <span className="flex-1">{lang.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile/Auth Section */}
              {isAuthenticated ? (
                <div className="relative" onMouseEnter={() => setIsUserHover(true)} onMouseLeave={() => setIsUserHover(false)}>
                  <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium">
                    <User size={14} />
                    <span className="max-w-[80px] truncate">{user?.full_name?.split(" ")[0] || "Profile"}</span>
                    <ChevronDown size={10} className={`transition-transform ${isUserHover ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isUserHover && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
                      >
                        <button onClick={() => navigate("/profile")} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm">
                          <User size={14} /> {t("profile")}
                        </button>
                        <button onClick={logout} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 flex items-center gap-2 text-sm border-t">
                          <User size={14} /> {t("logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsLoginOpen(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition">
                    {t("login")}
                  </button>
                  <button onClick={() => setIsRegisterOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition shadow-md">
                    {t("register")}
                  </button>
                </div>
              )}

              {/* Cart Toggle Button */}
              <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl transition">
                <ShoppingCart size={16} />
                <span className="font-bold text-sm">{totalItems}</span>
              </button>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button onClick={() => setIsCartOpen(true)} className="relative p-1.5">
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100]" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 w-72 h-full bg-white z-[101] shadow-xl flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold text-lg">{t("menu")}</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-4 flex flex-col gap-2 overflow-y-auto">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between p-3 rounded-xl transition
                      ${isActive ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-100"}`
                    }
                  >
                    <span>{link.label}</span>
                    {link.path === "/wishlist" && wishlist.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{wishlist.length}</span>
                    )}
                  </NavLink>
                ))}

                {/* Mobile Language */}
                <div className="border-t my-2 pt-4">
                  <p className="text-xs text-slate-400 mb-2">{t("select_language")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { changeLanguage(lang.code); setIsMobileMenuOpen(false); }}
                        className={`py-2 rounded-xl text-xs flex flex-col items-center gap-1 ${
                          i18n.language === lang.code ? "bg-blue-600 text-white" : "bg-slate-100"
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Auth Section */}
                <div className="border-t mt-auto pt-4 pb-6">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.full_name?.[0] || <User size={20}/>}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-sm truncate">{user?.full_name}</p>
                          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <button onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }} className="w-full py-3 bg-slate-100 rounded-xl text-sm font-medium">
                        {t("profile")}
                      </button>
                      <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium">
                        {t("logout")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} className="flex-1 py-3 bg-slate-100 rounded-xl font-medium text-sm">
                        {t("login")}
                      </button>
                      <button onClick={() => { setIsRegisterOpen(true); setIsMobileMenuOpen(false); }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm">
                        {t("register")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;