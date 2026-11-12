"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Users, ShieldAlert, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils/cn";

export default function RoleSwitcher({ currentRole = "student" }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { switchDemoRole } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roles = [
    {
      id: "student",
      label: "Student",
      href: "/student/dashboard",
      icon: GraduationCap,
      color: "text-purple-600 bg-purple-50",
    },
    {
      id: "staff",
      label: "Laundry Staff",
      href: "/staff/dashboard",
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: "admin",
      label: "Admin",
      href: "/admin/dashboard",
      icon: ShieldAlert,
      color: "text-orange-600 bg-orange-50",
    },
  ];

  const current = roles.find((r) => r.id === currentRole) || roles[0];
  const CurrentIcon = current.icon;

  const handleSelectRole = (role) => {
    switchDemoRole(role.id);
    setOpen(false);
    router.push(role.href);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5E3F0] bg-white hover:bg-[#F5F4FA] transition-colors text-xs font-semibold text-[#211747]"
      >
        <span className={cn("p-1 rounded-lg", current.color)}>
          <CurrentIcon className="w-3.5 h-3.5" />
        </span>
        <span className="capitalize hidden md:inline">{current.label} View</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#8F8A9E]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-[#E5E3F0] shadow-card py-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8F8A9E]">
            Switch Active Role
          </div>
          {roles.map((r) => {
            const Icon = r.icon;
            const isCurrent = r.id === currentRole;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectRole(r)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors",
                  isCurrent
                    ? "bg-[#6633CC]/10 text-[#6633CC] font-semibold"
                    : "text-[#211747] hover:bg-gray-50"
                )}
              >
                <span className={cn("p-1 rounded-lg", r.color)}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span>{r.label}</span>
                {isCurrent && (
                  <span className="ml-auto text-[10px] bg-[#6633CC] text-white px-1.5 py-0.2 rounded-full">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

