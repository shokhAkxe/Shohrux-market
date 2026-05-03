import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, User, Heart, Menu, X, LogOut, Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useAuthStore } from "../store/useAuthStore";
import WishlistModal from "./WishlistModal";

function Navbar({ setIsCartOpen, setIsLoginOpen, setIsRegisterOpen, setIsProfileOpen }) {
  const { t, i18n } = useTranslation();
  const { items } = useCartStore();
  const { wishlist } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangHover, setIsLangHover] = useState(false);
  const [isUserHover, setIsUserHover] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const languages = [
    { code: "uz", label: "O'zbekcha", flag: "Uz" },
    { code: "en", label: "English", flag: "Eng" },
    { code: "ru", label: "Русский", flag: "Ru" },
  ];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsLangHover(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <h1
              onClick={() => window.location.reload()}
              className="text-xl sm:text-2xl font-black tracking-tighter cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              SHOHRUX MARKET
            </h1>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Dropdown - HOVER bilan */}
              <div
                className="relative"
                onMouseEnter={() => setIsLangHover(true)}
                onMouseLeave={() => setIsLangHover(false)}
              >
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-200">
                  <Globe size={18} />
                  <span className="text-lg">{currentLang?.flag}</span>
                  <span className="text-sm font-medium">{currentLang?.label}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isLangHover ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isLangHover && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                    >
                      {languages.map((lang, idx) => (
                        <motion.button
                          key={lang.code}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-all duration-200 flex items-center gap-3 text-sm ${
                            i18n.language === lang.code ? "bg-blue-50 text-blue-600" : ""
                          }`}
                        >
                          <span className="text-xl">{lang.flag}</span>
                          <span className="flex-1">{lang.label}</span>
                          {i18n.language === lang.code && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-blue-600 rounded-full"
                            />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Heart size={22} />
                {wishlist.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </motion.button>

              {/* Auth or Profile - HOVER bilan */}
              {isAuthenticated ? (
                <div
                  className="relative"
                  onMouseEnter={() => setIsUserHover(true)}
                  onMouseLeave={() => setIsUserHover(false)}
                >
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium">
                    <User size={18} />
                    <span>{user?.full_name?.split(" ")[0] || "Profile"}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${isUserHover ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isUserHover && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                      >
                        <button
                          onClick={() => {
                            setIsProfileOpen(true);
                            setIsUserHover(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-all flex items-center gap-3"
                        >
                          <User size={16} /> {t("profile")}
                        </button>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-500 transition-all flex items-center gap-3 border-t"
                        >
                          <LogOut size={16} /> {t("logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsLoginOpen(true)}
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all"
                  >
                    {t("login")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    {t("register")}
                  </motion.button>
                </div>
              )}

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-all"
              >
                <ShoppingCart size={20} />
                <motion.span
                  key={totalItems}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="font-bold"
                >
                  {totalItems}
                </motion.span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="relative p-2"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-xl"
              >
                <Menu size={24} />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 w-[80%] max-w-sm h-full bg-white z-[101] shadow-xl"
            >
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="font-bold text-xl">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X size={24} />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4 overflow-y-auto h-[calc(100%-70px)]">
                {isAuthenticated ? (
                  <div className="pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{user?.full_name || user?.email}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="mt-3 w-full py-2 bg-slate-100 rounded-xl text-sm font-medium"
                    >
                      {t("profile")}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 pb-4 border-b">
                    <button
                      onClick={() => {
                        setIsLoginOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 py-2.5 bg-slate-100 rounded-xl font-medium"
                    >
                      {t("login")}
                    </button>
                    <button
                      onClick={() => {
                        setIsRegisterOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium"
                    >
                      {t("register")}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsWishlistOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <Heart size={20} /> {t("wishlist")} ({wishlist.length})
                </button>

                <div className="pt-4 border-t">
                  <p className="text-xs text-slate-400 mb-3">{t("language")}</p>
                  <div className="flex gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex-1 py-2 rounded-xl text-sm flex items-center justify-center gap-1 transition-all ${
                          i18n.language === lang.code
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 hover:bg-slate-200"
                        }`}
                      >
                        {lang.flag} {lang.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-red-50 text-red-500 rounded-xl mt-4 transition-all"
                  >
                    <LogOut size={20} /> {t("logout")}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
}

export default Navbar;