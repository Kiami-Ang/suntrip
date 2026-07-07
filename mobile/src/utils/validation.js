export const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateEmail(email) {
  const raw = String(email || '').trim();
  if (!raw) return { ok: false, message: 'Email é obrigatório' };
  if (/[A-Z]/.test(raw)) return { ok: false, message: 'O email não pode ter maiúsculas' };
  const normalized = normalizeEmail(raw);
  if (!/^[^\s@]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(normalized)) {
    return { ok: false, message: 'Formato de email inválido' };
  }
  const domain = normalized.split('@')[1];
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return { ok: false, message: `Use: ${ALLOWED_EMAIL_DOMAINS.join(', ')}` };
  }
  return { ok: true, value: normalized };
}

// Telemóvel angolano: 9 dígitos, começa por 9
export function validatePhone(phone) {
  const raw = String(phone || '').trim();
  if (!raw) return { ok: false, message: 'Telefone é obrigatório' };
  if (!/^9\d{8}$/.test(raw)) {
    return { ok: false, message: 'Telefone deve ter 9 dígitos e começar por 9' };
  }
  return { ok: true, value: raw };
}

// Só permite dígitos e força começar por 9
export function sanitizePhone(value) {
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
  return { ok: true, value: n };
}

export function validatePin(pin) {
  if (!/^\d{4,6}$/.test(String(pin || ''))) {
    return { ok: false, message: 'PIN deve ter 4 a 6 dígitos' };
  }
  return { ok: true };
}
