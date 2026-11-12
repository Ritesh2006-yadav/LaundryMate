"use client";

import React from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import LandingWorkflow from "@/components/landing/LandingWorkflow";
import LandingWhyChoose from "@/components/landing/LandingWhyChoose";
import LandingServices from "@/components/landing/LandingServices";
import LandingFaq from "@/components/landing/LandingFaq";
import LandingContact from "@/components/landing/LandingContact";
import LandingFooter from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4FA] selection:bg-[#F58220] selection:text-white">
      {/* 1. Navbar */}
      <LandingNavbar />

      {/* 2. Hero Section with Feature Strip & Original LPU Campus Image */}
      <LandingHero />

      {/* 3. Numbered Laundry Workflow */}
      <LandingWorkflow />

      {/* 4. Why Choose LMS */}
      <LandingWhyChoose />

      {/* 5. Subsidized Services & Tariff */}
      <LandingServices />

      {/* 6. Frequently Asked Questions */}
      <LandingFaq />

      {/* 7. Campus Helpdesk & Contact */}
      <LandingContact />

      {/* 8. University Footer */}
      <LandingFooter />
    </div>
  );
}
