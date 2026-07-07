'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/errors';
import { validateEmail, getDashboardPath } from '@/lib/validation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleEmailChange = (value) => {
    setEmail(value.toLowerCase().replace(/\s/g, ''));
    setEmailError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailV = validateEmail(email);
    if (!emailV.ok) {
      setEmailError(emailV.message);
      return;
    }

    setLoading(true);
    try {
      const data = await login(emailV.email, password);
      router.push(getDashboardPath(data.user));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao iniciar sessão'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-suntrip-navy-light via-suntrip-ocean-deep to-suntrip-navy p-12 lg:flex">
        <Logo size="lg" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <h2 className="text-4xl font-bold leading-tight">
            Pagamentos para o <span className="text-suntrip-yellow">transporte</span> em Angola
          </h2>
          <p className="mt-4 text-suntrip-muted">
            QR Code, transferências e carteira em Kwanza. Seguro para clientes e motoristas.
          </p>
        </motion.div>
        <p className="text-sm text-suntrip-muted/60">© 2026 SunTrip · Luanda</p>
      </div>
      <div className="flex flex-1 flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="mt-1 text-suntrip-muted">Aceda à sua conta SunTrip</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                required
                placeholder="seuemail@gmail.com"
              />
              {emailError && <p className="mt-1 text-xs text-red-400">{emailError}</p>}
              <p className="mt-1 text-xs text-suntrip-muted">Apenas gmail, outlook, yahoo ou hotmail</p>
            </div>
            <div>
              <label className="label">Palavra-passe</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-suntrip-muted">
            Não tem conta?{' '}
            <Link href="/register" className="font-medium text-suntrip-yellow hover:underline">
              Criar conta
            </Link>
          </p>
          <p className="mt-4 rounded-xl border border-suntrip-ocean/20 bg-suntrip-card/50 p-3 text-center text-xs text-suntrip-muted">
            Contas demo (após seed): cliente@gmail.com / demo123 · motorista@gmail.com / demo123
          </p>
        </div>
      </div>
    </div>
  );
}
