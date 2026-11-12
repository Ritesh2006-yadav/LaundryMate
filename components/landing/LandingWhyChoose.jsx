"use client";

import React from "react";
import {
  ShieldCheck,
  Clock,
  Wallet,
  Sparkles,
  DoorOpen,
  Headphones,
  CheckCircle2,
} from "lucide-react";

export default function LandingWhyChoose() {
  const points = [
    {
      title: "Doorstep Hostel Collection",
      desc: "No walking across campus carrying heavy bags. Runners collect and deliver right outside your hostel room door.",
      icon: DoorOpen,
      color: "bg-[#6633CC]/10 text-[#6633CC]",
    },
    {
      title: "Subsidized Student Tariffs",
      desc: "Official university-regulated per-kg rates from ₹20/kg. Transparent weight calculation with zero hidden costs.",
      icon: Wallet,
      color: "bg-[#F58220]/10 text-[#F58220]",
    },
    {
      title: "Express 24-48h Turnaround",
      desc: "Fast, reliable processing cycles so you never run out of clean uniforms or formal shirts during exam weeks.",
      icon: Clock,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Direct Grievance Resolution",
      desc: "Direct complaint submission to the Central Plant supervisor with quick turnaround for any order concerns.",
      icon: Headphones,
      color: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <section id="why-choose" className="py-24 bg-white border-y border-[#E5E3F0] select-none">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6633CC] bg-[#6633CC]/10 border border-[#6633CC]/20 px-3.5 py-1.5 rounded-full inline-block">
              Hostel Resident Benefits
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#211747] tracking-tight leading-tight">
              Why LPU Residents Rely On LMS
            </h2>
            <p className="text-sm sm:text-base text-[#6B6780] leading-relaxed">
              Traditional hostel laundry often leads to misplaced garments, confusing cash accounts, and unpredictable turnaround. LPU LMS replaces uncertainty with digital accountability.
            </p>

            <div className="pt-2 space-y-3.5">
              {[
                "100% digital check-in and doorstep collection logs",
                "Live status tracking across washing, drying and delivery",
                "Calibrated weighing upon pickup with accurate billing",
              ].map((highlight, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-semibold text-[#211747]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {points.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#F5F4FA] rounded-2xl p-6 border border-[#E5E3F0] hover:border-[#6633CC]/40 hover:bg-white hover:shadow-card transition-all duration-300 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${p.color} transition-transform group-hover:scale-105`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#211747] text-base mb-2 group-hover:text-[#6633CC] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B6780] leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
