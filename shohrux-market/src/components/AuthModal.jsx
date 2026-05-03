import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, Lock, User, Chrome } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

function AuthModal({ isLoginOpen, isRegisterOpen, onCloseLogin, onCloseRegister, onSwitchToRegister, onSwitchToLogin }) {
  const { t } = useTranslation();
  const { register, login, googleLogin } = useAuthStore();

  const [loginData, setLoginData] = useState({ emailOrPhone: "", password: "" });
  const [registerData, setRegisterData] = useState({ full_name: "", email: "", phone: "", password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.emailOrPhone || !loginData.password) {
      toast.error(t("fill_all_fields"));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = login(loginData.emailOrPhone, loginData.password);
      if (res.success) {
        toast.success(t("login_success"));
        onCloseLogin();
      } else {
        toast.error(res.error);
      }
      setLoading(false);
    }, 500);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerData.full_name || !registerData.email || !registerData.phone || !registerData.password) {
      toast.error(t("fill_all_fields"));
      return;
    }
    if (registerData.password !== registerData.confirm_password) {
      toast.error(t("passwords_not_match"));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = register(registerData);
      if (res.success) {
        toast.success(t("register_success"));
        onCloseRegister();
      } else {
        toast.error(res.error);
      }
      setLoading(false);
    }, 500);
  };

  const handleGoogle = () => {
    googleLogin({ id: "google123", name: "Google User", email: "user@gmail.com" });
    toast.success(t("login_success"));
    onCloseLogin();
  };

  const LoginModal = () => (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
        <div className="bg-blue-600 px-5 py-6 text-center relative">
          <button onClick={onCloseLogin} className="absolute right-4 top-4 text-white/70"><X size={20} /></button>
          <User size={40} className="text-white mx-auto mb-2" />
          <h2 className="text-white font-bold text-xl">{t("login_title")}</h2>
        </div>
        <form onSubmit={handleLogin} className="p-5 space-y-4">
          <input type="text" placeholder="Email yoki Telefon" value={loginData.emailOrPhone} onChange={(e) => setLoginData({ ...loginData, emailOrPhone: e.target.value })} className="w-full p-3 border rounded-xl" />
          <input type="password" placeholder={t("password")} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="w-full p-3 border rounded-xl" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold">{loading ? <div className="loader mx-auto" /> : t("login")}</button>
          <button type="button" onClick={handleGoogle} className="w-full py-3 border rounded-xl flex items-center justify-center gap-2"><Chrome size={20} /> {t("google_login")}</button>
          <p className="text-center text-sm">{t("no_account")} <button type="button" onClick={onSwitchToRegister} className="text-blue-600"> {t("register_now")}</button></p>
        </form>
      </motion.div>
    </div>
  );

  const RegisterModal = () => (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-emerald-600 px-5 py-5 text-center relative">
          <button onClick={onCloseRegister} className="absolute right-4 top-4 text-white/70"><X size={20} /></button>
          <User size={36} className="text-white mx-auto mb-1" />
          <h2 className="text-white font-bold text-lg">{t("register_title")}</h2>
        </div>
        <form onSubmit={handleRegister} className="p-5 space-y-3">
          <input type="text" placeholder={t("full_name")} value={registerData.full_name} onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })} className="w-full p-3 border rounded-xl" />
          <input type="email" placeholder={t("email")} value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} className="w-full p-3 border rounded-xl" />
          <input type="tel" placeholder={t("phone")} value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} className="w-full p-3 border rounded-xl" />
          <input type="password" placeholder={t("password")} value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} className="w-full p-3 border rounded-xl" />
          <input type="password" placeholder={t("confirm_password")} value={registerData.confirm_password} onChange={(e) => setRegisterData({ ...registerData, confirm_password: e.target.value })} className="w-full p-3 border rounded-xl" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold">{loading ? <div className="loader mx-auto" /> : t("register")}</button>
          <button type="button" onClick={handleGoogle} className="w-full py-3 border rounded-xl flex items-center justify-center gap-2"><Chrome size={20} /> {t("google_login")}</button>
          <p className="text-center text-sm">{t("already_have_account")} <button type="button" onClick={onSwitchToLogin} className="text-emerald-600"> {t("login_now")}</button></p>
        </form>
      </motion.div>
    </div>
  );

  return (
    <>
      <AnimatePresence>{isLoginOpen && <LoginModal />}</AnimatePresence>
      <AnimatePresence>{isRegisterOpen && <RegisterModal />}</AnimatePresence>
    </>
  );
}

export default AuthModal;