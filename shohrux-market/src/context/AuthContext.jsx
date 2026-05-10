// src/context/AuthContext.jsx - TO'LIQ KOD

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
    
    const handleLogout = () => {
      logout();
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Load user error:", error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      console.log("Register API ga yuborilmoqda:", userData);
      const response = await authAPI.register(userData);
      console.log("Register javobi:", response.data);
      
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Ro\'yxatdan o\'tish muvaffaqiyatli!');
      return { success: true };
    } catch (error) {
      console.error("Register xatosi:", error);
      console.error("Error response:", error.response);
      const errorMsg = error.response?.data?.error || 'Ro\'yxatdan o\'tishda xatolik';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const login = async (emailOrPhone, password) => {
    try {
      console.log("Login API ga yuborilmoqda:", { emailOrPhone, password });
      const response = await authAPI.login({ emailOrPhone, password });
      console.log("Login javobi:", response.data);
      
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Kirish muvaffaqiyatli!');
      return { success: true };
    } catch (error) {
      console.error("Login xatosi:", error);
      console.error("Error response:", error.response);
      const errorMsg = error.response?.data?.error || 'Kirishda xatolik';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const googleLogin = async (googleData) => {
    try {
      console.log("Google login:", googleData);
      const response = await authAPI.googleLogin(googleData);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Kirish muvaffaqiyatli!');
      return { success: true };
    } catch (error) {
      console.error("Google login xatosi:", error);
      toast.error('Google login failed');
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Chiqildi');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      toast.success('Profil yangilandi!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Yangilashda xatolik');
      return { success: false };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await authAPI.changePassword({ oldPassword, newPassword });
      toast.success('Parol o\'zgartirildi!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Parol o\'zgartirishda xatolik');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const addOrder = async (orderData) => {
    try {
      const response = await authAPI.addOrder(orderData);
      console.log("Buyurtma qo'shildi:", response.data);
      toast.success('Buyurtma qabul qilindi!');
      return { success: true };
    } catch (error) {
      console.error('Add order error:', error);
      toast.error('Buyurtma berishda xatolik');
      return { success: false };
    }
  };

  // YANGI - buyurtmalarni olish
  const getOrders = async () => {
    try {
      const response = await authAPI.getOrders();
      console.log("Buyurtmalar olindi:", response.data);
      return { success: true, orders: response.data };
    } catch (error) {
      console.error('Get orders error:', error);
      return { success: false, orders: [] };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      register,
      login,
      googleLogin,
      logout,
      updateProfile,
      changePassword,
      addOrder,
      getOrders, // YANGI QO'SHILDI
    }}>
      {children}
    </AuthContext.Provider>
  );
};