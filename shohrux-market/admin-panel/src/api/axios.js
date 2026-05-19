import axios from 'axios';

// Bu yerda import.meta.env orqali Vercel-dagi o'zgaruvchini olamiz
// Agar u topilmasa (lokal ishlatganda), localhost-ni ishlatadi
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
   const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;