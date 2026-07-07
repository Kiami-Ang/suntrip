const express = require('express');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');
const { getOnlineUsers } = require('../socket/online');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const [recentTransactions, stats] = await Promise.all([
    Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Transaction.aggregate([
      { $match: { userId: req.user._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          volume: { $sum: '$amount' },
        },
      },
    ]),
  ]);
  const onlineUsers = getOnlineUsers();
  res.json({
    balance: req.user.balance,
    user: req.user.toPublic(),
    stats: {
      totalTransactions: stats[0]?.total || 0,
      volume: stats[0]?.volume || 0,
    },
    recentTransactions: recentTransactions.map((t) => t.toJSON()),
    onlineUsers,
    onlineCount: onlineUsers.length,
  });
});

module.exports = router;
