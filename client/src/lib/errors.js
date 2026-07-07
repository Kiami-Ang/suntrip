export function getApiErrorMessage(err, fallback = 'Ocorreu um erro') {
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  if (!err.response) {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const onLan = host && host !== 'localhost' && host !== '127.0.0.1';
    if (onLan) {
      return 'Sem ligação ao servidor. Confirme que o PC tem a API a correr (npm run dev no server) e reinicie o site.';
    }
    return 'Sem ligação ao servidor. Verifique se a API está a correr na porta 5000.';
  }
  return fallback;
}
