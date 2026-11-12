"use client";

import React from "react";
import {
  Smartphone,
  Truck,
  Waves,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function LandingWorkflow() {
  const workflowSteps = [
    {
      step: "01",
      title: "Student Request",
      desc: "Select your preferred wash service, set estimated weight or garment counts, and specify your hostel room and collection window.",
      icon: Smartphone,
      checkpoint: "Submitted Online",
    },
    {
      step: "02",
      title: "Clothes Pickup",
      desc: "Assigned hostel collection staff picks up the laundry bag directly from your hostel room door and verifies weight.",
      icon: Truck,
      checkpoint: "Collected & Weighed",
    },
    {
      step: "03",
      title: "Washing & Care",
      desc: "Clothes are washed in sanitized high-capacity machines, tumble dried, and steam pressed according to selected service.",
      icon: Waves,
      checkpoint: "Washed & Finished",
    },
    {
      step: "04",
      title: "Clothes Delivered",
      desc: "Delivered back to your hostel room door with digital receipt and status update marked as delivered in your portal.",
      icon: CheckCircle,
      checkpoint: "Doorstep Delivery",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 bg-gradient-to-b from-[#211747] via-[#1B1238] to-[#17112F] text-white relative overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F58220] bg-[#F58220]/10 border border-[#F58220]/25 px-4 py-1.5 rounded-full inline-block mb-3">
            Laundry Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            How The Laundry Workflow Works
          </h2>
          <p className="text-white/70 text-sm sm:text-base mt-2.5 leading-relaxed">
            From the moment you book online to fresh, crisp clothes delivered back to your room in 4 straightforward steps.
          </p>
        </div>

        {/* 4-Step Numbered Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:-translate-y-1 group"
              >
                <div>
                  {/* Step Number & Checkpoint */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black font-mono text-[#F58220]">
                      {item.step}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                      {item.checkpoint}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-[#6633CC] text-white flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-[#F58220] transition-all shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-bold text-lg text-white mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Prompt */}
        <div className="mt-14 text-center">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#F58220] hover:text-[#FFA34D] transition-colors group cursor-pointer"
          >
            <span>Ready to place a request? Access Student Portal</span>
            <ArrowRight className="w-4 h-4 text-[#F58220] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
