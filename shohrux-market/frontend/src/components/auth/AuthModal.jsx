import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import LoginStep from "./LoginStep";
import RegisterStep from "./RegisterStep";

function AuthModal({ isLoginOpen, isRegisterOpen, onCloseLogin, onCloseRegister, onSwitchToRegister, onSwitchToLogin }) {
  const { t } = useTranslation();
  const { register, login, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  // 1. SCROLL LOCK
  useEffect(() => {
    document.body.style.overflow = (isLoginOpen || isRegisterOpen) ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isLoginOpen, isRegisterOpen]);

  // 2. GOOGLE LOGIN — credentialResponse.credential bu ID Token (backend kutayotgan narsa)
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const result = await googleLogin(credentialResponse);
      if (result.success) {
        onCloseLogin();
        onCloseRegister();
      }
    } catch (err) {
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google orqali kirishda xatolik");
  };

  // 3. LOGIN MANTIQI
  const handleLogin = async (email, password) => {
    if (!email || !password) return toast.error(t("fill_all_fields"));
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      onCloseLogin();
    }
  };

  // 4. REGISTER MANTIQI
  const handleRegister = async (data) => {
    if (!data.name || !data.email || !data.password) return toast.error(t("fill_all_fields"));
    if (data.password !== data.confirm) return toast.error(t("passwords_not_match"));
    setLoading(true);
    const res = await register({
      full_name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password
    });
    setLoading(false);
    if (res.success) {
      onCloseRegister();
    }
  };

  // STYLES
  const styles = {
    overlayStyle: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalStyle: { background: "white", width: "100%", maxWidth: "400px", borderRadius: "16px", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" },
    inputStyle: { width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #e2e8f0", borderRadius: "12px", boxSizing: "border-box", fontSize: "16px", outline: "none" },
    passwordWrapperStyle: { position: "relative", width: "100%", marginBottom: "12px" },
    passwordIconStyle: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#94a3b8", background: "none", border: "none", padding: 0 },
    buttonStyle: { width: "100%", padding: "12px", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginBottom: "12px" },
    formStyle: { padding: "20px" }
  };

  // Google Login tugmasi — LoginStep va RegisterStep ga prop sifatida beramiz
  const googleButton = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        width={360}
        text="signin_with"
        shape="rectangular"
        theme="outline"
      />
    </div>
  );

  return (
    <AnimatePresence>
      {isLoginOpen && (
        <LoginStep
          key="login-modal"
          isOpen={isLoginOpen}
          onClose={onCloseLogin}
          onSwitch={onSwitchToRegister}
          handleLogin={handleLogin}
          googleButton={googleButton}
          loading={loading}
          styles={styles}
        />
      )}
      {isRegisterOpen && (
        <RegisterStep
          key="register-modal"
          isOpen={isRegisterOpen}
          onClose={onCloseRegister}
          onSwitch={onSwitchToLogin}
          handleRegister={handleRegister}
          googleButton={googleButton}
          loading={loading}
          styles={styles}
        />
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
