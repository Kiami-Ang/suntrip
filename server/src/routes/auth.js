const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');
const { signToken } = require('../utils/token');
const { auth } = require('../middleware/auth');
const {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  validateBankAccount,
  validatePlate,
} = require('../utils/validation');

const router = express.Router();
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `vehicle-${Date.now()}${path.extname(file.originalname) || '.jpg'}`),
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  },
});

const respondAuth = (user, res, status = 200) => {
  const token = signToken(user._id);
  const body = { token, user: user.toPublic() };
  if (status === 201) return res.status(201).json(body);
  return res.json(body);
};

router.post('/register/client', async (req, res) => {
  try {
    const { name, email, phone, password, bankAccount, iban, address } = req.body;

    const nameV = validateName(name);
    if (!nameV.ok) return res.status(400).json({ message: nameV.message });

    const emailV = validateEmail(email);
    if (!emailV.ok) return res.status(400).json({ message: emailV.message });

    const phoneV = validatePhone(phone);
    if (!phoneV.ok) return res.status(400).json({ message: phoneV.message });

    const passV = validatePassword(password);
    if (!passV.ok) return res.status(400).json({ message: passV.message });

    const bank = bankAccount || iban;
    const bankV = validateBankAccount(bank, 'Conta bancária ou IBAN');
    if (!bankV.ok) return res.status(400).json({ message: bankV.message });

    const exists = await User.findOne({ email: emailV.email });
    if (exists) return res.status(400).json({ message: 'Email já registado' });

    const existsPhone = await User.findOne({ phone: phoneV.phone });
    if (existsPhone) return res.status(400).json({ message: 'Telefone já registado' });

    const user = await User.create({
      name: nameV.name,
      email: emailV.email,
      phone: phoneV.phone,
      password,
      userType: 'client',
      role: 'user',
      bankAccount: bankAccount || '',
      iban: iban || bankAccount || '',
      address: address || '',
    });

    respondAuth(user, res, 201);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Erro no registo' });
  }
});

router.post('/register/driver', upload.single('vehiclePhoto'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      bankAccount,
      iban,
      driverLicense,
      vehiclePlate,
      idDocument,
      professionalNotes,
    } = req.body;

    const nameV = validateName(name);
    if (!nameV.ok) return res.status(400).json({ message: nameV.message });

    const emailV = validateEmail(email);
    if (!emailV.ok) return res.status(400).json({ message: emailV.message });

    const phoneV = validatePhone(phone);
    if (!phoneV.ok) return res.status(400).json({ message: phoneV.message });

    const passV = validatePassword(password);
    if (!passV.ok) return res.status(400).json({ message: passV.message });

    const bankV = validateBankAccount(bankAccount || iban, 'Conta bancária');
    if (!bankV.ok) return res.status(400).json({ message: bankV.message });

    if (!driverLicense?.trim()) {
      return res.status(400).json({ message: 'Número da carta de condução é obrigatório' });
    }
    const plateV = validatePlate(vehiclePlate);
    if (!plateV.ok) return res.status(400).json({ message: plateV.message });

    if (!idDocument?.trim()) {
      return res.status(400).json({ message: 'Documento de identificação é obrigatório' });
    }

    const exists = await User.findOne({ email: emailV.email });
    if (exists) return res.status(400).json({ message: 'Email já registado' });

    const existsPhone = await User.findOne({ phone: phoneV.phone });
    if (existsPhone) return res.status(400).json({ message: 'Telefone já registado' });

    const user = await User.create({
      name: nameV.name,
      email: emailV.email,
      phone: phoneV.phone,
      password,
      userType: 'driver',
      role: 'user',
      bankAccount: bankAccount || '',
      iban: iban || '',
      driverLicense: driverLicense.trim(),
      vehiclePlate: plateV.plate,
      idDocument: idDocument.trim(),
      vehiclePhoto: req.file ? `/uploads/${req.file.filename}` : '',
      professionalNotes: professionalNotes || '',
    });

    respondAuth(user, res, 201);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Erro no registo' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailV = validateEmail(email);
    if (!emailV.ok) return res.status(400).json({ message: emailV.message });

    const passV = validatePassword(password);
    if (!passV.ok) return res.status(400).json({ message: passV.message });

    const user = await User.findOne({ email: emailV.email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email ou palavra-passe incorrectos' });
    }

    user.lastActive = new Date();
    await user.save();
    respondAuth(user, res);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Erro no login' });
  }
});

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user.toPublic() });
});

router.post('/logout', auth, (_req, res) => {
  res.json({ message: 'Sessão terminada' });
});

module.exports = router;
