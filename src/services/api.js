import axios from 'axios';

const api = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'https://lts-dbms-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

