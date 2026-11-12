"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Logo({
  variant = "light", // 'light' (on dark background) or 'dark' (on light background)
  subtitle = null,
  href = "/",
  size = "md", // 'sm', 'md', 'lg'
  lmsColor = null, // 'orange', or null (defaults to variant text color)
}) {
  const isLight = variant === "light";

  const sizeClasses = {
    sm: { img: "w-7 h-7", text: "text-lg" },
    md: { img: "w-9 h-9", text: "text-xl" },
    lg: { img: "w-11 h-11", text: "text-2xl" },
  }[size] || { img: "w-9 h-9", text: "text-xl" };

  const content = (
    <div className="flex items-center gap-3 select-none">
      {/* Official LPU Circular Logo */}
      <div
        className={`${sizeClasses.img} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ${
          isLight ? "ring-white/20 bg-white" : "ring-[#211747]/10 bg-white"
        }`}
      >
        <img
          src="/lpu-logo.png"
          alt="LPU Logo"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${sizeClasses.text} ${
              isLight ? "text-white" : "text-[#211747]"
            }`}
          >
            LPU
          </span>
          <span className="text-[#F58220] font-black">|</span>
          <span
            className={`font-black tracking-tight ${sizeClasses.text} ${
              lmsColor === "orange"
                ? "text-[#F58220]"
                : isLight
                ? "text-white"
                : "text-[#211747]"
            }`}
          >
            LMS
          </span>
        </div>

        {subtitle && (
          <span
            className={`text-[11px] font-medium tracking-wide mt-0.5 ${
              isLight ? "text-white/60" : "text-[#6B6780]"
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
