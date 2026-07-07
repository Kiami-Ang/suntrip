const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(userId) {
  return jwt.sign({ id: userId, type: 'access' }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });
}

function signRefreshToken(userId) {
  return jwt.sign({ id: userId, type: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

function issueTokens(userId) {
  return {
    accessToken: signAccessToken(userId),
    refreshToken: signRefreshToken(userId),
  };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  issueTokens,
};
