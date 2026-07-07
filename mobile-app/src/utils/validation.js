export const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];

export function validateEmail(email) {
  const raw = String(email || '').trim();
  if (!raw) return { ok: false, message: 'Email é obrigatório' };
  if (/[A-Z]/.test(raw)) return { ok: false, message: 'O email não pode conter maiúsculas' };
  const normalized = raw.toLowerCase();
  if (!/^[^\s@]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(normalized)) {
    return { ok: false, message: 'Formato de email inválido' };
  }
  const domain = normalized.split('@')[1];
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return { ok: false, message: `Use: ${ALLOWED_EMAIL_DOMAINS.join(', ')}` };
  }
  return { ok: true, email: normalized };
}

export function validatePhone(phone) {
  const raw = String(phone || '').trim();
  if (!raw) return { ok: false, message: 'Telefone é obrigatório' };
  if (!/^9\d{8}$/.test(raw)) {
    return { ok: false, message: 'Telefone: 9 dígitos começando com 9' };
  }
  return { ok: true, phone: raw };
}

export function sanitizeAngolanPhoneInput(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 9);
  if (digits.length > 0 && digits[0] !== '9') return '';
  return digits;
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return { ok: false, message: 'Mínimo 6 caracteres' };
  }
  return { ok: true };
}

export function validateName(name) {
  const n = String(name || '').trim();
  if (n.length < 3) return { ok: false, message: 'Nome obrigatório' };
  return { ok: true, name: n };
}

export function validateBankAccount(value, label = 'Conta bancária') {
  const v = String(value || '').trim();
  if (v.length < 4) return { ok: false, message: `${label} é obrigatória` };
  return { ok: true, value: v };
}

export function validatePlate(plate) {
  const p = String(plate || '').trim().toUpperCase();
  if (p.length < 5) return { ok: false, message: 'Matrícula inválida' };
  return { ok: true, plate: p };
}
