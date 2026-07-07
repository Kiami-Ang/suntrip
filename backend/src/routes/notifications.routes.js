const express = require('express');
const Notification = require('../models/Notification');
const { auth, asyncHandler } = require('../middleware/auth');

const router = express.Router();

// Listar notificações do utilizador
router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const items = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unread = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ notifications: items.map((n) => n.toJSON()), unread });
  })
);

// Nº de não lidas
router.get(
  '/unread-count',
  auth,
  asyncHandler(async (req, res) => {
    const unread = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ unread });
  })
);

// Marcar todas como lidas
router.post(
  '/read-all',
  auth,
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: 'Todas marcadas como lidas' });
  })
);

// Marcar uma como lida
router.post(
  '/:id/read',
  auth,
  asyncHandler(async (req, res) => {
    await Notification.updateOne({ _id: req.params.id, userId: req.user._id }, { read: true });
    res.json({ message: 'Marcada como lida' });
  })
);

module.exports = router;
