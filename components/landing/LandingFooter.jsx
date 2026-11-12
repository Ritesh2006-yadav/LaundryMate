"use client";

import React from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function LandingFooter() {
  return (
    <footer className="bg-[#17112F] text-white pt-16 pb-12 border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1 & 2: Brand & Project Description */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="md" subtitle="Hostel Operations" href="/" />

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
              LPU | LMS – Digital laundry management platform of Lovely Professional University. Streamlining laundry requests, doorstep collections, transparent per-kg billing, and grievance resolution for hostel residents.
            </p>

            <div className="text-xs text-white/50 pt-1 font-medium">
              Central Campus Laundry Plant • Phagwara, Punjab
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F58220]">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  System Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Services & Pricing
                </a>
              </li>
              <li>
                <a href="#why-choose" className="hover:text-white transition-colors">
                  Why Choose LMS
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact Helpdesk
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Portals */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F58220]">
              Access Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link
                  href="/portal"
                  className="hover:text-white transition-colors font-bold text-[#F58220]"
                >
                  Choose Your Portal →
                </Link>
              </li>
              <li>
                <Link
                  href="/student/login"
                  className="hover:text-white transition-colors"
                >
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link
                  href="/student/register"
                  className="hover:text-white transition-colors"
                >
                  Student Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/staff/login"
                  className="hover:text-white transition-colors"
                >
                  Laundry Staff Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="hover:text-white transition-colors"
                >
                  Admin & Warden Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: University Campus */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F58220]">
              Campus
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Lovely Professional University <br />
              Jalandhar - Delhi G.T. Road, <br />
              Phagwara, Punjab (India) - 144411
            </p>
            <p className="text-[11px] text-white/50 pt-2 font-medium">
              Hostel Complex Doorstep Coverage (BH-1 to BH-8, GH-1 to GH-6)
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Lovely Professional University LMS. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/portal" className="hover:text-white transition-colors">
              Portals
            </Link>
            <a href="#services" className="hover:text-white transition-colors">
              Tariffs
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Helpdesk
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
