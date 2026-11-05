'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentSidebar from '@/components/student/StudentSidebar';
import { Menu, Bell } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { readApiResponse } from '@/lib/api-client';

export default function StudentLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await readApiResponse(res);
        if (data.success && data.user) {
          if (data.user.role === 'staff' || data.user.role === 'admin') {
            router.push('/staff/dashboard');
            return;
          }
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFAF6]">
        <LoadingSpinner message="Loading student portal..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF6] flex">
      {/* Sidebar */}
      <StudentSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} user={user} />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-1.5 rounded-lg border border-gray-200"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                Hostel Laundry Service
              </span>
              {user?.hostel && (
                <span className="hidden sm:inline-block text-xs bg-[#FFF1E5] text-[#B95E19] font-semibold px-2 py-0.5 rounded">
                  {user.hostel} · {user.block} - {user.roomNumber}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900">{user?.name}</p>
              <p className="text-[10px] text-gray-500 font-mono">{user?.registrationNumber}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#B95E19] text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'S'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
