'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, QrCode, ScanLine, User } from 'lucide-react';

const links = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/wallet', icon: Wallet, label: 'Carteira' },
  { href: '/qr/generate', icon: QrCode, label: 'QR' },
  { href: '/qr/scan', icon: ScanLine, label: 'Ler' },
  { href: '/profile', icon: User, label: 'Perfil' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-suntrip-gray-light/50 bg-suntrip-black/95 backdrop-blur lg:hidden">
      <div className="flex justify-around py-2">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs ${
                active ? 'text-suntrip-green' : 'text-gray-500'
              }`}
            >
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
