const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const QrPayment = require('../models/QrPayment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/generate', auth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const description = req.body.description || 'Pagamento SunTrip';
    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Valor inválido' });
    }
    const code = `ST-${uuidv4().slice(0, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const payment = await QrPayment.create({
      code,
      userId: req.user._id,
      amount,
      description,
      expiresAt,
    });
    const payload = JSON.stringify({
      code: payment.code,
      amount: payment.amount,
      userId: req.user._id.toString(),
      name: req.user.name,
    });
    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: { dark: '#0a0a0a', light: '#ffffff' },
    });
    res.json({
      payment: {
        code: payment.code,
        amount: payment.amount,
        description: payment.description,
        expiresAt: payment.expiresAt,
      },
      qrDataUrl,
      payload,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/verify/:code', auth, async (req, res) => {
  const payment = await QrPayment.findOne({ code: req.params.code });
  if (!payment) {
    return res.status(404).json({ message: 'QR Code inválido' });
  }
  if (payment.status !== 'active') {
    return res.status(400).json({ message: 'QR Code já utilizado ou expirado' });
  }
  if (payment.expiresAt < new Date()) {
    payment.status = 'expired';
    await payment.save();
    return res.status(400).json({ message: 'QR Code expirado' });
  }
  const receiver = await User.findById(payment.userId).select('name avatar');
  res.json({
    payment: {
      code: payment.code,
      amount: payment.amount,
      description: payment.description,
      receiver: receiver ? { id: receiver._id, name: receiver.name, avatar: receiver.avatar } : null,
    },
  });
});

router.post('/pay', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Código em falta' });
    }

    const payment = await QrPayment.findOneAndUpdate(
      {
        code,
        status: 'active',
        expiresAt: { $gt: new Date() },
        userId: { $ne: req.user._id },
      },
      { status: 'paid', paidBy: req.user._id },
      { new: true }
    );

    if (!payment) {
      const existing = await QrPayment.findOne({ code });
      if (!existing) return res.status(404).json({ message: 'QR Code inválido' });
      if (existing.userId.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Não pode pagar o seu próprio QR' });
      }
      if (existing.status !== 'active') {
        return res.status(400).json({ message: 'QR Code já utilizado' });
      }
      if (existing.expiresAt < new Date()) {
        existing.status = 'expired';
        await existing.save();
        return res.status(400).json({ message: 'QR Code expirado' });
      }
      return res.status(400).json({ message: 'Não foi possível processar o pagamento' });
    }

    const receiver = await User.findById(payment.userId);
    if (!receiver) {
      payment.status = 'active';
      payment.paidBy = undefined;
      await payment.save();
      return res.status(404).json({ message: 'Destinatário não encontrado' });
    }

    const payer = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: payment.amount } },
      { $inc: { balance: -payment.amount } },
      { new: true }
    );

    if (!payer) {
      payment.status = 'active';
      payment.paidBy = undefined;
      await payment.save();
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    await User.findByIdAndUpdate(receiver._id, { $inc: { balance: payment.amount } });

    const [txPay, txReceive] = await Transaction.create([
      {
        userId: payer._id,
        type: 'qr_payment',
        status: 'completed',
        amount: payment.amount,
        description: payment.description,
        recipientId: receiver._id,
        recipientName: receiver.name,
        metadata: { code: payment.code },
      },
      {
        userId: receiver._id,
        type: 'qr_receive',
        status: 'completed',
        amount: payment.amount,
        description: `Recebido via QR - ${payer.name}`,
        recipientId: payer._id,
        recipientName: payer.name,
        metadata: { code: payment.code },
      },
    ]);

    res.json({
      balance: payer.balance,
      transaction: txPay.toJSON(),
      received: txReceive.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
