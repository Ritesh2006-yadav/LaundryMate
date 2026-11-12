"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[#1A1235] border-b border-white/10 sticky top-0 z-50 select-none shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo with Official Circular Emblem */}
        <Logo variant="light" size="md" href="/" lmsColor="orange" />

        {/* Desktop Nav Links matching Original */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-white font-medium hover:text-[#F58220] transition-colors text-sm"
          >
            Home
          </Link>
          <a
            href="#features"
            className="text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            How It Works
          </a>
          <a
            href="#contact"
            className="text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            Contact
          </a>
        </nav>

        {/* Action Buttons matching Original */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/portal"
            prefetch={true}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all border border-white/15"
          >
            Login
          </Link>

          <Link href="/portal" prefetch={true}>
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-[#F58220] hover:bg-[#E07214] text-white font-bold text-sm shadow-orange transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2.5 rounded-xl hover:bg-white/10 cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#211747] border-b border-white/10 px-6 py-5 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1.5">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white font-medium py-2.5 px-3 rounded-lg hover:bg-white/5"
            >
              Home
            </Link>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/80 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/80 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5"
            >
              How It Works
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/80 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5"
            >
              Contact
            </a>
          </nav>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#F58220] hover:bg-[#E07214] text-white font-bold text-sm shadow-orange"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
