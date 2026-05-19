import axiosInstance from './axios';

export const authAPI = {
  register: (userData) => axiosInstance.post('/auth/register', userData),
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  // Google login: credential (ID Token) yuboriladi
  googleLogin: (token) => axiosInstance.post('/auth/google', { token }),
  getMe: () => axiosInstance.get('/auth/me'),
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
  changePassword: (data) => axiosInstance.put('/auth/change-password', data),
  addOrder: (orderData) => axiosInstance.post('/auth/orders', orderData),
  getOrders: () => axiosInstance.get('/auth/orders'),
  cancelOrder: (orderId) => axiosInstance.put(`/auth/orders/${orderId}/cancel`),
  deleteOrder: (orderId) => axiosInstance.delete(`/auth/orders/${orderId}`),
  deleteAccount: () => axiosInstance.delete('/auth/account'),
  logout: () => axiosInstance.post('/auth/logout'),
};
