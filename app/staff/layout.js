"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";

export default function StaffLayout({ children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on Staff Login, render standalone without dashboard sidebar/header
  if (pathname?.startsWith("/staff/login")) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F5F4FA]">
      {/* Desktop Sidebar (Fixed Left, Full 100vh height) */}
      <div className="hidden lg:flex flex-col w-64 h-full flex-shrink-0 z-30">
        <Sidebar role="staff" />
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
              role="staff"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          role="staff"
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobileMenuOpen={mobileMenuOpen}
        />
        <div id="main-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16 page-enter">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

