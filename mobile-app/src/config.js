/**
 * API: EXPO_PUBLIC_API_URL → ex. http://192.168.1.123:5000/api
 * Socket: mesma origem, sem /api
 */
const raw = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://127.0.0.1:5000/api';

export const API_BASE_URL = raw.replace(/\/$/, '');

export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/i, '') || API_BASE_URL;

export const STORAGE_KEYS = {
  token: 'suntrip_token',
  user: 'suntrip_user',
};
