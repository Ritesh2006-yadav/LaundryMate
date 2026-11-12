"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import ClientPortal from "@/components/common/ClientPortal";

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
  showCloseButton = true,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        {/* Modal Card */}
        <div
          className={cn(
            "relative w-full bg-white rounded-2xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden transform transition-all animate-in zoom-in-95",
            maxWidth
          )}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between p-6 pb-4 border-b border-[#F0EDF8]">
              <div>
                {title && (
                  <h3 className="text-lg font-bold text-[#211747]">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-xs text-[#6B6780] mt-0.5">{subtitle}</p>
                )}
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-[#8F8A9E] hover:text-[#211747] hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          <div className="p-6">{children}</div>
        </div>
      </div>
    </ClientPortal>
  );
}

