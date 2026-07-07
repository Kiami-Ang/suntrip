const express = require('express');
const User = require('../models/User');
const { auth, asyncHandler } = require('../middleware/auth');
const { AppError } = require('../middleware/error');
const { phoneSchema, nameSchema } = require('../utils/validation');

const router = express.Router();

router.put(
  '/profile',
  auth,
  asyncHandler(async (req, res) => {
    const { name, phone, address, bankAccount } = req.body;

    if (name !== undefined) req.user.name = nameSchema.parse(name);
    if (phone !== undefined) {
      const parsed = phoneSchema.parse(phone);
      const exists = await User.findOne({ phone: parsed, _id: { $ne: req.user._id } });
      if (exists) throw new AppError('Telefone já registado', 409);
      req.user.phone = parsed;
    }
    if (address !== undefined) req.user.address = String(address).trim();
    if (bankAccount !== undefined) req.user.bankAccount = String(bankAccount).trim();

    await req.user.save();
    res.json({ user: req.user.toPublic() });
  })
);

// Procurar destinatário para transferência (por telefone, email ou nome)
router.get(
  '/search',
  auth,
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json({ users: [] });

    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      _id: { $ne: req.user._id },
      status: 'active',
      $or: [{ phone: rx }, { email: rx }, { name: rx }],
    })
      .limit(10)
      .select('name phone email avatar userType');

    res.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        phone: u.phone,
        email: u.email,
        avatar: u.avatar,
        userType: u.userType,
      })),
    });
  })
);

module.exports = router;
