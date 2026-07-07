const express = require('express');
const Transaction = require('../models/Transaction');
const { auth, asyncHandler } = require('../middleware/auth');
const { toKz } = require('../utils/money');

const router = express.Router();

function periodStart(period) {
  const now = new Date();
  if (period === 'today') {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === 'month') {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  return null;
}

function mapStatus(status) {
  if (status === 'pago') return 'completed';
  if (status === 'pendente') return 'pending';
  if (status === 'cancelado') return { $in: ['failed', 'reversed'] };
  return null;
}

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const { period, status, type, page = 1, limit = 50 } = req.query;
    const filter = { userId: req.user._id };

    const start = periodStart(period);
    if (start) filter.createdAt = { $gte: start };

    const mapped = mapStatus(status);
    if (mapped) filter.status = mapped;
    if (type) filter.type = type;

    const perPage = Math.min(Number(limit) || 50, 100);
    const skip = (Number(page) - 1) * perPage;

    const [items, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions: items.map((t) => t.toJSON()),
      total,
      page: Number(page),
      pages: Math.ceil(total / perPage),
    });
  })
);

router.get(
  '/stats',
  auth,
  asyncHandler(async (req, res) => {
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const txs = await Transaction.find({
      userId: req.user._id,
      status: 'completed',
      createdAt: { $gte: start },
    });

    const totalIn = txs.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amountCents, 0);
    const totalOut = txs.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amountCents, 0);

    res.json({
      balance: toKz(req.user.balanceCents),
      totalTransactions: txs.length,
      totalIn: toKz(totalIn),
      totalOut: toKz(totalOut),
    });
  })
);

module.exports = router;
