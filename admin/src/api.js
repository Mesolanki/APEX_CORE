import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8050',
});

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8050';

export default api;
