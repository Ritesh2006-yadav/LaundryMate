'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  Sparkles,
  CreditCard,
  MessageSquareWarning,
  LogOut,
  Shirt,
  X,
  ShieldCheck,
} from 'lucide-react';

export default function StaffSidebar({ mobileOpen, setMobileOpen, user }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff/orders', label: 'All Orders', icon: ClipboardList },
    { href: '/staff/collections', label: 'Collection Management', icon: Layers },
    { href: '/staff/premium-orders', label: 'Premium Orders', icon: Sparkles },
    { href: '/staff/payments', label: 'Payments', icon: CreditCard },
    { href: '/staff/complaints', label: 'Complaints', icon: MessageSquareWarning },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#1b4332] text-white rounded-lg flex items-center justify-center">
                <Shirt size={20} />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-tight">
                  LaundryMate
                </h1>
                <p className="text-[11px] font-semibold text-[#1b4332] uppercase tracking-wider">
                  Staff Operations
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/staff/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1b4332] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-[#e9f7ee] hover:text-[#1b4332]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Staff details & Logout */}
        <div className="p-3 border-t border-gray-100">
          <div className="p-3 bg-gray-50 rounded-lg mb-2">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={15} className="text-[#1b4332]" />
              <p className="text-xs font-bold text-gray-900 truncate">
                {user?.name || 'Staff Member'}
              </p>
            </div>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            <p className="text-[10px] text-[#1b4332] font-semibold mt-0.5 uppercase tracking-wide">
              Role: {user?.role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
