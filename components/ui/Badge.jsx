"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { STATUS_CONFIG, COMPLAINT_STATUS_CONFIG } from "@/lib/constants";

export default function Badge({
  children,
  status = null,
  variant = "default",
  showDot = false,
  size = "md",
  className = "",
}) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }[size] || "px-2.5 py-1 text-xs";

  let colorClasses = "bg-gray-100 text-gray-700 border-gray-200";
  let dotColor = "bg-gray-400";

  if (status && (STATUS_CONFIG[status] || COMPLAINT_STATUS_CONFIG[status])) {
    const config = STATUS_CONFIG[status] || COMPLAINT_STATUS_CONFIG[status];
    colorClasses = config.bg;
    dotColor = config.dot;
  } else {
    const variants = {
      default: "bg-gray-100 text-gray-700 border-gray-200",
      primary: "bg-[#6633CC]/10 text-[#6633CC] border-[#6633CC]/20",
      orange: "bg-[#F58220]/15 text-[#D46B0E] border-[#F58220]/30",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-rose-50 text-rose-700 border-rose-200",
      info: "bg-blue-50 text-blue-700 border-blue-200",
    };
    colorClasses = variants[variant] || variants.default;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        sizeClasses,
        colorClasses,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColor)}
        />
      )}
      {children || status}
    </span>
  );
}

