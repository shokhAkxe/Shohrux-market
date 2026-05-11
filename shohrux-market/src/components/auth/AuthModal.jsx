import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function AuthModal({ isLoginOpen, isRegisterOpen, onCloseLogin, onCloseRegister, onSwitchToRegister, onSwitchToLogin }) {
  const { t } = useTranslation();
  const { register, login, googleLogin } = useAuth();

  // Scroll lock
  useEffect(() => {
    if (isLoginOpen || isRegisterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoginOpen, isRegisterOpen]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // ========== GOOGLE LOGIN ==========
  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google response:", tokenResponse);
      setLoading(true);
      try {
        // MUHIM: access_token ni yuborish
        const result = await googleLogin(tokenResponse.access_token);
        if (result.success) {
          toast.success("Google orqali kirish muvaffaqiyatli!");
          onCloseLogin();
          onCloseRegister();
        }
      } catch (err) {
        console.error("Google login error:", err);
        toast.error("Google orqali kirishda xatolik");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      toast.error("Google login failed");
      setLoading(false);
    },
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

  // Modal styling
  const overlayStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  };

  const modalStyle = {
    background: "white",
    width: "100%",
    maxWidth: "400px",
    borderRadius: "16px",
    overflow: "hidden",
    maxHeight: "90vh",
    overflowY: "auto"
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

  const passwordWrapperStyle = {
    position: "relative",
    width: "100%",
    marginBottom: "12px"
  };

  const passwordIconStyle = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#94a3b8",
    background: "none",
    border: "none",
    padding: 0
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

  const formStyle = { padding: "20px" };

  return (
    <>
      {/* LOGIN MODAL */}
      <AnimatePresence>
        {isLoginOpen && (
          <div style={overlayStyle}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={modalStyle}
            >
              <div style={{ background: "#2563eb", padding: "24px 20px", textAlign: "center", position: "relative" }}>
                <button
                  onClick={onCloseLogin}
                  style={{ position: "absolute", right: "16px", top: "16px", background: "none", border: "none", color: "white", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
                <User size={40} style={{ color: "white", margin: "0 auto 8px" }} />
                <h2 style={{ color: "white", fontSize: "20px", fontWeight: "bold", margin: 0 }}>{t("login_title")}</h2>
              </div>
              
              <form onSubmit={handleLogin} style={formStyle}>
                <input
                  type="text"
                  placeholder="Email yoki Telefon"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
                <div style={passwordWrapperStyle}>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder={t("password")}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={passwordIconStyle}
                  >
                    {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
                  style={{
                    ...buttonStyle,
                    background: "white",
                    color: "#333",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: "18px", height: "18px" }} />
                  {t("google_login")}
                </button>
                
                <p style={{ textAlign: "center", fontSize: "14px", margin: 0 }}>
                  {t("no_account")}
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: "bold", marginLeft: "5px" }}
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
          <div style={overlayStyle}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={modalStyle}
            >
              <div style={{ background: "#059669", padding: "20px", textAlign: "center", position: "relative" }}>
                <button
                  onClick={onCloseRegister}
                  style={{ position: "absolute", right: "16px", top: "16px", background: "none", border: "none", color: "white", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
                <User size={36} style={{ color: "white", margin: "0 auto 8px" }} />
                <h2 style={{ color: "white", fontSize: "18px", fontWeight: "bold", margin: 0 }}>{t("register_title")}</h2>
              </div>
              
              <form onSubmit={handleRegister} style={formStyle}>
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
                <div style={passwordWrapperStyle}>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    placeholder={t("password")}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={passwordIconStyle}
                  >
                    {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div style={passwordWrapperStyle}>
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    placeholder={t("confirm_password")}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    style={passwordIconStyle}
                  >
                    {showRegConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...buttonStyle, background: "#059669" }}
                >
                  {loading ? "Kutilmoqda..." : t("register")}
                </button>
                
                <p style={{ textAlign: "center", fontSize: "14px", margin: 0 }}>
                  {t("already_have_account")}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    style={{ background: "none", border: "none", color: "#059669", cursor: "pointer", fontWeight: "bold", marginLeft: "5px" }}
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