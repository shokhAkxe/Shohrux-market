import axiosInstance from './axios';

export const authAPI = {
  register: (userData) => axiosInstance.post('/auth/register', userData),
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  googleLogin: (accessToken) => axiosInstance.post('/auth/google', { accessToken }),
  getMe: () => axiosInstance.get('/auth/me'),
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
  changePassword: (data) => axiosInstance.put('/auth/change-password', data),
  addOrder: (orderData) => axiosInstance.post('/auth/orders', orderData),
  getOrders: () => axiosInstance.get('/auth/orders'),
  logout: () => axiosInstance.post('/auth/logout'),
};