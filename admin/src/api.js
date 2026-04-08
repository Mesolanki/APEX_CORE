import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://apex-core-backend.onrender.com',
});

export const API_BASE = import.meta.env.VITE_API_URL || 'https://apex-core-backend.onrender.com';

export default api;
