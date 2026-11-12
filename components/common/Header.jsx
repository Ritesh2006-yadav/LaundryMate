"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  ArrowLeft,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Wallet,
  Building,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

export default function Header({
  title,
  subtitle,
  backHref = null,
  role = "student",
  onMobileMenuToggle,
  isMobileMenuOpen,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowProfileDropdown(false);
    await logout();
    router.push(`/${role}/login`);
  };

  const STUDENT_PAGE_TITLES = {
    "/student/dashboard": {
      title: "Student Dashboard",
      subtitle: `Welcome back, ${user?.name?.split(" ")[0] || "Student"}! 👋`,
      backHref: null,
    },
    "/student/new-request": {
      title: "New Laundry Request",
      subtitle: "Complete the 4-step wizard to book hostel doorstep laundry collection",
      backHref: "/student/dashboard",
    },
    "/student/my-orders": {
      title: "My Laundry Orders",
      subtitle: "View and track all your past and active hostel laundry requests",
      backHref: "/student/dashboard",
    },
    "/student/track-order": {
      title: "Track Laundry Order",
      subtitle: "Live status, active timeline, and delivery estimates",
      backHref: "/student/dashboard",
    },
    "/student/complaints": {
      title: "Complaints & Support",
      subtitle: "Track unresolved issues or raise a new complaint with hostel admin",
      backHref: "/student/dashboard",
    },
    "/student/raise-complaint": {
      title: "Raise a Complaint",
      subtitle: "Report missing items, cloth damage, or delayed delivery",
      backHref: "/student/complaints",
    },
    "/student/notifications": {
      title: "Notifications",
      subtitle: "Recent activity, pickup reminders, and order status alerts",
      backHref: "/student/dashboard",
    },
    "/student/profile": {
      title: "Profile & Settings",
      subtitle: "Manage your hostel room details, contact info, and preferences",
      backHref: "/student/dashboard",
    },
  };

  const STAFF_PAGE_TITLES = {
    "/staff/dashboard": {
      title: "Staff Dashboard",
      subtitle: `Welcome back, ${(user?.role === "staff" ? user?.name?.split(" ")[0] : "Rohit")}! Manage operations, pickups, and processing.`,
      backHref: null,
    },
    "/staff/assigned": {
      title: "Assigned Orders",
      subtitle: "Review and manage all laundry requests assigned to you",
      backHref: "/staff/dashboard",
    },
    "/staff/pickups": {
      title: "Pickup Management",
      subtitle: "Scheduled and upcoming student laundry pickups across hostel blocks",
      backHref: "/staff/dashboard",
    },
    "/staff/requests": {
      title: "Pickup Management",
      subtitle: "Scheduled and upcoming student laundry pickups across hostel blocks",
      backHref: "/staff/dashboard",
    },
    "/staff/process": {
      title: "Laundry Processing",
      subtitle: "Washing, drying, ironing, and quality control workflow",
      backHref: "/staff/dashboard",
    },
    "/staff/delivery": {
      title: "Delivery Management",
      subtitle: "Orders ready for dispatch and student hostel room handovers",
      backHref: "/staff/dashboard",
    },
    "/staff/ready": {
      title: "Delivery Management",
      subtitle: "Orders ready for dispatch and student hostel room handovers",
      backHref: "/staff/dashboard",
    },
    "/staff/delivered": {
      title: "Delivered Orders",
      subtitle: "Archive of fulfilled orders and student delivery receipts",
      backHref: "/staff/delivery",
    },
    "/staff/complaints": {
      title: "Staff Complaints Desk",
      subtitle: "Investigate, resolve or escalate student laundry disputes",
      backHref: "/staff/dashboard",
    },
    "/staff/notifications": {
      title: "Staff Notifications",
      subtitle: "Real-time alerts for new assignments, pickups, and escalations",
      backHref: "/staff/dashboard",
    },
    "/staff/inventory": {
      title: "Inventory Management",
      subtitle: "Monitor consumables, usage logs, low stock alerts, and replenishments",
      backHref: "/staff/dashboard",
    },
    "/staff/reports": {
      title: "Daily Plant Shift Reports",
      subtitle: "Operational daily logs, staff duty summaries, and machine cycles",
      backHref: "/staff/dashboard",
    },
    "/staff/profile": {
      title: "Staff Profile & Settings",
      subtitle: "Manage your hub assignment, contact information, and shift details",
      backHref: "/staff/dashboard",
    },
  };

  const ADMIN_PAGE_TITLES = {
    "/admin/dashboard": {
      title: "Admin Dashboard",
      subtitle: "Executive overview of university laundry operations, metrics, and facility load",
      backHref: null,
    },
    "/admin/students": {
      title: "Student Management",
      subtitle: "Manage student registrations, hostel allocations, quotas, and account status",
      backHref: "/admin/dashboard",
    },
    "/admin/staff": {
      title: "Staff Management",
      subtitle: "Operations personnel, hostel hub assignments, shift schedules, and efficiency",
      backHref: "/admin/dashboard",
    },
    "/admin/orders": {
      title: "All Laundry Orders",
      subtitle: "Master registry of student orders, status updates, staff assignments, and audit trail",
      backHref: "/admin/dashboard",
    },
    "/admin/complaints": {
      title: "Complaints & Grievances Desk",
      subtitle: "Investigate student service issues, assign personnel, and track resolution SLA",
      backHref: "/admin/dashboard",
    },
    "/admin/inquiries": {
      title: "Contact & Helpdesk Inquiries",
      subtitle: "Review, investigate and resolve incoming student, visitor and hostel inquiries",
      backHref: "/admin/dashboard",
    },
    "/admin/services": {
      title: "Services & Pricing Management",
      subtitle: "Configure university laundry packages, tariffs, turnaround times, and limits",
      backHref: "/admin/dashboard",
    },
    "/admin/inventory": {
      title: "Inventory & Supplies Management",
      subtitle: "Stock tracking, consumption forecasts, thresholds, and replenishment orders",
      backHref: "/admin/dashboard",
    },
    "/admin/hostels": {
      title: "Hostel Management",
      subtitle: "Oversee residential buildings, warden allocations, room capacities, and hub routing",
      backHref: "/admin/dashboard",
    },
    "/admin/reports": {
      title: "Reports & Analytics",
      subtitle: "Operational metrics, revenue analytics, staff audits, and exportable reports",
      backHref: "/admin/dashboard",
    },
    "/admin/settings": {
      title: "System Settings",
      subtitle: "Operating hours, pickup rules, weight quotas, notifications, and university parameters",
      backHref: "/admin/dashboard",
    },
    "/admin/notifications": {
      title: "Notifications & System Alerts",
      subtitle: "Operational alerts, inventory warnings, urgent complaints, and system dispatches",
      backHref: "/admin/dashboard",
    },
  };

  let displayTitle = title;
  let displaySubtitle = subtitle;
  let resolvedBackHref = backHref;

  if (!displayTitle) {
    if (role === "student") {
      const meta = STUDENT_PAGE_TITLES[pathname];
      if (meta) {
        displayTitle = meta.title;
        displaySubtitle = meta.subtitle;
        if (!resolvedBackHref) resolvedBackHref = meta.backHref;
      } else if (pathname?.startsWith("/student/track-order/")) {
        const orderId = pathname.split("/").filter(Boolean).pop();
        displayTitle = orderId ? `Track Order #${orderId}` : "Track Laundry Order";
        displaySubtitle = "Real-time timeline and status updates for your clothes";
        if (!resolvedBackHref) resolvedBackHref = "/student/my-orders";
      }
    } else if (role === "staff") {
      const meta = STAFF_PAGE_TITLES[pathname];
      if (meta) {
        displayTitle = meta.title;
        displaySubtitle = meta.subtitle;
        if (!resolvedBackHref) resolvedBackHref = meta.backHref;
      } else {
        displayTitle = "Staff Portal";
        displaySubtitle = "Manage laundry operations and requests";
      }
    } else if (role === "admin") {
      const meta = ADMIN_PAGE_TITLES[pathname];
      if (meta) {
        displayTitle = meta.title;
        displaySubtitle = meta.subtitle;
        if (!resolvedBackHref) resolvedBackHref = meta.backHref;
      } else {
        displayTitle = "Admin Portal";
        displaySubtitle = "Hostel laundry management and operations oversight";
      }
    }
  }

  return (
    <header className="h-16 flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-[#E5E3F0] px-4 sm:px-6 flex items-center justify-between z-20">
      {/* Left side: Mobile Menu Button & Back Button or Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-[#211747] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer flex-shrink-0"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        )}

        {resolvedBackHref && (
          <Link
            href={resolvedBackHref}
            className="p-2 -ml-2 text-[#6B6780] hover:text-[#211747] hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}

        <div className="min-w-0">
          {displayTitle && (
            <h1 className="text-base sm:text-xl font-bold text-[#211747] tracking-tight leading-tight truncate">
              {displayTitle}
            </h1>
          )}
          {displaySubtitle && (
            <p className="text-xs text-[#6B6780] hidden sm:block truncate leading-tight mt-0.5">
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Notifications & Profile Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Role Switcher completely removed across all portals as per instructions */}

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowProfileDropdown(false);
            }}
            className="relative p-2.5 rounded-xl border border-[#E5E3F0] text-[#4A4560] hover:text-[#6633CC] hover:bg-[#F5F4FA] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl border border-[#E5E3F0] shadow-card p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-bold text-sm text-[#211747]">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAsRead()}
                    className="text-[11px] text-[#6633CC] font-semibold hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all as read</span>
                  </button>
                )}
              </div>

              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#8F8A9E]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <Link
                      key={n.id}
                      href={n.link || `/${role}/notifications`}
                      onClick={() => {
                        markAsRead(n.id);
                        setShowNotifications(false);
                      }}
                      className="block p-2.5 rounded-xl bg-[#FAF9FD] hover:bg-purple-50/50 border border-transparent hover:border-[#6633CC]/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#211747]">
                          {n.title}
                        </p>
                        {n.unread && (
                          <span className="w-2 h-2 rounded-full bg-[#6633CC]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B6780] mt-0.5 line-clamp-2">
                        {n.desc}
                      </p>
                      <span className="text-[10px] text-[#8F8A9E] mt-1 block">
                        {n.time}
                      </span>
                    </Link>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 text-center">
                <Link
                  href={`/${role}/notifications`}
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-[#6633CC] hover:underline"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Pill with Interactive Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfileDropdown((prev) => !prev);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 pr-2.5 sm:pr-3 rounded-full border border-[#E5E3F0] hover:border-[#6633CC]/40 hover:bg-[#F5F4FA] transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6633CC] to-[#8C52FF] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {(user?.role === role ? user?.avatar : null) || (role === "admin" ? "AD" : role === "staff" ? "RK" : "AG")}
            </div>
            <span className="text-xs font-semibold text-[#211747] hidden sm:inline-block">
              {((user?.role === role ? user?.name : null) || (role === "staff" ? "Rohit" : role === "admin" ? "Baldev" : "Akshay")).split(" ")[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8F8A9E]" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E5E3F0] shadow-card p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
              {/* Profile Card Header */}
              <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#E5E3F0]/60 space-y-1">
                <p className="text-sm font-bold text-[#211747] truncate">
                  {(user?.role === role ? user?.name : null) || (role === "staff" ? "Rohit Kumar" : role === "admin" ? "Dr. Baldev Singh" : "Akshay Gupta")}
                </p>
                <p className="text-xs font-medium text-[#6633CC]">
                  {(user?.role === role ? (user?.regNo || user?.staffId) : null) || (role === "staff" ? "STF-8821 • Hub Specialist" : role === "admin" ? "ADM-LPU-01" : "LPU12345678")}
                </p>
                {user?.hostel && (
                  <p className="text-[11px] text-[#6B6780] flex items-center gap-1 pt-0.5 truncate">
                    <Building className="w-3 h-3 text-[#8F8A9E]" />
                    <span>{user.hostel} • {user.blockRoom || "Hostel Room"}</span>
                  </p>
                )}
                {role === "student" && (
                  <p className="text-[11px] text-[#057A55] font-semibold flex items-center gap-1 pt-1 border-t border-[#E5E3F0] mt-1.5">
                    <Wallet className="w-3 h-3 text-[#057A55]" />
                    <span>Laundry Balance: ₹{user?.walletBalance ?? 1000}</span>
                  </p>
                )}
              </div>

              {/* Menu Links */}
              <div className="space-y-0.5 text-xs font-medium text-[#4A4560]">
                {role !== "admin" && (
                  <Link
                    href={`/${role}/profile`}
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F5F4FA] hover:text-[#6633CC] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#8F8A9E]" />
                    <span>My Profile</span>
                  </Link>
                )}

                <Link
                  href={role === "admin" ? "/admin/settings" : `/${role}/profile`}
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F5F4FA] hover:text-[#6633CC] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#8F8A9E]" />
                  <span>{role === "admin" ? "System Settings" : "Settings"}</span>
                </Link>
              </div>

              {/* Logout Button */}
              <div className="pt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
