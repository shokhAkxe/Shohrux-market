import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axiosInstance.get('/auth/profile');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

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

  const register = async (userData) => {
    try {
      const res = await axiosInstance.post('/auth/register', userData);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.error || "Ro'yxatdan o'tishda xato");
      return { success: false };
    }
  };

  const addOrder = async (orderData) => {
    try {
      await axiosInstance.post('/auth/orders', orderData);
      toast.success('Buyurtmangiz qabul qilindi!');
      return { success: true };
    } catch (err) {
      console.error("Order error:", err);
      toast.error('Buyurtma berishda xatolik yuz berdi');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Tizimdan chiqildi');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, addOrder }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};