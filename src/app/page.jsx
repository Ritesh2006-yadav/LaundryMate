'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { readApiResponse } from '@/lib/api-client';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await readApiResponse(res);
        if (data.success && data.user) {
          if (data.user.role === 'staff' || data.user.role === 'admin') {
            router.push('/staff/dashboard');
          } else {
            router.push('/student/dashboard');
          }
        } else {
          router.push('/login');
        }
      } catch (e) {
        router.push('/login');
      }
    }
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
      <LoadingSpinner message="Connecting to LaundryMate..." />
    </div>
  );
}
