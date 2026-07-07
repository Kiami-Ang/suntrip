const RAW_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// Remove barra final para evitar // nos pedidos
const BASE_URL = RAW_URL.replace(/\/+$/, '');

export const config = {
  baseUrl: BASE_URL,
  apiUrl: `${BASE_URL}/api`,
  socketUrl: BASE_URL,
};

export default config;
