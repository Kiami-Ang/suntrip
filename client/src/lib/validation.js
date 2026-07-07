export const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateEmail(email) {
  const raw = String(email || '').trim();
  if (!raw) return { ok: false, message: 'Email é obrigatório' };
  if (/[A-Z]/.test(raw)) {
    return { ok: false, message: 'O email não pode conter letras maiúsculas' };
  }
  const normalized = normalizeEmail(raw);
  const match = normalized.match(/^[^\s@]+@[a-z0-9.-]+\.[a-z]{2,}$/);
  if (!match) return { ok: false, message: 'Formato de email inválido' };
  const domain = normalized.split('@')[1];
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return { ok: false, message: `Use apenas: ${ALLOWED_EMAIL_DOMAINS.join(', ')}` };
  }
  return { ok: true, email: normalized };
}

export function validatePhone(phone) {
  const raw = String(phone || '').trim();
  if (!raw) return { ok: false, message: 'Telefone é obrigatório' };
  if (!/^\d+$/.test(raw)) {
    return { ok: false, message: 'Telefone só pode conter números (9 dígitos)' };
  }
  if (!/^9\d{8}$/.test(raw)) {
    return {
      ok: false,
      message: 'Telefone inválido: deve ter 9 dígitos e começar com 9 (ex: 923456789)',
    };
  }
  return { ok: true, phone: raw };
}

/** Bloqueia dígitos que não começam por 9 (Angola). */
export function sanitizeAngolanPhoneInput(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 9);
  if (digits.length > 0 && digits[0] !== '9') return '';
  return digits;
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return { ok: false, message: 'Palavra-passe deve ter pelo menos 6 caracteres' };
  }
  return { ok: true };
}

export function validateName(name) {
  const n = String(name || '').trim();
  if (n.length < 3) return { ok: false, message: 'Nome completo é obrigatório' };
  return { ok: true, name: n };
}

export function validateBankAccount(value, label = 'Conta bancária') {
  const v = String(value || '').trim();
  if (v.length < 4) return { ok: false, message: `${label} é obrigatória` };
  return { ok: true, value: v };
}

export function validatePlate(plate) {
  const p = String(plate || '').trim().toUpperCase();
  if (p.length < 5) return { ok: false, message: 'Matrícula inválida (ex: LD-45-23-AB)' };
  return { ok: true, plate: p };
}

export function getDashboardPath(user) {
  if (!user) return '/login';
  if (user.role === 'admin') return '/admin';
  if (user.userType === 'driver') return '/dashboard/motorista';
  return '/dashboard';
}
