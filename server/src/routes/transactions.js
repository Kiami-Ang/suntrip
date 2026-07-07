const express = require('express');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

function getPeriodStart(period) {
  const now = new Date();
  if (period === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (period === 'month') {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  return null;
}

/** Mapeia filtro UI (pago/pendente/cancelado) para status na BD */
function mapStatusFilter(status) {
  if (status === 'pago') return 'completed';
  if (status === 'pendente') return 'pending';
  if (status === 'cancelado') return { $in: ['cancelled', 'failed'] };
  return status || null;
}

router.get('/', auth, async (req, res) => {
  const { type, status, period, page = 1, limit = 50 } = req.query;
  const filter = { userId: req.user._id };

  if (type) filter.type = type;

  const mappedStatus = mapStatusFilter(status);
  if (mappedStatus) filter.status = mappedStatus;

  const periodStart = getPeriodStart(period);
  if (periodStart) {
    filter.createdAt = { $gte: periodStart };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);

  const isDriver = req.user.userType === 'driver';

  res.json({
    transactions: transactions.map((t) => {
      const json = t.toJSON();
      const hasCounterparty = ['qr_payment', 'qr_receive', 'transfer'].includes(t.type);
      return {
        ...json,
        counterpartyName: hasCounterparty ? t.recipientName || '—' : '—',
        counterpartyLabel: isDriver ? 'Cliente' : 'Motorista',
      };
    }),
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

router.get('/stats', auth, async (req, res) => {
  const userId = req.user._id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const txs = await Transaction.find({
    userId,
    status: 'completed',
    createdAt: { $gte: thirtyDaysAgo },
  });
  const totalOut = txs
    .filter((t) => ['transfer', 'qr_payment', 'bank_transfer'].includes(t.type))
    .reduce((s, t) => s + t.amount, 0);
  const totalIn = txs
    .filter((t) => ['deposit', 'qr_receive', 'transfer'].includes(t.type))
    .reduce((s, t) => s + t.amount, 0);
  const byType = txs.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {});
  res.json({
    balance: req.user.balance,
    totalTransactions: txs.length,
    totalOut,
    totalIn,
    byType,
    recentCount: txs.filter((t) => t.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
  });
});

module.exports = router;
