const express = require('express');
const User = require('../models/User');
const { auth, asyncHandler } = require('../middleware/auth');
const { AppError } = require('../middleware/error');
const { parseAmountKz, toKz } = require('../utils/money');
const walletService = require('../services/wallet.service');
const { getIO } = require('../socket');

const router = express.Router();

const MIN_DEPOSIT = 10000; // 100 Kz em cêntimos
const MIN_TRANSFER = 5000; // 50 Kz

router.get(
  '/balance',
  auth,
  asyncHandler(async (req, res) => {
    res.json({ balance: toKz(req.user.balanceCents), balanceCents: req.user.balanceCents });
  })
);

router.post(
  '/deposit',
  auth,
  asyncHandler(async (req, res) => {
    const amountCents = parseAmountKz(req.body.amount, { min: MIN_DEPOSIT });
    const { transaction, balanceCents } = await walletService.deposit(req.user, amountCents, {
      reference: req.body.reference,
    });
    res.json({ balance: toKz(balanceCents), transaction: transaction.toJSON() });
  })
);

async function requirePin(user, pin) {
  if (!user.pinHash) throw new AppError('Defina primeiro um PIN de pagamento', 400);
  const ok = await user.comparePin(pin);
  if (!ok) throw new AppError('PIN incorrecto', 400);
}

router.post(
  '/transfer',
  auth,
  asyncHandler(async (req, res) => {
    const { recipientId, pin, description, reference } = req.body;
    if (!recipientId) throw new AppError('Destinatário em falta', 400);
    const amountCents = parseAmountKz(req.body.amount, { min: MIN_TRANSFER });

    await requirePin(req.user, pin);

    const result = await walletService.transfer({
      sender: req.user,
      recipientId,
      amountCents,
      type: 'transfer',
      description,
      reference,
    });

    // Notificação em tempo real ao destinatário
    if (!result.duplicated) {
      getIO()?.to(`user:${recipientId}`).emit('wallet:received', {
        amount: toKz(amountCents),
        from: req.user.name,
      });
    }

    res.json({
      balance: toKz(result.balanceCents),
      transaction: result.debit.toJSON(),
    });
  })
);

module.exports = router;
