import axios from 'axios';

// ========== BACKEND URL ==========
// Production (Render)
const API_URL = 'https://shohrux-market.onrender.com/api';

// Local development (izohdan chiqarib ishlatish)
// const API_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
  withCredentials: false,
});

// ========== REQUEST INTERCEPTOR ==========
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug uchun (production da o'chirish mumkin)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// ========== RESPONSE INTERCEPTOR ==========
axiosInstance.interceptors.response.use(
  (response) => {
    // Debug uchun
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 Response ${response.status}: ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.error || error.message
    });
    
    // 401 Unauthorized - Token expired
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
    
    // Xatolik xabarini formatlash
    const errorMessage = error.response?.data?.error || error.message || 'Tarmoq xatoligi!';
    error.message = errorMessage;
    
    return Promise.reject(error);
  }
);

export default axiosInstance;