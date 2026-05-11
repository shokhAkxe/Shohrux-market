import axiosInstance from './axios';

export const authAPI = {
  // Ro'yxatdan o'tish
  register: (userData) => axiosInstance.post('/auth/register', userData),
  
  // Kirish
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  
  // Profilni olish
  getMe: () => axiosInstance.get('/auth/me'),
  
  // Profilni yangilash
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
  
  // Parolni o'zgartirish
  changePassword: (data) => axiosInstance.put('/auth/change-password', data),
  
  // Buyurtma berish
  addOrder: (orderData) => axiosInstance.post('/auth/orders', orderData),
  
  // Buyurtmalarni olish
  getOrders: () => axiosInstance.get('/auth/orders'),
  
  // Chiqish
  logout: () => axiosInstance.post('/auth/logout'),
  
  // Google orqali kirish (keyin to'liq qo'shamiz)
  googleLogin: (googleData) => axiosInstance.post('/auth/google', googleData),
};