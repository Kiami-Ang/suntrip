const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/transfer', auth, async (req, res) => {
  try {
    const { recipientName, bank, iban, reference, amount } = req.body;
    const value = Number(amount);
    if (!recipientName || !bank || !iban || !reference || !value) {
      return res.status(400).json({ message: 'Preencha todos os campos bancários' });
    }
    if (value < 100) {
      return res.status(400).json({ message: 'Valor mínimo: 100 Kz' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: value } },
      { $inc: { balance: -value } },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    const tx = await Transaction.create({
      userId: user._id,
      type: 'bank_transfer',
      status: 'completed',
      amount: value,
      description: `Transferência bancária para ${recipientName}`,
      recipientName,
      metadata: { bank, iban, reference },
    });

    res.json({ balance: user.balance, transaction: tx.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
