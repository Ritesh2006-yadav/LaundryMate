"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Users, ArrowRight, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function PortalSelectionPage() {
  return (
    <div className="min-h-screen bg-[#F5F4FA] flex flex-col justify-between p-6 sm:p-10 select-none relative overflow-x-hidden overflow-y-auto font-sans">
      {/* Decorative top soft purple wave gradients matching Screen 02 */}
      <div className="absolute top-0 left-0 w-96 h-56 bg-gradient-to-br from-[#6633CC]/20 via-[#6633CC]/5 to-transparent rounded-br-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-56 bg-gradient-to-bl from-purple-200/50 via-purple-100/20 to-transparent rounded-bl-[140px] pointer-events-none" />

      {/* Faint washing machine outline watermark in top right matching Screen 02 */}
      <div className="absolute top-6 right-8 opacity-[0.07] pointer-events-none hidden sm:block">
        <svg
          width="130"
          height="130"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#211747"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="20" x="3" y="2" rx="3" />
          <circle cx="12" cy="13" r="5" />
          <path d="M12 18a2.5 2.5 0 0 0 0-5" />
          <path d="M7 6h1" />
          <path d="M11 6h1" />
        </svg>
      </div>

      {/* Top Header Bar: Back to Home (top-left) & Centered Logo */}
      <div className="w-full max-w-6xl mx-auto relative z-20 pt-1">
        {/* Subtle Back to Home Navigation Link */}
        <div className="sm:absolute sm:top-2 sm:left-0 mb-2 sm:mb-0 flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#6633CC] hover:text-[#4A1F9E] transition-all py-1.5 px-2.5 rounded-full hover:bg-white/80 border border-transparent hover:border-[#E5E0F2]/80 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 text-[#6633CC]" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Top Center Logo with Official LPU Seal */}
        <div className="w-full flex justify-center pt-1">
          <Logo variant="dark" size="lg" href="/" />
        </div>
      </div>

      {/* Center Main Content */}
      <div className="max-w-6xl mx-auto w-full my-auto py-8 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#211747] tracking-tight">
            Choose Your Portal
          </h1>
          <p className="text-sm sm:text-base text-[#6B6780] mt-2 font-normal">
            Access the Laundry Management System based on your role.
          </p>
        </div>

        {/* 3 Portal Cards Grid: Desktop 3 cols, Tablet 2 cols with centered 3rd card, Mobile 1 col */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto items-stretch">
          {/* Card 1: Student Portal (Deep Royal Purple Card) */}
          <div className="bg-gradient-to-b from-[#5623C4] via-[#481EAE] to-[#38158F] text-white rounded-3xl p-8 shadow-purple flex flex-col items-center text-center justify-between relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300">
            <div className="flex flex-col items-center text-center w-full">
              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-105 transition-transform mx-auto">
                <GraduationCap className="w-9 h-9 text-white" />
              </div>

              <h2 className="text-2xl font-bold mb-3 text-white text-center">Student Portal</h2>
              <p className="text-sm text-white/85 leading-relaxed mb-8 font-normal max-w-xs mx-auto text-center min-h-[4.5rem] flex items-center justify-center">
                Book laundry services, track your requests and raise complaints.
              </p>
            </div>

            <div className="w-full">
              <Link href="/student/login" prefetch={true} className="w-full block">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-2xl bg-white text-[#211747] font-bold text-sm hover:bg-[#F5F4FA] transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <span>Continue as Student</span>
                  <ArrowRight className="w-4 h-4 text-[#211747]" />
                </button>
              </Link>
            </div>
          </div>

          {/* Card 2: Staff Portal (Clean White Card) */}
          <div className="bg-white text-[#211747] rounded-3xl p-8 border border-[#E5E0F2] shadow-soft hover:shadow-card flex flex-col items-center text-center justify-between relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300">
            <div className="flex flex-col items-center text-center w-full">
              <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] border border-[#E9DCFF] flex items-center justify-center mb-6 text-[#6633CC] shadow-inner group-hover:scale-105 transition-transform mx-auto">
                <Users className="w-9 h-9 text-[#6633CC]" />
              </div>

              <h2 className="text-2xl font-bold mb-3 text-[#211747] text-center">Staff Portal</h2>
              <p className="text-sm text-[#6B6780] leading-relaxed mb-8 font-normal max-w-xs mx-auto text-center min-h-[4.5rem] flex items-center justify-center">
                Manage laundry requests, process orders, handle complaints and inventory.
              </p>
            </div>

            <div className="w-full">
              <Link href="/staff/login" prefetch={true} className="w-full block">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#6633CC] text-[#6633CC] hover:bg-[#6633CC] hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>Continue as Staff</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Card 3: Admin Portal (Executive Deep Navy Card with Orange Accent) */}
          <div className="bg-gradient-to-b from-[#211747] via-[#2A1B57] to-[#1A1138] text-white rounded-3xl p-8 border border-[#3B2579] shadow-soft hover:shadow-card flex flex-col items-center text-center justify-between relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 md:col-span-2 md:max-w-md md:mx-auto lg:col-span-1 lg:max-w-none lg:mx-0 w-full">
            <div className="flex flex-col items-center text-center w-full">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-105 transition-transform mx-auto">
                <ShieldCheck className="w-9 h-9 text-[#F58220]" />
              </div>

              <h2 className="text-2xl font-bold mb-3 text-white text-center">Admin Portal</h2>
              <p className="text-sm text-white/80 leading-relaxed mb-8 font-normal max-w-xs mx-auto text-center min-h-[4.5rem] flex items-center justify-center">
                Manage university-wide laundry operations, students, staff, hostels, services, inventory and reports.
              </p>
            </div>

            <div className="w-full">
              <Link href="/admin/login" prefetch={true} className="w-full block">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#F58220] hover:bg-[#e07519] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-orange active:scale-[0.99] cursor-pointer"
                >
                  <span>Continue as Admin</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom footer */}
      <div className="text-center py-4 text-xs text-[#8F8A9E] relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span>© 2026 Lovely Professional University • Division of Student Welfare • LPU LMS</span>
      </div>
    </div>
  );
}
