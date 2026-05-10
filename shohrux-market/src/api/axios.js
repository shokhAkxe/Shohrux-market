import axios from 'axios';

// To'g'ridan-to'g'ri Render linkini yozamiz (localhost muammosi bo'lmasligi uchun)
const API_URL = 'https://market-api.onrender.com';

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;