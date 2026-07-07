const express = require('express');
const User = require('../models/User');
const { auth, asyncHandler } = require('../middleware/auth');
const { AppError } = require('../middleware/error');
const { issueTokens, verifyRefreshToken, signAccessToken } = require('../utils/token');
const {
  registerClientSchema,
  registerDriverSchema,
  loginSchema,
  pinSchema,
} = require('../utils/validation');

const router = express.Router();

async function createUserResponse(user) {
  const tokens = issueTokens(user._id.toString());
  return { user: user.toPublic(), ...tokens };
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
    if (user.status === 'blocked') throw new AppError('Conta bloqueada', 403);

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

router.post('/logout', auth, (_req, res) => {
  res.json({ message: 'Sessão terminada' });
});

module.exports = router;
