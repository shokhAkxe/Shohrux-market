import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function AuthModal({ isLoginOpen, isRegisterOpen, onCloseLogin, onCloseRegister, onSwitchToRegister, onSwitchToLogin }) {
  const { t } = useTranslation();
  const { register, login, googleLogin } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);

  // ========== GOOGLE LOGIN ==========
  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const result = await googleLogin(tokenResponse.access_token);
      setLoading(false);
      if (result.success) {
        onCloseLogin();
        onCloseRegister();
      }
    },
    onError: () => {
      toast.error('Google login failed');
      setLoading(false);
    }
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error(t("fill_all_fields"));
      return;
    }
    setLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoading(false);
    if (res.success) {
      setLoginEmail("");
      setLoginPassword("");
      onCloseLogin();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPassword) {
      toast.error(t("fill_all_fields"));
      return;
    }
    if (regPassword !== regConfirmPassword) {
      toast.error(t("passwords_not_match"));
      return;
    }
    setLoading(true);
    const res = await register({
      full_name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    });
    setLoading(false);
    if (res.success) {
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");
      setRegConfirmPassword("");
      onCloseRegister();
    }
  };

  const modalStyle = {
    background: "white",
    width: "100%",
    maxWidth: "400px",
    borderRadius: "16px",
    overflow: "hidden"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxSizing: "border-box",
    fontSize: "16px",
    outline: "none"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "12px"
  };

  return (
    <>
      {/* LOGIN MODAL */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              style={modalStyle}
            >
              <div className="bg-blue-600 p-6 text-center relative">
                <button onClick={onCloseLogin} className="absolute right-4 top-4 text-white">
                  <X size={20} />
                </button>
                <User size={40} className="text-white mx-auto mb-2" />
                <h2 className="text-white text-xl font-bold">{t("login_title")}</h2>
              </div>
              
              <form onSubmit={handleLogin} className="p-5">
                <input
                  type="text"
                  placeholder="Email yoki Telefon"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
                <input
                  type="password"
                  placeholder={t("password")}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...buttonStyle, background: "#2563eb" }}
                >
                  {loading ? "Kutilmoqda..." : t("login")}
                </button>
                
                {/* GOOGLE LOGIN BUTTON */}
                <button
                  type="button"
                  onClick={() => googleLoginHandler()}
                  disabled={loading}
                  className="w-full py-3 bg-white border border-gray-300 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition mb-3"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  <span>{t("google_login")}</span>
                </button>
                
                <p className="text-center text-sm">
                  {t("no_account")}
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-blue-600 font-bold ml-1 hover:underline"
                  >
                    {t("register_now")}
                  </button>
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REGISTER MODAL */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              style={{ ...modalStyle, maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="bg-emerald-600 p-5 text-center relative">
                <button onClick={onCloseRegister} className="absolute right-4 top-4 text-white">
                  <X size={20} />
                </button>
                <User size={36} className="text-white mx-auto mb-2" />
                <h2 className="text-white text-lg font-bold">{t("register_title")}</h2>
              </div>
              
              <form onSubmit={handleRegister} className="p-5">
                <input
                  type="text"
                  placeholder={t("full_name")}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder={t("email")}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="tel"
                  placeholder={t("phone")}
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder={t("password")}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder={t("confirm_password")}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...buttonStyle, background: "#059669" }}
                >
                  {loading ? "Kutilmoqda..." : t("register")}
                </button>
                
                <p className="text-center text-sm">
                  {t("already_have_account")}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-emerald-600 font-bold ml-1 hover:underline"
                  >
                    {t("login_now")}
                  </button>
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AuthModal;