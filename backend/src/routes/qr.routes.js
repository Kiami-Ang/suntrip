const express = require('express');
const QRCode = require('qrcode');
const { randomUUID } = require('crypto');
const QrPayment = require('../models/QrPayment');
const { auth, asyncHandler } = require('../middleware/auth');
const { AppError } = require('../middleware/error');
const { parseAmountKz, toKz } = require('../utils/money');
const walletService = require('../services/wallet.service');
const { notify } = require('../services/notification.service');
const { getIO } = require('../socket');

const router = express.Router();

const QR_TTL_MS = 15 * 60 * 1000; // 15 minutos

// Gerar QR (quem recebe — normalmente o motorista)
router.post(
  '/generate',
  auth,
  asyncHandler(async (req, res) => {
    const amountCents = parseAmountKz(req.body.amount, { min: 100 });
    const description = (req.body.description || 'Pagamento de corrida').slice(0, 120);

    const code = `ST-${randomUUID().slice(0, 8).toUpperCase()}`;
    const payment = await QrPayment.create({
      code,
      payeeId: req.user._id,
      payeeName: req.user.name,
      amountCents,
      description,
      expiresAt: new Date(Date.now() + QR_TTL_MS),
    });

    const payload = JSON.stringify({ code, v: 2 });
    const qrDataUrl = await QRCode.toDataURL(payload, { width: 320, margin: 2 });

    res.status(201).json({ payment: payment.toJSON(), qrDataUrl, payload });
  })
);

// Verificar um QR antes de pagar
router.get(
  '/verify/:code',
  auth,
  asyncHandler(async (req, res) => {
    const payment = await QrPayment.findOne({ code: req.params.code });
    if (!payment) throw new AppError('QR Code inválido', 404);
    if (payment.status === 'paid') throw new AppError('QR Code já pago', 400);
    if (payment.status === 'expired' || payment.expiresAt < new Date()) {
      if (payment.status !== 'expired') {
        payment.status = 'expired';
        await payment.save();
      }
      throw new AppError('QR Code expirado', 400);
    }
    if (String(payment.payeeId) === String(req.user._id)) {
      throw new AppError('Não pode pagar o seu próprio QR', 400);
    }
    res.json({ payment: payment.toJSON() });
  })
);

// Pagar um QR (com PIN)
router.post(
  '/pay',
  auth,
  asyncHandler(async (req, res) => {
    const { code, pin } = req.body;
    if (!code) throw new AppError('Código em falta', 400);

    if (!req.user.pinHash) throw new AppError('Defina primeiro um PIN de pagamento', 400);
    if (!(await req.user.comparePin(pin))) throw new AppError('PIN incorrecto', 400);

    // Marca o QR como pago de forma atómica (evita duplo pagamento)
    const payment = await QrPayment.findOneAndUpdate(
      { code, status: 'active', expiresAt: { $gt: new Date() }, payeeId: { $ne: req.user._id } },
      { status: 'paid', paidById: req.user._id },
      { new: true }
    );

    if (!payment) {
      const existing = await QrPayment.findOne({ code });
      if (!existing) throw new AppError('QR Code inválido', 404);
      if (String(existing.payeeId) === String(req.user._id)) {
        throw new AppError('Não pode pagar o seu próprio QR', 400);
      }
      if (existing.status === 'paid') throw new AppError('QR Code já pago', 400);
      throw new AppError('QR Code expirado', 400);
    }

    try {
      const result = await walletService.transfer({
        sender: req.user,
        recipientId: payment.payeeId,
        amountCents: payment.amountCents,
        type: 'qr_payment',
        description: payment.description,
        reference: `qr:${payment.code}`,
      });

      getIO()?.to(`user:${payment.payeeId}`).emit('wallet:received', {
        amount: toKz(payment.amountCents),
        from: req.user.name,
        via: 'qr',
      });
      notify(payment.payeeId, {
        type: 'payment_received',
        title: 'Pagamento recebido',
        body: `Recebeste ${toKz(payment.amountCents)} Kz de ${req.user.name} (QR).`,
        metadata: { amount: toKz(payment.amountCents), from: req.user.name, via: 'qr' },
      });

      res.json({
        balance: toKz(result.balanceCents),
        transaction: result.debit.toJSON(),
        payee: payment.payeeName,
        amount: toKz(payment.amountCents),
      });
    } catch (err) {
      // Reverte o estado do QR se o pagamento falhar (ex: saldo insuficiente)
      payment.status = 'active';
      payment.paidById = null;
      await payment.save();
      throw err;
    }
  })
);

module.exports = router;
