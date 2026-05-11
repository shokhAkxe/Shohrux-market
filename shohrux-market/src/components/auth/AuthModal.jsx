import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Modal from "../common/Modal";

function AuthModal({ isLoginOpen, isRegisterOpen, onCloseLogin, onCloseRegister, onSwitchToRegister, onSwitchToLogin }) {
  const { t } = useTranslation();
  const { register, login, googleLogin } = useAuth();

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

  // Google login
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

  // Input style
  const inputStyle = "w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition";
  const buttonStyle = "w-full py-3 rounded-xl font-semibold transition disabled:opacity-50";
  const labelStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";

  // Password visibility toggle
  const PasswordInput = ({ value, onChange, placeholder, show, setShow }) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputStyle}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* LOGIN MODAL */}
      <Modal isOpen={isLoginOpen} onClose={onCloseLogin} title={t("login_title")}>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Email yoki Telefon"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className={inputStyle}
            autoFocus
          />
          <PasswordInput
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder={t("password")}
            show={showLoginPassword}
            setShow={setShowLoginPassword}
          />
          <button
            type="submit"
            disabled={loading}
            className={`${buttonStyle} bg-blue-600 text-white hover:bg-blue-700`}
          >
            {loading ? "Kutilmoqda..." : t("login")}
          </button>

          <button
            type="button"
            onClick={() => googleLoginHandler()}
            disabled={loading}
            className={`${buttonStyle} bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-3`}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            {t("google_login")}
          </button>

          <p className="text-center text-sm text-slate-500">
            {t("no_account")}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 font-medium ml-1 hover:underline"
            >
              {t("register_now")}
            </button>
          </p>
        </form>
      </Modal>

      {/* REGISTER MODAL */}
      <Modal isOpen={isRegisterOpen} onClose={onCloseRegister} title={t("register_title")}>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder={t("full_name")}
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            className={inputStyle}
          />
          <input
            type="email"
            placeholder={t("email")}
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            className={inputStyle}
          />
          <input
            type="tel"
            placeholder={t("phone")}
            value={regPhone}
            onChange={(e) => setRegPhone(e.target.value)}
            className={inputStyle}
          />
          <PasswordInput
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            placeholder={t("password")}
            show={showRegPassword}
            setShow={setShowRegPassword}
          />
          <PasswordInput
            value={regConfirmPassword}
            onChange={(e) => setRegConfirmPassword(e.target.value)}
            placeholder={t("confirm_password")}
            show={showRegConfirmPassword}
            setShow={setShowRegConfirmPassword}
          />
          <button
            type="submit"
            disabled={loading}
            className={`${buttonStyle} bg-emerald-600 text-white hover:bg-emerald-700`}
          >
            {loading ? "Kutilmoqda..." : t("register")}
          </button>

          <p className="text-center text-sm text-slate-500">
            {t("already_have_account")}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-emerald-600 font-medium ml-1 hover:underline"
            >
              {t("login_now")}
            </button>
          </p>
        </form>
      </Modal>
    </>
  );
}

export default AuthModal;