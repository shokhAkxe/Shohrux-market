import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profilni yuklash
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axiosInstance.get('/auth/profile');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Login
  const login = async (emailOrPhone, password) => {
    try {
      const res = await axiosInstance.post('/auth/login', { emailOrPhone, password });
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Xush kelibsiz!');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.error || 'Kirishda xato');
      return { success: false };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const res = await axiosInstance.post('/auth/register', userData);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success("Ro'yxatdan o'tish muvaffaqiyatli!");
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.error || "Xatolik yuz berdi");
      return { success: false };
    }
  };

  // Profilni yangilash (Yangi qo'shildi)
  const updateProfile = async (data) => {
    try {
      const res = await axiosInstance.put('/auth/profile', data);
      setUser(res.data);
      toast.success('Profil yangilandi!');
      return { success: true };
    } catch (err) {
      toast.error('Yangilashda xatolik');
      return { success: false };
    }
  };

  // Buyurtma berish (Yangi qo'shildi)
  const addOrder = async (orderData) => {
    try {
      await axiosInstance.post('/auth/orders', orderData);
      toast.success('Buyurtmangiz qabul qilindi!');
      return { success: true };
    } catch (err) {
      toast.error('Buyurtma berishda xato');
      return { success: false };
    }
  };

  // Buyurtmalarni olish (Yangi qo'shildi)
  const getOrders = async () => {
    try {
      const res = await axiosInstance.get('/auth/orders');
      return { success: true, orders: res.data };
    } catch (err) {
      return { success: false, orders: [] };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Tizimdan chiqildi');
  };

  return (
    <AuthContext.Provider value={{ 
      user, isAuthenticated, loading, 
      login, register, logout, 
      updateProfile, addOrder, getOrders 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};