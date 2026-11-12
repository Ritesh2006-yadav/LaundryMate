"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How do I sign in to the LPU Hostel Laundry System?",
      a: "Residents can log in using their 8-digit LPU Registration Number and account password. If you haven't created an account yet, click 'Register' in the Student Portal, fill in your hostel and room details, and start booking immediately.",
    },
    {
      q: "How are the weight and pricing calculated?",
      a: "Our collection staff carries university-calibrated digital hanging scales. When your laundry bag is collected from your room door, it is weighed in front of you. The weight in kg is entered into the system, and your total bill is computed transparently at official university rates (e.g. ₹40/kg for Wash & Fold).",
    },
    {
      q: "What is the expected turnaround time for deliveries?",
      a: "Standard Wash & Fold is delivered back within 24 to 48 hours. Express Iron Only orders are returned within 24 hours. You can follow live updates at every stage through your dashboard tracker.",
    },
    {
      q: "What payment methods are accepted?",
      a: "Students can pay via their prepaid Hostel Laundry Wallet balance, instant UPI, Net Banking, or cash on collection directly to the hostel runner.",
    },
    {
      q: "What should I do if an item is missing or damaged?",
      a: "Navigate to the 'Complaints' tab in your student portal, select the order ID, provide a short description, and attach an optional photo. A ticket is immediately dispatched to the Central Plant Supervisor for prompt resolution.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-white border-y border-[#E5E3F0] select-none">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6633CC] bg-[#6633CC]/10 border border-[#6633CC]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#211747] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[#6B6780] text-sm sm:text-base mt-2.5">
            Everything you need to know about LPU hostel laundry management.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#6633CC] bg-[#FAF9FD] shadow-soft"
                    : "border-[#E5E3F0] bg-white hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#211747] cursor-pointer"
                >
                  <span className="flex items-center gap-3.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                        isOpen
                          ? "bg-[#6633CC] text-white"
                          : "bg-gray-100 text-[#6B6780]"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>

                  <ChevronDown
                    className={`w-5 h-5 text-[#8F8A9E] transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-[#6633CC]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#6B6780] leading-relaxed pl-15 sm:pl-16">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
