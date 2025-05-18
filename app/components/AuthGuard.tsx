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
    // Only redirect if the user is definitely not logged in
    if (!isAuthPage && user === null) {
      router.replace('/auth');
    }
  }, [user, router, isAuthPage]);

  // Do NOT show a loading spinner or redirect if user is undefined (still loading)
  // Just render the children, so the user stays on the same page during reload

  return <>{children}</>;
} 