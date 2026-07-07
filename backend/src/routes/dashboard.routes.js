const express = require('express');
const Transaction = require('../models/Transaction');
const { auth, asyncHandler } = require('../middleware/auth');
const { toKz } = require('../utils/money');
const { getOnlineCount } = require('../socket');

const router = express.Router();

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [recent, agg] = await Promise.all([
      Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(6),
      Transaction.aggregate([
        { $match: { userId: req.user._id, status: 'completed', createdAt: { $gte: start } } },
        {
          $group: {
            _id: '$direction',
            count: { $sum: 1 },
            volume: { $sum: '$amountCents' },
          },
        },
      ]),
    ]);

    const credit = agg.find((a) => a._id === 'credit') || { count: 0, volume: 0 };
    const debit = agg.find((a) => a._id === 'debit') || { count: 0, volume: 0 };

    res.json({
      user: req.user.toPublic(),
      balance: toKz(req.user.balanceCents),
      stats: {
        totalTransactions: credit.count + debit.count,
        totalIn: toKz(credit.volume),
        totalOut: toKz(debit.volume),
      },
      recentTransactions: recent.map((t) => t.toJSON()),
      onlineCount: getOnlineCount(),
    });
  })
);

module.exports = router;
