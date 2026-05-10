// src/api/auth.js - TO'LIQ KOD

import axios from './axios';

export const authAPI = {
  register: (data) => axios.post('/auth/register', data),
  login: (data) => axios.post('/auth/login', data),
  googleLogin: (data) => axios.post('/auth/google', data),
  logout: () => axios.post('/auth/logout'),
  getMe: () => axios.get('/auth/me'),
  updateProfile: (data) => axios.put('/auth/profile', data),
  changePassword: (data) => axios.put('/auth/change-password', data),
  addOrder: (data) => axios.post('/auth/orders', data),
  getOrders: () => axios.get('/auth/orders'), // YANGI - buyurtmalarni olish
};