const express = require('express');
const User = require('../models/User');
const { auth, asyncHandler } = require('../middleware/auth');
const { AppError } = require('../middleware/error');
const { issueTokens, verifyRefreshToken, signAccessToken } = require('../utils/token');
const { sendVerificationEmail, sendPasswordResetEmail, emailEnabled } = require('../services/email.service');
const {
  registerClientSchema,
  registerDriverSchema,
  registerBusinessSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  pinSchema,
} = require('../utils/validation');

const router = express.Router();

async function createUserResponse(user) {
  const tokens = issueTokens(user._id.toString());
  return { user: user.toPublic(), ...tokens };
}

// Cria o código de verificação e tenta enviar por email.
// Se o SMTP não estiver configurado, marca como verificado (não bloqueia).
async function startEmailVerification(user) {
  if (!emailEnabled()) {
    user.emailVerified = true;
    return;
  }
  const code = user.generateEmailCode();
  try {
    await sendVerificationEmail(user.email, code, user.name);
  } catch (err) {
    console.error('[email] falha ao enviar verificação:', err.message);
    // Não bloqueia o registo se o envio falhar; o utilizador pode reenviar.
  }
}

router.post(
  '/register/client',
  asyncHandler(async (req, res) => {
    const data = registerClientSchema.parse(req.body);

    const user = new User({
      name: data.name,
      email: data.email,
      phone: data.phone,
      userType: 'client',
      bankAccount: data.bankAccount,
      address: data.address,
    });
    await user.setPassword(data.password);
    await startEmailVerification(user);
    await user.save();

    res.status(201).json(await createUserResponse(user));
  })
);

router.post(
  '/register/driver',
  asyncHandler(async (req, res) => {
    const data = registerDriverSchema.parse(req.body);

    const user = new User({
      name: data.name,
      email: data.email,
      phone: data.phone,
      userType: 'driver',
      bankAccount: data.bankAccount,
      driverLicense: data.driverLicense,
      vehiclePlate: data.vehiclePlate,
      idDocument: data.idDocument,
      professionalNotes: data.professionalNotes,
    });
    await user.setPassword(data.password);
    await startEmailVerification(user);
    await user.save();

    res.status(201).json(await createUserResponse(user));
  })
);

router.post(
  '/register/business',
  asyncHandler(async (req, res) => {
    const data = registerBusinessSchema.parse(req.body);

    const user = new User({
      name: data.name,
      email: data.email,
      phone: data.phone,
      userType: 'business',
      businessName: data.businessName,
      businessNif: data.businessNif,
      businessCategory: data.businessCategory,
      address: data.address,
    });
    await user.setPassword(data.password);
    await startEmailVerification(user);
    await user.save();

    res.status(201).json(await createUserResponse(user));
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });
    if (!user || !(await user.comparePassword(data.password))) {
      throw new AppError('Email ou palavra-passe incorrectos', 401);
    }
    await user.clearExpiredBan();
    if (user.isCurrentlyBlocked()) {
      const msg =
        user.banType === 'temporary' && user.blockedUntil
          ? `Conta suspensa até ${user.blockedUntil.toISOString().slice(0, 16).replace('T', ' ')} UTC`
          : 'Conta bloqueada permanentemente';
      throw new AppError(user.banReason ? `${msg}. Motivo: ${user.banReason}` : msg, 403);
    }

    user.lastActiveAt = new Date();
    await user.save();

    res.json(await createUserResponse(user));
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token em falta', 400);

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Refresh token inválido ou expirado', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('Utilizador não encontrado', 401);

    res.json({ accessToken: signAccessToken(user._id.toString()) });
  })
);

router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user.toPublic() });
  })
);

// Definir ou alterar o PIN de pagamento
router.post(
  '/pin',
  auth,
  asyncHandler(async (req, res) => {
    const { pin, currentPin } = req.body;
    const parsed = pinSchema.parse(pin);

    if (req.user.pinHash) {
      const ok = await req.user.comparePin(currentPin);
      if (!ok) throw new AppError('PIN actual incorrecto', 400);
    }

    await req.user.setPin(parsed);
    await req.user.save();

    res.json({ message: 'PIN definido', user: req.user.toPublic() });
  })
);

// Verificar email com o código de 6 dígitos
router.post(
  '/verify-email',
  auth,
  asyncHandler(async (req, res) => {
    const { code } = verifyEmailSchema.parse(req.body);

    if (req.user.emailVerified) {
      return res.json({ message: 'Email já verificado', user: req.user.toPublic() });
    }
    if (!req.user.emailVerifyCode || !req.user.emailVerifyExpires) {
      throw new AppError('Pede um novo código', 400);
    }
    if (req.user.emailVerifyExpires < new Date()) {
      throw new AppError('Código expirado. Pede um novo.', 400);
    }
    if (req.user.emailVerifyCode !== code) {
      throw new AppError('Código incorrecto', 400);
    }

    req.user.emailVerified = true;
    req.user.emailVerifyCode = null;
    req.user.emailVerifyExpires = null;
    await req.user.save();

    res.json({ message: 'Email verificado', user: req.user.toPublic() });
  })
);

// Reenviar o código de verificação
router.post(
  '/resend-code',
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.emailVerified) {
      return res.json({ message: 'Email já verificado' });
    }
    if (!emailEnabled()) {
      // Sem SMTP: verifica automaticamente para não bloquear.
      req.user.emailVerified = true;
      await req.user.save();
      return res.json({ message: 'Verificação concluída', user: req.user.toPublic() });
    }
    const code = req.user.generateEmailCode();
    await req.user.save();
    try {
      await sendVerificationEmail(req.user.email, code, req.user.name);
    } catch (err) {
      throw new AppError('Não foi possível enviar o email. Tente mais tarde.', 502);
    }
    res.json({ message: 'Código reenviado' });
  })
);

// Pedir código de recuperação de palavra-passe
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email });

    // Resposta genérica (não revela se o email existe)
    const genericMsg = { message: 'Se a conta existir, enviámos um código para o email.' };

    if (!user) return res.json(genericMsg);
    if (!emailEnabled()) {
      throw new AppError('Recuperação por email indisponível de momento.', 503);
    }

    const code = user.generateResetCode();
    await user.save();
    try {
      await sendPasswordResetEmail(user.email, code, user.name);
    } catch (err) {
      console.error('[email] falha ao enviar recuperação:', err.message);
      throw new AppError('Não foi possível enviar o email. Tente mais tarde.', 502);
    }
    res.json(genericMsg);
  })
);

// Redefinir palavra-passe com o código recebido por email
router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { email, code, password } = resetPasswordSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (!user || !user.resetCode || !user.resetExpires) {
      throw new AppError('Pedido inválido. Peça um novo código.', 400);
    }
    if (user.resetExpires < new Date()) {
      throw new AppError('Código expirado. Peça um novo.', 400);
    }
    if (user.resetCode !== code) {
      throw new AppError('Código incorrecto', 400);
    }

    await user.setPassword(password);
    user.resetCode = null;
    user.resetExpires = null;
    await user.save();

    res.json(await createUserResponse(user));
  })
);

router.post('/logout', auth, (_req, res) => {
  res.json({ message: 'Sessão terminada' });
});

module.exports = router;
