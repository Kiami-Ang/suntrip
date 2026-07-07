/**
 * PC: API na porta 5000
 * Telemóvel (mesma Wi-Fi): API via /api no mesmo host (proxy Next.js)
 */
export function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:5000/api';
  }
  const { hostname, origin } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000/api';
  }
  return `${origin}/api`;
}

export function getServerBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:5000';
  }
  const { hostname, origin } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000';
  }
  return origin;
}

export function getSocketUrl() {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:5000';
  }
  const { hostname, protocol } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000';
  }
  return `${protocol}//${hostname}:5000`;
}
