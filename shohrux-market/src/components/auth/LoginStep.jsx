import { useState, useEffect } from "react";
import { X, User, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

function LoginStep({ isOpen, onClose, onSwitch, handleLogin, googleLoginHandler, loading, styles }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Modal holati o'zgarganda (ochilganda yoki yopilganda) hamma narsani tozalaymiz
  useEffect(() => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }, [isOpen]);

  const submit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlayStyle}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={styles.modalStyle}
      >
        {/* Sarlavha (Header) */}
        <div style={{ background: "#2563eb", padding: "24px 20px", textAlign: "center", position: "relative" }}>
          <button
            onClick={onClose}
            style={{ position: "absolute", right: "16px", top: "16px", background: "none", border: "none", color: "white", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
          <User size={40} style={{ color: "white", margin: "0 auto 8px" }} />
          <h2 style={{ color: "white", fontSize: "20px", fontWeight: "bold", margin: 0 }}>{t("login_title")}</h2>
        </div>
        
        {/* Forma qismi */}
        <form onSubmit={submit} style={styles.formStyle} autoComplete="off">
          <input
            type="text"
            placeholder={t("email_or_phone")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.inputStyle}
            autoFocus
            autoComplete="one-time-code" 
          />
          
          <div style={styles.passwordWrapperStyle}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...styles.inputStyle, marginBottom: 0 }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.passwordIconStyle}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.buttonStyle, background: "#2563eb" }}
          >
            {loading ? "Kutilmoqda..." : t("login")}
          </button>
          
          <button
            type="button"
            onClick={() => googleLoginHandler()}
            disabled={loading}
            style={{
              ...styles.buttonStyle,
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
              onClick={onSwitch}
              style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: "bold", marginLeft: "5px" }}
            >
              {t("register_now")}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default LoginStep;