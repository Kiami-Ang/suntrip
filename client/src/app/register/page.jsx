'use client';

import Link from 'next/link';
import { User, Car } from 'lucide-react';
import Logo from '@/components/Logo';

export default function RegisterChoosePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Logo size="lg" />
      <h1 className="mt-8 text-2xl font-bold">Criar conta SunTrip</h1>
      <p className="mt-2 text-center text-suntrip-muted">Escolha o tipo de registo</p>

      <div className="mt-8 grid w-full max-w-md gap-4">
        <Link
          href="/register/cliente"
          className="card flex items-center gap-4 transition hover:border-suntrip-yellow/50"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-suntrip-ocean/20">
            <User className="text-suntrip-yellow" size={28} />
          </span>
          <div>
            <p className="font-semibold">Sou Cliente</p>
            <p className="text-sm text-suntrip-muted">Pagar corridas e usar a carteira</p>
          </div>
        </Link>

        <Link
          href="/register/motorista"
          className="card flex items-center gap-4 transition hover:border-suntrip-yellow/50"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-suntrip-yellow/20">
            <Car className="text-suntrip-yellow" size={28} />
          </span>
          <div>
            <p className="font-semibold">Sou Taxista / Motorista</p>
            <p className="text-sm text-suntrip-muted">Receber pagamentos via QR Code</p>
          </div>
        </Link>
      </div>

      <p className="mt-8 text-sm text-suntrip-muted">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-suntrip-yellow hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
