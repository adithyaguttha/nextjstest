'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyActivityPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/my-activity/saved');
  }, [router]);

  return null;
} 