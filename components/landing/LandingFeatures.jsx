"use client";

import React from "react";
import {
  CalendarClock,
  Activity,
  AlertTriangle,
  Users2,
  FileSpreadsheet,
} from "lucide-react";

export default function LandingFeatures() {
  const topFeatures = [
    {
      title: "Online Laundry Request",
      icon: CalendarClock,
    },
    {
      title: "Real-time Tracking",
      icon: Activity,
    },
    {
      title: "Issue & Complaint Management",
      icon: AlertTriangle,
    },
    {
      title: "Student & Staff Portals",
      icon: Users2,
    },
    {
      title: "Digital Records & Reports",
      icon: FileSpreadsheet,
    },
  ];

  return (
    <section id="features" className="bg-[#17112F] pb-16 pt-2 relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* The 5 Feature Cards matching Screen 1 in the Reference Board */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {topFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-[#211747]/80 hover:bg-[#2A1F56] border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer shadow-soft"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-3 group-hover:scale-110 group-hover:text-[#F58220] transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  {feat.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
