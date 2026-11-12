"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function Input({
  label,
  type = "text",
  error,
  helperText,
  icon: Icon,
  className = "",
  containerClassName = "",
  id,
  required = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("w-full flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[#8F8A9E] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={inputType}
          className={cn(
            "w-full rounded-xl border bg-white py-2.5 text-sm text-[#1A162B] placeholder-[#9E9AA8] transition-all duration-200 outline-none",
            "focus:border-[#6633CC] focus:ring-4 focus:ring-[#6633CC]/10",
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
              : "border-[#E5E0F2]",
            className,
            Icon ? "!pl-10" : "pl-4",
            isPassword ? "!pr-11" : "pr-4"
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 p-1 text-[#8F8A9E] hover:text-[#211747] transition-colors focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <span className="text-xs text-rose-600 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#8F8A9E]">{helperText}</span>
      ) : null}
    </div>
  );
}

