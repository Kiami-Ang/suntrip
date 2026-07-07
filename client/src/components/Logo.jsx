import Link from 'next/link';
import { Sun } from 'lucide-react';

export default function Logo({ size = 'md', showIcon = true, href = '/dashboard' }) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };
  const iconSizes = { sm: 18, md: 22, lg: 28 };

  return (
    <Link href={href} className={`flex items-center gap-2 font-bold tracking-tight ${sizes[size]}`}>
      {showIcon && (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-suntrip-yellow/20">
          <Sun size={iconSizes[size]} className="text-suntrip-yellow" fill="currentColor" />
        </span>
      )}
      <span>
        <span className="text-suntrip-yellow">Sun</span>
        <span className="text-white">Trip</span>
      </span>
    </Link>
  );
}
