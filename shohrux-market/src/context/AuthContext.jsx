import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axios';
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
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axiosInstance.get('/api/auth/profile');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Profil yuklashda xato:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();

    const handleLogout = () => logout();
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  // 1. Register
  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', userData);
      const { user, token } = response.data;
      if (token) localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success("Ro'yxatdan o'tish muvaffaqiyatli!");
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || "Ro'yxatdan o'tishda xatolik";
      toast.error(msg);
      return { success: false };
    }
  };

  // 2. Login
  const login = async (emailOrPhone, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { emailOrPhone, password });
      const { user, token } = response.data;
      if (token) localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Xush kelibsiz!');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Kirishda xatolik';
      toast.error(msg);
      return { success: false };
    }
  };

  // 3. Logout
  const logout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Tizimdan chiqildi');
    }
  };

  // 4. Profilni yangilash (Update Profile)
  const updateProfile = async (profileData) => {
    try {
      // Backendda bu route PUT /api/auth/profile bo'lishi kerak
      const response = await axiosInstance.put('/api/auth/profile', profileData);
      setUser(response.data);
      toast.success('Profil muvaffaqiyatli yangilandi!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Yangilashda xatolik');
      return { success: false };
    }
  };

  // 5. Buyurtma berish (Add Order)
  const addOrder = async (orderData) => {
    try {
      const response = await axiosInstance.post('/api/auth/orders', orderData);
      toast.success('Buyurtmangiz qabul qilindi!');
      return { success: true, order: response.data };
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Buyurtma berishda xatolik yuz berdi');
      return { success: false };
    }
  };

  // 6. Buyurtmalarni olish (Get Orders)
  const getOrders = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/orders');
      return { success: true, orders: response.data };
    } catch (error) {
      console.error('Orders fetch error:', error);
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
      logout,
      updateProfile,
      addOrder,
      getOrders
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};