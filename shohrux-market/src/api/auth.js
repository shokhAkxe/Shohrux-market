import axiosInstance from './axios'; // Sizdagi axiosInstance fayli

export const authAPI = {
  // Ro'yxatdan o'tish
  register: (userData) => axiosInstance.post('/api/auth/register', userData),
  
  // Kirish
  login: (credentials) => axiosInstance.post('/api/auth/login', credentials),
  
  // Profilni olish
  getMe: () => axiosInstance.get('/api/auth/profile'),
  
  // Chiqish
  logout: () => axiosInstance.post('/api/auth/logout'),
  
  // Buyurtma berish
  addOrder: (orderData) => axiosInstance.post('/api/auth/orders', orderData),
  
  // Buyurtmalarni olish
  getOrders: () => axiosInstance.get('/api/auth/orders'),
  
  // Profilni yangilash
  updateProfile: (data) => axiosInstance.put('/api/auth/profile', data),
};