/** Erro aplicacional com código HTTP. */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function notFound(_req, res) {
  res.status(404).json({ message: 'Recurso não encontrado' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err?.name === 'ZodError') {
    const first = err.errors?.[0];
    return res.status(400).json({ message: first?.message || 'Dados inválidos' });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'campo';
    const label = field === 'email' ? 'Email' : field === 'phone' ? 'Telefone' : field;
    return res.status(409).json({ message: `${label} já registado` });
  }
  console.error('[error]', err);
  return res.status(500).json({ message: 'Erro interno do servidor' });
}

module.exports = { AppError, notFound, errorHandler };
