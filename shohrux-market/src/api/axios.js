// src/api/axios.js

import axios from 'axios';

// ========== ENVIRONMENT GA QARAB API URL ==========
// Production (Vercel / Netlify) uchun Render backend URL
// Local development uchun localhost

const getApiUrl = () => {
  // Production environment (Vercel yoki Netlify)
  if (import.meta.env.PROD) {
    return 'https://market-api.onrender.com/api';
  }
  
  // Local development
  return 'http://localhost:5001/api';
};

const API_URL = getApiUrl();

console.log(`🔧 API URL: ${API_URL} (${import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT'})`);

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 soniya timeout
  withCredentials: false,
});

// ========== REQUEST INTERCEPTOR ==========
axiosInstance.interceptors.request.use(
  (config) => {
    // Token ni localStorage dan olish
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug uchun (production da o'chirish mumkin)
    if (!import.meta.env.PROD) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      if (config.data) {
        console.log('📦 Request data:', config.data);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ========== RESPONSE INTERCEPTOR ==========
axiosInstance.interceptors.response.use(
  (response) => {
    // Debug uchun
    if (!import.meta.env.PROD) {
      console.log(`📥 Response ${response.status}: ${response.config.url}`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Network xatosi
    if (error.code === 'ECONNABORTED') {
      error.message = 'Server javob bermayapti. Internet aloqangizni tekshiring!';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Backend server ishlamayapti. Iltimos, keyinroq urinib ko\'ring!';
    }
    
    // 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Token ni o'chirish
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Auth logout event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-logout'));
      }
      
      // Redirect to home agar kerak bo'lsa
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    // Xatolik haqida ma'lumot
    const errorMessage = error.response?.data?.error || error.message || 'Noma\'lum xatolik!';
    
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: errorMessage
    });
    
    // Xatolikni qaytarish
    return Promise.reject(error);
  }
);

// ========== HELPER FUNCTIONS ==========

// Token ni tekshirish
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Token ni olish
export const getToken = () => {
  return localStorage.getItem('token');
};

// Token ni saqlash
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

// Token ni o'chirish
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Current user ni olish
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Current user ni saqlash
export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export default axiosInstance;