"use client";

import React from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import StudentLoginForm from "@/components/auth/StudentLoginForm";

export default function StudentLoginPage() {
  return (
    <div className="w-full min-h-screen bg-[#F5F4FA] flex flex-col items-center justify-between py-6 px-4 sm:px-6 relative overflow-x-hidden overflow-y-auto font-sans">
      {/* Decorative top soft purple wave gradients matching Screen 03 */}
      <div className="fixed top-0 left-0 w-80 h-48 bg-gradient-to-br from-[#6633CC]/15 via-[#6633CC]/5 to-transparent rounded-br-[140px] pointer-events-none" />
      <div className="fixed top-0 right-0 w-80 h-48 bg-gradient-to-bl from-purple-200/40 via-purple-100/10 to-transparent rounded-bl-[140px] pointer-events-none" />

      {/* Top Logo with Official LPU Seal */}
      <div className="w-full flex justify-center mb-4 sm:mb-6 relative z-10">
        <Logo variant="dark" size="lg" href="/" />
      </div>

      {/* Main Authentication Card matching Screen 03 */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E0F2] shadow-soft p-6 sm:p-8 my-auto relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#211747]">Student Login</h1>
          <p className="text-xs sm:text-sm text-[#6B6780] mt-1 font-normal">
            Sign in to your LMS account
          </p>
        </div>

        <StudentLoginForm />
      </div>

      {/* Back to Portal Link */}
      <div className="text-center my-3 relative z-10">
        <Link
          href="/portal"
          prefetch={true}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6633CC] hover:text-[#4A1F9E] hover:underline transition-colors py-1.5 px-3 rounded-xl hover:bg-purple-50/60"
        >
          <span>← Back to Portal</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-[#8F8A9E] relative z-10 mt-auto">
        © 2026 Lovely Professional University • LPU LMS
      </div>
    </div>
  );
}
