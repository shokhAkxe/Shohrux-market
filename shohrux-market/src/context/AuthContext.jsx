import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profilni yuklash
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Load user error:', err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Login
  const login = async (emailOrPhone, password) => {
    try {
      const response = await authAPI.login({ emailOrPhone, password });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Xush kelibsiz!');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Kirishda xatolik';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success("Ro'yxatdan o'tish muvaffaqiyatli!");
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Xatolik yuz berdi";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Google Login
  const googleLogin = async (googleData) => {
    try {
      const response = await authAPI.googleLogin(googleData);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Xush kelibsiz!');
      return { success: true };
    } catch (err) {
      toast.error('Google login failed');
      return { success: false };
    }
  };

  // Profilni yangilash
  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      toast.success('Profil yangilandi!');
      return { success: true };
    } catch (err) {
      toast.error('Yangilashda xatolik');
      return { success: false };
    }
  };

  // Parolni o'zgartirish
  const changePassword = async (oldPassword, newPassword) => {
    try {
      await authAPI.changePassword({ oldPassword, newPassword });
      toast.success('Parol o\'zgartirildi!');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.error || 'Parol o\'zgartirishda xatolik');
      return { success: false };
    }
  };

  // Buyurtma berish
  const addOrder = async (orderData) => {
    try {
      await authAPI.addOrder(orderData);
      toast.success('Buyurtmangiz qabul qilindi!');
      return { success: true };
    } catch (err) {
      toast.error('Buyurtma berishda xatolik');
      return { success: false };
    }
  };

  // Buyurtmalarni olish
  const getOrders = async () => {
    try {
      const response = await authAPI.getOrders();
      return { success: true, orders: response.data };
    } catch (err) {
      console.error('Get orders error:', err);
      return { success: false, orders: [] };
    }
  };

  // Chiqish
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Tizimdan chiqildi');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      register,
      googleLogin,
      logout,
      updateProfile,
      changePassword,
      addOrder,
      getOrders,
    }}>
      {children}
    </AuthContext.Provider>
  );
};