'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/lib/validation';

export default function ProtectedRoute({ children, adminOnly = false, userType }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (adminOnly && user.role !== 'admin') {
      router.replace(getDashboardPath(user));
      return;
    }
    if (userType && user.userType !== userType && user.role !== 'admin') {
      router.replace(getDashboardPath(user));
    }
  }, [user, loading, router, adminOnly, userType]);

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-suntrip-yellow border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && user.role !== 'admin') return null;
  if (userType && user.userType !== userType && user.role !== 'admin') return null;

  return children;
}
