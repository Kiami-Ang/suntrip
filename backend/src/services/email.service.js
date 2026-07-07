const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
} = process.env;

// O envio de email só está ativo se as credenciais SMTP estiverem configuradas.
const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/** Indica se o envio real de emails está ativo. */
const emailEnabled = () => isConfigured;

async function sendVerificationEmail(to, code, name = '') {
  if (!isConfigured) {
    // Sem SMTP configurado: apenas regista no log (modo desenvolvimento).
    console.log(`[email] (SMTP desativado) Código para ${to}: ${code}`);
    return false;
  }

  const from = EMAIL_FROM || `SunTrip <${SMTP_USER}>`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;background:#0c1a2e;border-radius:16px;color:#fff">
      <h2 style="color:#fcc103;margin:0 0 8px">SunTrip</h2>
      <p style="margin:0 0 16px;color:#cdd7e6">Olá ${name || ''}, confirma o teu email com o código abaixo:</p>
      <div style="font-size:34px;letter-spacing:8px;font-weight:bold;text-align:center;background:#13294a;padding:18px;border-radius:12px;color:#fff">${code}</div>
      <p style="margin:16px 0 0;color:#8fa3bf;font-size:13px">O código é válido por 30 minutos. Se não pediste isto, ignora este email.</p>
    </div>`;

  await transporter.sendMail({
    from,
    to,
    subject: `SunTrip — o teu código é ${code}`,
    text: `O teu código de verificação SunTrip é: ${code} (válido 30 minutos).`,
    html,
  });
  return true;
}

module.exports = { sendVerificationEmail, emailEnabled };
