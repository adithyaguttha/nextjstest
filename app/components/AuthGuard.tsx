'use client';

import { useAuth } from '../../lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Allow access to the auth page itself
  const isAuthPage = pathname === '/auth';

  useEffect(() => {
    if (!isAuthPage && user === null) {
      router.replace('/auth');
    }
  }, [user, router, isAuthPage]);

  if (!isAuthPage && user === undefined) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
} 