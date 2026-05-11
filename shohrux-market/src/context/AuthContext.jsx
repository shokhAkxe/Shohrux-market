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
      console.log('✅ User loaded:', response.data);
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
      return { success: true, user };
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
      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Xatolik yuz berdi";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Google Login (hozircha mock, keyin to'liq qo'shamiz)
  const googleLogin = async (googleData) => {
    try {
      // TODO: Google OAuth2 integratsiyasi
      toast.info('Google orqali kirish hozircha ishlab chiqilmoqda');
      return { success: false };
    } catch (err) {
      toast.error('Google login failed');
      return { success: false };
    }
  };

  // Profilni yangilash (TO'G'RILANGAN)
  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      console.log('✅ Profile updated:', response.data);
      
      // Yangilangan ma'lumotlarni user state ga saqlash
      if (response.data.user) {
        setUser(prev => ({ ...prev, ...response.data.user }));
      } else if (response.data) {
        setUser(prev => ({ ...prev, ...response.data }));
      }
      
      // Qayta yuklash
      await loadUser();
      
      toast.success('Profil muvaffaqiyatli yangilandi!');
      return { success: true, user: response.data };
    } catch (err) {
      console.error('Update profile error:', err);
      const errorMsg = err.response?.data?.error || 'Yangilashda xatolik yuz berdi';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Parolni o'zgartirish
  const changePassword = async (oldPassword, newPassword) => {
    try {
      await authAPI.changePassword({ oldPassword, newPassword });
      toast.success('Parol muvaffaqiyatli o\'zgartirildi!');
      return { success: true };
    } catch (err) {
      console.error('Change password error:', err);
      const errorMsg = err.response?.data?.error || 'Parol o\'zgartirishda xatolik';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Buyurtma berish
  const addOrder = async (orderData) => {
    try {
      const response = await authAPI.addOrder(orderData);
      toast.success('Buyurtmangiz muvaffaqiyatli qabul qilindi!');
      return { success: true, order: response.data };
    } catch (err) {
      console.error('Add order error:', err);
      const errorMsg = err.response?.data?.error || 'Buyurtma berishda xatolik';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Buyurtmalarni olish
  const getOrders = async () => {
    try {
      const response = await authAPI.getOrders();
      return { success: true, orders: response.data || [] };
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
      loadUser,  // ✅ QO'SHILDI
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