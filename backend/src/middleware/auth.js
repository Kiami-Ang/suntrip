const { verifyAccessToken } = require('../utils/token');
const { AppError } = require('./error');
const User = require('../models/User');

async function auth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Sessão inválida', 401);

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('Utilizador não encontrado', 401);
    if (user.status === 'blocked') throw new AppError('Conta bloqueada', 403);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Sessão expirada', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Sessão inválida', 401));
    }
    next(err);
  }
}

function adminOnly(req, _res, next) {
  if (req.user?.role !== 'admin') return next(new AppError('Acesso restrito', 403));
  next();
}

/** Envolve handlers async e encaminha erros para o errorHandler. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { auth, adminOnly, asyncHandler };
