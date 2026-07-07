const { z } = require('zod');

const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];

const emailSchema = z
  .string({ required_error: 'Email é obrigatório' })
  .trim()
  .refine((v) => !/[A-Z]/.test(v), { message: 'O email não pode conter maiúsculas' })
  .transform((v) => v.toLowerCase())
  .refine((v) => /^[^\s@]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(v), { message: 'Formato de email inválido' })
  .refine((v) => ALLOWED_EMAIL_DOMAINS.includes(v.split('@')[1]), {
    message: `Use um email: ${ALLOWED_EMAIL_DOMAINS.join(', ')}`,
  });

// Telemóvel angolano: 9 dígitos, começa por 9
const phoneSchema = z
  .string({ required_error: 'Telefone é obrigatório' })
  .trim()
  .regex(/^9\d{8}$/, 'Telefone deve ter 9 dígitos e começar por 9 (ex: 923456789)');

const passwordSchema = z
  .string({ required_error: 'Palavra-passe é obrigatória' })
  .min(6, 'Palavra-passe deve ter pelo menos 6 caracteres');

const nameSchema = z
  .string({ required_error: 'Nome é obrigatório' })
  .trim()
  .min(3, 'Nome completo é obrigatório');

const pinSchema = z
  .string({ required_error: 'PIN é obrigatório' })
  .regex(/^\d{4,6}$/, 'PIN deve ter 4 a 6 dígitos');

const registerClientSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  bankAccount: z.string().trim().optional().default(''),
  address: z.string().trim().optional().default(''),
});

const registerDriverSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  bankAccount: z.string().trim().min(4, 'Conta bancária é obrigatória'),
  driverLicense: z.string().trim().min(3, 'Carta de condução é obrigatória'),
  vehiclePlate: z.string().trim().min(5, 'Matrícula inválida').transform((v) => v.toUpperCase()),
  idDocument: z.string().trim().min(3, 'Documento de identificação é obrigatório'),
  professionalNotes: z.string().trim().optional().default(''),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Palavra-passe é obrigatória' }).min(1, 'Palavra-passe é obrigatória'),
});

module.exports = {
  ALLOWED_EMAIL_DOMAINS,
  emailSchema,
  phoneSchema,
  passwordSchema,
  nameSchema,
  pinSchema,
  registerClientSchema,
  registerDriverSchema,
  loginSchema,
};
