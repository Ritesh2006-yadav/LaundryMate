"use client";

import React from "react";
import Logo from "@/components/ui/Logo";

export default function AuthCard({
  title,
  subtitle,
  children,
  maxWidth = "max-w-md",
}) {
  return (
    <div className="min-h-screen bg-[#F5F4FA] flex flex-col justify-center items-center p-4 sm:p-6 select-none">
      {/* Top Logo */}
      <div className="w-full flex justify-center mb-6">
        <Logo variant="dark" size="lg" href="/" />
      </div>

      {/* Main Card */}
      <div
        className={`w-full ${maxWidth} bg-white rounded-3xl border border-[#E5E3F0] shadow-soft p-6 sm:p-8`}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#211747]">{title}</h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#6B6780] mt-1">{subtitle}</p>
          )}
        </div>

        {children}
      </div>

      <div className="text-center mt-6 text-xs text-[#8F8A9E]">
        © 2026 Lovely Professional University • LPU LMS
      </div>
    </div>
  );
}
