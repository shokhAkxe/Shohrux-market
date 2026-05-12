import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Logout eventini eshitish va modalni yopish
  useEffect(() => {
    const handleCloseModals = () => {
      setIsLoginOpen(false);
      setIsRegisterOpen(false);
    };

    window.addEventListener("closeAllModals", handleCloseModals);
    
    return () => {
      window.removeEventListener("closeAllModals", handleCloseModals);
    };
  }, []);

  const openLogin = useCallback(() => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
  }, []);

  const openRegister = useCallback(() => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
  }, []);

  const closeModals = useCallback(() => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isLoginOpen,
        isRegisterOpen,
        openLogin,
        openRegister,
        closeModals,
        setIsLoginOpen,
        setIsRegisterOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};