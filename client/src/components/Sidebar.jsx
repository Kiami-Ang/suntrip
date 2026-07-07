'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  QrCode,
  ScanLine,
  Building2,
  History,
  User,
  Shield,
  LogOut,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallet', label: 'Carteira', icon: Wallet },
  { href: '/qr/generate', label: 'Gerar QR', icon: QrCode },
  { href: '/qr/scan', label: 'Ler QR', icon: ScanLine },
  { href: '/bank-transfer', label: 'Banco', icon: Building2 },
  { href: '/transactions', label: 'Transações', icon: History },
  { href: '/profile', label: 'Perfil', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-suntrip-gray-light/50 bg-suntrip-gray/30 lg:flex">
      <div className="border-b border-suntrip-gray-light/50 p-6">
        <Logo />
        <p className="mt-1 text-xs text-gray-500">Pagamentos de transporte</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                active
                  ? 'bg-suntrip-green/15 text-suntrip-green'
                  : 'text-gray-400 hover:bg-suntrip-gray-light/50 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
              pathname === '/admin'
                ? 'bg-suntrip-gold/20 text-suntrip-gold'
                : 'text-gray-400 hover:bg-suntrip-gray-light/50'
            }`}
          >
            <Shield size={20} />
            Admin
          </Link>
        )}
      </nav>
      <div className="border-t border-suntrip-gray-light/50 p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
