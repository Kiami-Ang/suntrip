const nodemailer = require('nodemailer');

const {
  BREVO_API_KEY,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  SENDER_EMAIL,
} = process.env;

// Extrai o email do formato "Nome <email@dominio>" ou usa o valor direto.
function parseSender() {
  const raw = EMAIL_FROM || '';
  const match = raw.match(/<([^>]+)>/);
  const email = (match ? match[1] : SENDER_EMAIL || SMTP_USER || '').trim();
  const name = raw.replace(/<[^>]+>/, '').trim() || 'SunTrip';
  return { name, email };
}

// Prioridade: Brevo (API HTTP, funciona no Render grátis) > SMTP > desativado.
const useBrevo = Boolean(BREVO_API_KEY);
const useSmtp = !useBrevo && Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter = null;
if (useSmtp) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/** Indica se o envio real de emails está ativo. */
const emailEnabled = () => useBrevo || useSmtp;

function buildHtml(code, name, intro) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;background:#0c1a2e;border-radius:16px;color:#fff">
      <h2 style="color:#fcc103;margin:0 0 8px">SunTrip</h2>
      <p style="margin:0 0 16px;color:#cdd7e6">Olá ${name || ''}, ${intro}</p>
      <div style="font-size:34px;letter-spacing:8px;font-weight:bold;text-align:center;background:#13294a;padding:18px;border-radius:12px;color:#fff">${code}</div>
      <p style="margin:16px 0 0;color:#8fa3bf;font-size:13px">O código é válido por 30 minutos. Se não pediste isto, ignora este email.</p>
    </div>`;
}

// Envia qualquer email de código (verificação ou recuperação) via Brevo/SMTP.
async function sendCodeEmail(to, code, name, subject, intro) {
  const html = buildHtml(code, name, intro);
  const text = `O teu código SunTrip é: ${code} (válido 30 minutos).`;

  if (useBrevo) {
    const sender = parseSender();
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: sender.name, email: sender.email },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Brevo ${res.status}: ${detail}`);
    }
    return true;
  }
  if (useSmtp) {
    await transporter.sendMail({ from: EMAIL_FROM || `SunTrip <${SMTP_USER}>`, to, subject, text, html });
    return true;
  }
  console.log(`[email] (envio desativado) ${subject} para ${to}: ${code}`);
  return false;
}

async function sendVerificationEmail(to, code, name = '') {
  return sendCodeEmail(
    to,
    code,
    name,
    `SunTrip — o teu código é ${code}`,
    'confirma o teu email com o código abaixo:'
  );
}

async function sendPasswordResetEmail(to, code, name = '') {
  return sendCodeEmail(
    to,
    code,
    name,
    `SunTrip — recuperar palavra-passe (${code})`,
    'usa o código abaixo para redefinir a tua palavra-passe:'
  );
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail, emailEnabled };
