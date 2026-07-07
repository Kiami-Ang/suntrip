'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/lib/validation';
import Logo from '@/components/Logo';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) router.replace(user ? getDashboardPath(user) : '/login');
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Logo size="lg" />
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-suntrip-yellow border-t-transparent" />
    </div>
  );
}
