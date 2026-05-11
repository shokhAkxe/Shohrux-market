import axios from 'axios';

// ========== BACKEND URL ==========
// Production (Render)
const API_URL = 'https://shohrux-market.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
  withCredentials: false,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
    
    const errorMessage = error.response?.data?.error || error.message || 'Tarmoq xatoligi!';
    error.message = errorMessage;
    
    return Promise.reject(error);
  }
);

export default axiosInstance;