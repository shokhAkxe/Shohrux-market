import axios from 'axios';

// .env faylidan API URL olinadi
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // FormData bo'lsa Content-Type ni axios o'zi belgilaydi (multipart/form-data)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
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
