"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
  ...props
}) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }[padding] || "p-6";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-[#E5E3F0] shadow-soft transition-all duration-200",
        hover && "hover:shadow-card hover:border-[#D3CEE8]",
        paddingClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

