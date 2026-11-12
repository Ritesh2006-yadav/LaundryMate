"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Package,
  AlertCircle,
  Users,
  FileText,
} from "lucide-react";

export default function LandingHero() {
  const featureStrip = [
    {
      title: "Online Laundry Request",
      icon: CalendarClock,
    },
    {
      title: "Real-time Tracking",
      icon: Package,
    },
    {
      title: "Issue & Complaint Management",
      icon: AlertCircle,
    },
    {
      title: "Student & Staff Portals",
      icon: Users,
    },
    {
      title: "Digital Records & Reports",
      icon: FileText,
    },
  ];

  return (
    <section className="bg-gradient-to-b from-[#17112F] via-[#211747] to-[#1E143E] pt-12 pb-16 text-white border-b border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Hero Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-14">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#482882] text-white text-xs font-semibold tracking-wide border border-white/15 shadow-sm">
              <span>Lovely Professional University</span>
            </div>

            {/* Main Heading matching user prompt */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px] font-extrabold text-white tracking-tight leading-[1.14]">
              Hostel Laundry <br />
              Management System
            </h1>

            {/* Supporting Text matching user prompt */}
            <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-xl font-normal leading-relaxed">
              A convenient digital platform for LPU hostel residents to book laundry services, track their orders and manage complaints.
            </p>

            {/* Call to Actions matching user prompt */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link href="/portal">
                <button
                  type="button"
                  className="px-7 py-3 rounded-xl bg-[#F58220] hover:bg-[#E07214] text-white font-bold text-sm shadow-orange transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </Link>

              <a href="#services">
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  Explore Services
                </button>
              </a>
            </div>
          </div>

          {/* Right Column: Original LPU Campus Building Photograph (Optimized WebP with PNG Fallback) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-[480px] rounded-2xl overflow-hidden bg-[#1A1235] border border-white/15 shadow-2xl group">
              <picture>
                <source srcSet="/lpu-campus.webp" type="image/webp" />
                <img
                  src="/lpu-campus.png"
                  alt="Lovely Professional University Campus Building"
                  width={1145}
                  height={842}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-auto object-cover rounded-2xl block transition-transform duration-700 group-hover:scale-105"
                />
              </picture>
              {/* Subtle natural shading on bottom of image */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#17112F]/40 via-transparent to-transparent pointer-events-none rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Feature Strip (Bottom of Hero) */}
        <div id="features" className="bg-[#1D1438] border border-white/10 rounded-2xl shadow-card overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {featureStrip.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2.5 transition-colors hover:bg-white/5 cursor-pointer group min-h-[104px]"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[#F58220] transition-all duration-200 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-h-[32px] flex items-center justify-center">
                    <span className="text-xs sm:text-[13px] font-semibold text-white group-hover:text-[#F58220] transition-colors leading-snug px-1">
                      {item.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
