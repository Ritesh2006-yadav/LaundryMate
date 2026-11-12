"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
import { useAuth } from "@/context/AuthContext";

export default function StudentLayout({ children }) {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Unauthenticated authentication pages use a standalone layout (no dashboard sidebar/header)
  const isAuthPage =
    pathname?.startsWith("/student/login") ||
    pathname?.startsWith("/student/register") ||
    pathname?.startsWith("/student/forgot-password");

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F5F4FA] fixed inset-0">
      {/* Desktop Sidebar (Fixed Left, Full 100vh height, Never scrolls with main page) */}
      <div className="hidden lg:flex flex-col w-64 h-full flex-shrink-0 z-30">
        <Sidebar role="student" />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-[#211747] shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              role="student"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area: Fixed Top Header + Independently Scrollable Dashboard Body */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Fixed/Sticky Header at Top of Main Viewport */}
        <Header
          role="student"
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobileMenuOpen={mobileMenuOpen}
        />

        {/* Independently Scrollable Content Container */}
        <div id="main-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16 page-enter">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
