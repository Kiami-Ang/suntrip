const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(auth, adminOnly);

router.get('/users', async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-password');
  res.json({
    users: users.map((u) => ({
      ...u.toPublic(),
      createdAt: u.createdAt,
      lastActive: u.lastActive,
    })),
  });
});

router.get('/transactions', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email');
  res.json({
    transactions: transactions.map((t) => ({
      ...t.toJSON(),
      user: t.userId ? { name: t.userId.name, email: t.userId.email } : null,
    })),
  });
});

router.get('/payments', async (_req, res) => {
  const payments = await Transaction.find({
    type: { $in: ['qr_payment', 'qr_receive', 'bank_transfer', 'transfer'] },
    status: 'completed',
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('userId', 'name email');
  res.json({
    payments: payments.map((t) => ({
      ...t.toJSON(),
      user: t.userId ? { name: t.userId.name, email: t.userId.email } : null,
    })),
  });
});

module.exports = router;
