'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/errors';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validateBankAccount,
  getDashboardPath,
  sanitizeAngolanPhoneInput,
} from '@/lib/validation';

export default function RegisterClientPage() {
  const router = useRouter();
  const { registerClient } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    bankAccount: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handlePhone = (value) => {
    set('phone', sanitizeAngolanPhoneInput(value));
  };

  const handleEmail = (value) => {
    set('email', value.toLowerCase().replace(/\s/g, ''));
  };

  const validateForm = () => {
    const next = {};
    const nameV = validateName(form.name);
    if (!nameV.ok) next.name = nameV.message;

    const phoneV = validatePhone(form.phone);
    if (!phoneV.ok) next.phone = phoneV.message;

    const emailV = validateEmail(form.email);
    if (!emailV.ok) next.email = emailV.message;

    const passV = validatePassword(form.password);
    if (!passV.ok) next.password = passV.message;
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'As palavras-passe não coincidem';
    }

    const bankV = validateBankAccount(form.bankAccount, 'Conta bancária ou IBAN');
    if (!bankV.ok) next.bankAccount = bankV.message;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const emailV = validateEmail(form.email);
      const phoneV = validatePhone(form.phone);
      const data = await registerClient({
        name: form.name.trim(),
        phone: phoneV.phone,
        email: emailV.email,
        password: form.password,
        bankAccount: form.bankAccount.trim(),
        address: form.address.trim(),
      });
      router.push(getDashboardPath(data.user));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro no registo'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link href="/register" className="text-sm text-suntrip-ocean hover:underline">
          ← Voltar
        </Link>
        <div className="mt-4">
          <Logo size="md" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Registo de Cliente</h1>
        <p className="mt-1 text-sm text-suntrip-muted">Pague corridas com a carteira SunTrip</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Field label="Nome completo" error={errors.name}>
            <input
              className="input"
              placeholder="Seu nome completo"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </Field>

          <Field label="Telefone" error={errors.phone} hint="9 dígitos, começa obrigatoriamente com 9">
            <input
              className="input"
              inputMode="numeric"
              pattern="9[0-9]{8}"
              placeholder="923456789"
              value={form.phone}
              onChange={(e) => handlePhone(e.target.value)}
              maxLength={9}
            />
          </Field>

          <Field label="Email" error={errors.email} hint="gmail, outlook, yahoo ou hotmail">
            <input
              className="input"
              type="email"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="seuemail@gmail.com"
              value={form.email}
              onChange={(e) => handleEmail(e.target.value)}
            />
          </Field>

          <Field label="Palavra-passe" error={errors.password}>
            <input
              className="input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
            />
          </Field>

          <Field label="Confirmar palavra-passe" error={errors.confirmPassword}>
            <input
              className="input"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
            />
          </Field>

          <Field label="Conta bancária ou IBAN" error={errors.bankAccount}>
            <input
              className="input"
              placeholder="Digite sua conta bancária"
              value={form.bankAccount}
              onChange={(e) => set('bankAccount', e.target.value)}
            />
          </Field>

          <Field label="Morada (opcional)">
            <input
              className="input"
              placeholder="Bairro, município"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </Field>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'A criar conta...' : 'Criar conta de Cliente'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-suntrip-muted">
          Já tem conta?{' '}
          <Link href="/login" className="text-suntrip-yellow hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-suntrip-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
