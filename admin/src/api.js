import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://apex-core-backend-lyoj.onrender.com';
console.log(`>>> [Admin_Uplink]: Targeting API at ${baseURL}`);

const api = axios.create({
  baseURL
});

export const API_BASE = baseURL;

export default api;
