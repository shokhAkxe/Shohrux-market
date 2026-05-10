// src/api/axios.js

import axios from 'axios';

// TO'G'RI URL - backend aslida shu manzilda
const API_URL = 'https://shohrux-market.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 Response ${response.status}: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
    
    const message = error.response?.data?.error || 'Tarmoq xatoligi!';
    error.message = message;
    
    return Promise.reject(error);
  }
);

export default axiosInstance;