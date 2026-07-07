'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, QrCode, ArrowLeftRight, History, LogOut } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import { getUploadUrl } from '@/lib/api';
import { getDashboardPath } from '@/lib/validation';

const clientTabs = [
  { href: '/dashboard', label: 'Painel', icon: LayoutGrid, paths: ['/dashboard'] },
  { href: '/qr/scan', label: 'Pagar', icon: QrCode, paths: ['/qr/scan'] },
  { href: '/wallet', label: 'Carteira', icon: ArrowLeftRight, paths: ['/wallet', '/bank-transfer'] },
  { href: '/transactions', label: 'Histórico', icon: History, paths: ['/transactions'] },
];

const driverTabs = [
  { href: '/dashboard/motorista', label: 'Painel', icon: LayoutGrid, paths: ['/dashboard/motorista'] },
  { href: '/qr/generate', label: 'QR', icon: QrCode, paths: ['/qr/generate', '/qr/scan'] },
  { href: '/wallet', label: 'Carteira', icon: ArrowLeftRight, paths: ['/wallet', '/bank-transfer'] },
  { href: '/transactions', label: 'Histórico', icon: History, paths: ['/transactions'] },
];

export default function AppShell({ children, title }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isDriver = user?.userType === 'driver';
  const tabs = isDriver ? driverTabs : clientTabs;
  const homeHref = getDashboardPath(user);

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  const isActive = (tab) =>
    tab.paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen pb-8">
      <header className="mx-auto max-w-lg border-b border-suntrip-border/30 bg-suntrip-navy/40 px-4 pb-3 pt-4 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Logo size="md" href={homeHref} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border border-suntrip-border/50 px-2.5 py-1.5 text-[11px] font-medium text-suntrip-muted transition hover:border-red-400/40 hover:text-red-300"
              title="Sair da conta"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sair</span>
            </button>
            <Link
              href="/profile"
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-yellow text-xs font-bold text-suntrip-navy shadow-yellow transition hover:scale-105"
            >
              {user?.avatar ? (
                <img src={getUploadUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </Link>
          </div>
        </div>

        <nav className="flex gap-1.5 overflow-x-auto pb-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`nav-tab ${isActive(tab) ? 'nav-tab-active' : 'nav-tab-inactive'}`}
              >
                <Icon size={15} strokeWidth={2} />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {title && <h1 className="mt-3 text-base font-semibold text-suntrip-white/90">{title}</h1>}
      </header>

      <main className="mx-auto max-w-lg animate-fade-in px-4 pt-5">{children}</main>
    </div>
  );
}
