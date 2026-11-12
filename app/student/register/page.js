"use client";

import React from "react";
import Logo from "@/components/ui/Logo";
import StudentRegisterForm from "@/components/auth/StudentRegisterForm";

export default function StudentRegisterPage() {
  return (
    <div className="w-full min-h-screen bg-[#F5F4FA] flex flex-col items-center py-8 px-4 sm:px-6 relative overflow-x-hidden overflow-y-auto font-sans">
      {/* Decorative top soft purple wave gradients matching Screen 04 */}
      <div className="fixed top-0 left-0 w-80 h-48 bg-gradient-to-br from-[#6633CC]/15 via-[#6633CC]/5 to-transparent rounded-br-[140px] pointer-events-none" />
      <div className="fixed top-0 right-0 w-80 h-48 bg-gradient-to-bl from-purple-200/40 via-purple-100/10 to-transparent rounded-bl-[140px] pointer-events-none" />
      
      {/* Decorative bottom subtle shape */}
      <div className="fixed bottom-0 right-0 w-64 h-36 bg-gradient-to-tl from-purple-100/30 to-transparent rounded-tl-[100px] pointer-events-none" />

      {/* Top Logo with Official LPU Seal with clean spacing below */}
      <div className="w-full flex justify-center mb-6 relative z-10">
        <Logo variant="dark" size="lg" href="/" />
      </div>

      {/* Main Authentication Card matching Screen 04 */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E0F2] shadow-soft p-6 sm:p-8 relative z-10 mb-8">
        {/* Heading & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#211747]">
            Create Student Account
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6780] mt-1 font-normal">
            Register to use laundry services
          </p>
        </div>

        {/* Student Registration Form */}
        <StudentRegisterForm />
      </div>

      {/* Footer */}
      <div className="text-center pb-4 text-xs text-[#8F8A9E] relative z-10 mt-auto">
        © 2026 Lovely Professional University • LPU LMS
      </div>
    </div>
  );
}
