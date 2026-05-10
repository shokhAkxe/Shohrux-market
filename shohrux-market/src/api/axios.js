import axios from 'axios';

// Muhim: Agar VITE_API_URL topilmasa, localhost:5000 ga ulanadi
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  // Biz bu yerda /api ni qo'shib ketsak, AuthContext dagi yo'llar qisqaradi
  baseURL: `${API_URL}/api`, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
//fix login