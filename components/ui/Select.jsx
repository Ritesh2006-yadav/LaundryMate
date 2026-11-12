"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function Select({
  label,
  options = [],
  placeholder = "Select an option",
  error,
  helperText,
  icon: Icon,
  className = "",
  containerClassName = "",
  id,
  required = false,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("w-full flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
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

        <select
          id={selectId}
          className={cn(
            "w-full appearance-none rounded-xl border bg-white py-2.5 text-sm text-[#1A162B] transition-all duration-200 outline-none cursor-pointer",
            "focus:border-[#6633CC] focus:ring-4 focus:ring-[#6633CC]/10",
            Icon ? "pl-10" : "pl-4",
            "pr-10",
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
              : "border-[#E5E3F0]",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const value = typeof opt === "string" ? opt : opt.value;
            const labelText = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {labelText}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3.5 pointer-events-none text-[#8F8A9E]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <span className="text-xs text-rose-600 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#8F8A9E]">{helperText}</span>
      ) : null}
    </div>
  );
}

