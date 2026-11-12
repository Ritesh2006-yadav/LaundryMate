"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  type = "button",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  }[size] || "px-5 py-2.5 text-sm gap-2";

  const variantClasses = {
    primary:
      "bg-[#6633CC] text-white hover:bg-[#5528B8] shadow-sm hover:shadow-purple",
    orange:
      "bg-[#F58220] text-white hover:bg-[#E07214] shadow-sm hover:shadow-orange",
    secondary:
      "bg-white text-[#211747] border border-[#E5E3F0] hover:bg-[#F5F4FA] hover:border-[#D3CEE8]",
    dark:
      "bg-[#211747] text-white hover:bg-[#2C1F5C] shadow-sm",
    "outline-white":
      "bg-transparent text-white border border-white/25 hover:bg-white/10",
    "outline-purple":
      "bg-transparent text-[#6633CC] border border-[#6633CC] hover:bg-[#6633CC]/10",
    ghost:
      "bg-transparent text-[#6B6780] hover:text-[#211747] hover:bg-black/5",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  }[variant] || "bg-[#6633CC] text-white hover:bg-[#5528B8]";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(baseClasses, sizeClasses, variantClasses, className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

