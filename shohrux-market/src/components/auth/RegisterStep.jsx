import { useState, useEffect } from "react";
import { X, User, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

function RegisterStep({ isOpen, onClose, onSwitch, handleRegister, loading, styles }) {
  const { t } = useTranslation();
  
  // Barcha maydonlar bitta obyektda
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: ""
  });
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Modal ochilganda yoki yopilganda formani tozalash
  useEffect(() => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirm: ""
    });
    setShowPass(false);
    setShowConfirm(false);
  }, [isOpen]);

  const submit = (e) => {
    e.preventDefault();
    handleRegister(formData);
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
        <div style={{ background: "#059669", padding: "20px", textAlign: "center", position: "relative" }}>
          <button
            onClick={onClose}
            style={{ position: "absolute", right: "16px", top: "16px", background: "none", border: "none", color: "white", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
          <User size={36} style={{ color: "white", margin: "0 auto 8px" }} />
          <h2 style={{ color: "white", fontSize: "18px", fontWeight: "bold", margin: 0 }}>{t("register_title")}</h2>
        </div>
        
        <form onSubmit={submit} style={styles.formStyle} autoComplete="off">
          <input
            type="text"
            placeholder={t("full_name")}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={styles.inputStyle}
            autoComplete="off"
          />
          <input
            type="email"
            placeholder={t("email")}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={styles.inputStyle}
            autoComplete="off"
          />
          <input
            type="tel"
            placeholder={t("phone")}
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            style={styles.inputStyle}
            autoComplete="off"
          />
          
          <div style={styles.passwordWrapperStyle}>
            <input
              type={showPass ? "text" : "password"}
              placeholder={t("password")}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ ...styles.inputStyle, marginBottom: 0 }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={styles.passwordIconStyle}
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div style={styles.passwordWrapperStyle}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder={t("confirm_password")}
              value={formData.confirm}
              onChange={(e) => setFormData({...formData, confirm: e.target.value})}
              style={{ ...styles.inputStyle, marginBottom: 0 }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={styles.passwordIconStyle}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.buttonStyle, background: "#059669" }}
          >
            {loading ? "Kutilmoqda..." : t("register")}
          </button>
          
          <p style={{ textAlign: "center", fontSize: "14px", margin: 0 }}>
            {t("already_have_account")}
            <button
              type="button"
              onClick={onSwitch}
              style={{ background: "none", border: "none", color: "#059669", cursor: "pointer", fontWeight: "bold", marginLeft: "5px" }}
            >
              {t("login_now")}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default RegisterStep;