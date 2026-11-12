"use client";

import React from "react";
import Link from "next/link";
import { LAUNDRY_SERVICES } from "@/lib/constants";
import { Check, Shirt, Layers, ShieldCheck, Flame, Sparkles } from "lucide-react";

export default function LandingServices() {
  const getIcon = (iconName) => {
    switch (iconName) {
      case "Shirt":
        return <Shirt className="w-5 h-5" />;
      case "Layers":
        return <Layers className="w-5 h-5" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5" />;
      case "Flame":
        return <Flame className="w-5 h-5" />;
      default:
        return <Shirt className="w-5 h-5" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-[#F5F4FA] select-none">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F58220] bg-[#F58220]/10 border border-[#F58220]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Subsidized Campus Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#211747] tracking-tight">
            Transparent Services & Pricing
          </h2>
          <p className="text-[#6B6780] text-sm sm:text-base mt-2.5 leading-relaxed">
            Approved per-kilogram laundry rates for all Lovely Professional University hostel residents.
          </p>
        </div>

        {/* 5 Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
          {LAUNDRY_SERVICES.map((srv) => {
            const isPopular = srv.popular;
            return (
              <div
                key={srv.id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between group relative ${
                  isPopular
                    ? "border-[#6633CC] ring-2 ring-[#6633CC]/25 shadow-purple lg:-translate-y-2"
                    : "border-[#E5E3F0] shadow-soft hover:shadow-card hover:-translate-y-1"
                }`}
              >
                {/* Popular Ribbon */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6633CC] to-[#8C52FF] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#F58220]" />
                    Hostel Favorite
                  </div>
                )}

                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
                      isPopular
                        ? "bg-[#6633CC] text-white shadow-purple"
                        : "bg-[#F5F4FA] text-[#6633CC] border border-[#E5E3F0]"
                    }`}
                  >
                    {getIcon(srv.icon)}
                  </div>

                  <h3 className="font-bold text-lg text-[#211747] mb-1">
                    {srv.name}
                  </h3>

                  <p className="text-xs text-[#6B6780] leading-relaxed mb-4 min-h-[36px]">
                    {srv.description}
                  </p>

                  <div className="flex items-baseline gap-1 py-3 border-y border-[#F0EDF8] my-3">
                    <span className="text-3xl font-black text-[#211747]">
                      ₹{srv.pricePerKg}
                    </span>
                    <span className="text-xs text-[#8F8A9E] font-semibold">
                      {srv.unit}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs text-[#6B6780]">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{srv.turnaround} Turnaround</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Doorstep Room Pickup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Online Weight Verification</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#F0EDF8]">
                  <Link href="/portal" className="w-full block">
                    <button
                      type="button"
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isPopular
                          ? "bg-[#F58220] hover:bg-[#E07214] text-white shadow-orange"
                          : "bg-[#F5F4FA] hover:bg-gray-100 text-[#211747] border border-[#E5E3F0]"
                      }`}
                    >
                      Book Service
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
