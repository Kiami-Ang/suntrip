import axios from 'axios';
import config from '../config';
import storage from './storage';

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Callback chamado quando a sessão expira de vez (refresh falha)
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.request.use(async (cfg) => {
  const token = await storage.getAccessToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Tenta renovar o token uma vez em caso de 401
    if (status === 401 && original && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = (async () => {
            const refreshToken = await storage.getRefreshToken();
            if (!refreshToken) throw new Error('no refresh token');
            const { data } = await axios.post(`${config.apiUrl}/auth/refresh`, { refreshToken });
            await storage.setTokens(data.accessToken);
            return data.accessToken;
          })();
        }
        const newToken = await refreshing;
        refreshing = null;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        await storage.clear();
        if (onUnauthorized) onUnauthorized();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Extrai a mensagem de erro amigável da resposta do backend
export const errorMessage = (error, fallback = 'Ocorreu um erro. Tente novamente.') =>
  error?.response?.data?.message || (error?.message === 'Network Error' ? 'Sem ligação ao servidor' : fallback);

export default api;
