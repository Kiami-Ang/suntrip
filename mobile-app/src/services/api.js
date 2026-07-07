import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getToken } from './storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(error, fallback = 'Erro de ligação') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message === 'Network Error') {
    return 'Sem ligação ao servidor. Verifique EXPO_PUBLIC_API_URL e se a API está a correr.';
  }
  return fallback;
}

export default api;
