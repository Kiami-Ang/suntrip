import axios from 'axios';
import { getApiBaseUrl, getServerBaseUrl } from './config';

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('suntrip_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!['/login', '/register', '/'].includes(path)) {
        localStorage.removeItem('suntrip_token');
        localStorage.removeItem('suntrip_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const getUploadUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${getServerBaseUrl()}${path}`;
};

export default api;
