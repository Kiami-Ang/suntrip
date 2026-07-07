const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validateName, validatePhone } = require('../utils/validation');

const router = express.Router();
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `avatar-${req.user._id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  },
});

router.get('/profile', auth, (req, res) => {
  res.json({ user: req.user.toPublic() });
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (name) {
      const nameV = validateName(name);
      if (!nameV.ok) return res.status(400).json({ message: nameV.message });
      req.user.name = nameV.name;
    }
    if (phone) {
      const phoneV = validatePhone(phone);
      if (!phoneV.ok) return res.status(400).json({ message: phoneV.message });
      const existsPhone = await User.findOne({ phone: phoneV.phone, _id: { $ne: req.user._id } });
      if (existsPhone) return res.status(400).json({ message: 'Telefone já registado' });
      req.user.phone = phoneV.phone;
    }
    await req.user.save();
    res.json({ user: req.user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Ficheiro de avatar em falta' });
    }
    req.user.avatar = `/uploads/${req.file.filename}`;
    await req.user.save();
    res.json({ user: req.user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search', auth, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ users: [] });
  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { email: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
      { name: new RegExp(q, 'i') },
    ],
  })
    .limit(10)
    .select('name email phone avatar');
  res.json({
    users: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      avatar: u.avatar,
    })),
  });
});

module.exports = router;
