'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EnquiredProjects from '../components/EnquiredProjects';
import { Loader2 } from 'lucide-react';

export default function EnquiriesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          router.push('/login');
          return;
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking auth:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Enquiries</h1>
      <EnquiredProjects />
    </div>
  );
} 