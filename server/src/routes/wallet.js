const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/balance', auth, (req, res) => {
  res.json({ balance: req.user.balance });
});

router.post('/deposit', auth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Depósito mínimo: 100 Kz' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: amount } },
      { new: true }
    );
    const tx = await Transaction.create({
      userId: user._id,
      type: 'deposit',
      status: 'completed',
      amount,
      description: 'Depósito na carteira SunTrip',
    });
    res.json({ balance: user.balance, transaction: tx.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/transfer', auth, async (req, res) => {
  try {
    const { recipientId, amount, description } = req.body;
    const value = Number(amount);
    if (!recipientId || !value || value < 50) {
      return res.status(400).json({ message: 'Transferência mínima: 50 Kz' });
    }
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Não pode transferir para si mesmo' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Destinatário não encontrado' });
    }

    const sender = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: value } },
      { $inc: { balance: -value } },
      { new: true }
    );
    if (!sender) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    await User.findByIdAndUpdate(recipientId, { $inc: { balance: value } });

    const [txOut, txIn] = await Transaction.create([
      {
        userId: sender._id,
        type: 'transfer',
        status: 'completed',
        amount: value,
        description: description || `Transferência para ${recipient.name}`,
        recipientId: recipient._id,
        recipientName: recipient.name,
      },
      {
        userId: recipient._id,
        type: 'transfer',
        status: 'completed',
        amount: value,
        description: `Recebido de ${sender.name}`,
        recipientId: sender._id,
        recipientName: sender.name,
      },
    ]);

    res.json({
      balance: sender.balance,
      transaction: txOut.toJSON(),
      received: txIn.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history', auth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const transactions = await Transaction.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json({ transactions: transactions.map((t) => t.toJSON()) });
});

module.exports = router;
