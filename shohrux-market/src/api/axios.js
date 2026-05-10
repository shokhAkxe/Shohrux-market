import axios from 'axios';

// VITE_API_URL ni Vercel dan oladi, topilmasa majburiy Render linkini ishlatadi
const API_URL = import.meta.env.VITE_API_URL || 'https://market-api.onrender.com';

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`, // /api qismi shu yerda qo'shildi
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;