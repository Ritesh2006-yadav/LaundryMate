"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PackagePlus,
  ClipboardList,
  SearchCheck,
  AlertCircle,
  Bell,
  Settings,
  Users,
  UserCheck,
  Building2,
  Boxes,
  Tag,
  BarChart3,
  Clock,
  Sparkles,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Truck,
  User,
  HelpCircle,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils/cn";

export default function Sidebar({ role = "student", onNavigate }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [pendingHref, setPendingHref] = React.useState(null);

  React.useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleLogout = async () => {
    if (onNavigate) onNavigate();
    await logout();
    router.push(`/${role}/login`);
  };

  const studentNav = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "New Request", href: "/student/new-request", icon: PackagePlus },
    { label: "My Orders", href: "/student/my-orders", icon: ClipboardList },
    { label: "Track Order", href: "/student/track-order", icon: SearchCheck },
    { label: "Complaints", href: "/student/complaints", icon: AlertCircle },
    {
      label: "Notifications",
      href: "/student/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? String(unreadCount) : null,
      badgeColor: "bg-rose-500",
    },
    { label: "Profile & Settings", href: "/student/profile", icon: Settings },
  ];

  const staffNav = [
    { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { label: "Assigned Orders", href: "/staff/assigned", icon: UserCheck },
    {
      label: "Pickup Management",
      href: "/staff/pickups",
      icon: ClipboardList,
      badge: "4",
      badgeColor: "bg-amber-500",
    },
    { label: "Laundry Processing", href: "/staff/process", icon: Sparkles },
    { label: "Delivery Management", href: "/staff/delivery", icon: Clock },
    {
      label: "Complaints",
      href: "/staff/complaints",
      icon: AlertCircle,
      badge: "3",
      badgeColor: "bg-rose-500",
    },
    { label: "Notifications", href: "/staff/notifications", icon: Bell },
    { label: "My Profile", href: "/staff/profile", icon: User },
  ];

  const adminNav = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Staff", href: "/admin/staff", icon: UserCheck },
    { label: "All Orders", href: "/admin/orders", icon: ClipboardList },
    { label: "Complaints", href: "/admin/complaints", icon: AlertCircle, badge: "2", badgeColor: "bg-amber-500" },
    { label: "Contact Inquiries", href: "/admin/inquiries", icon: HelpCircle, badge: "New", badgeColor: "bg-[#F58220]" },
    { label: "Services & Pricing", href: "/admin/services", icon: Tag },
    { label: "Inventory", href: "/admin/inventory", icon: Boxes, badge: "Low", badgeColor: "bg-rose-500" },
    { label: "Hostels", href: "/admin/hostels", icon: Building2 },
    { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
  ];

  const roleConfig = {
    student: {
      title: "Student Portal",
      nav: studentNav,
      defaultAvatar: "ST",
      defaultName: "University Student",
      defaultSub: "LMS Portal",
    },
    staff: {
      title: "Staff Portal",
      nav: staffNav,
      defaultAvatar: "ST",
      defaultName: "Laundry Staff",
      defaultSub: "Central Hub",
    },
    admin: {
      title: "Admin Portal",
      nav: adminNav,
      defaultAvatar: "AD",
      defaultName: "System Administrator",
      defaultSub: "Operations Division",
    },
  }[role] || {
    title: "Student Portal",
    nav: studentNav,
    defaultAvatar: "ST",
    defaultName: "University Student",
    defaultSub: "LMS Portal",
  };

  const navItems = roleConfig.nav;

  return (
    <aside className="w-64 bg-[#211747] text-white flex flex-col h-full border-r border-[#17112F]/40 select-none flex-shrink-0">
      {/* Top Brand Logo */}
      <div className="p-6 pb-5 border-b border-white/10 flex-shrink-0">
        <Logo
          variant="light"
          subtitle={roleConfig.title}
          href={`/${role}/dashboard`}
          size="md"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto dark-sidebar min-h-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}/dashboard` && pathname?.startsWith(item.href));
          const isPending = pendingHref === item.href;
          const isSelected = isPending || isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => {
                if (item.href !== pathname) setPendingHref(item.href);
                if (onNavigate) onNavigate();
              }}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isSelected
                  ? "bg-[#F58220] text-white shadow-orange font-semibold"
                  : "text-white/70 hover:bg-[#2C1F5C] hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isSelected ? "text-white" : "text-white/60 group-hover:text-white"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {isPending ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              ) : item.badge ? (
                <span
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-bold rounded-full text-white",
                    item.badgeColor || "bg-rose-500"
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        {/* Logout Item */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-rose-900/40 hover:text-rose-200 transition-all text-left mt-2 group cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-white/60 group-hover:text-rose-200 group-hover:-translate-x-0.5 transition-transform" />
          <span>Logout</span>
        </button>
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-white/10 bg-[#1A1138] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6633CC] text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white/10 flex-shrink-0">
            {(user?.role === role ? user?.avatar : null) || roleConfig.defaultAvatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {(user?.role === role ? user?.name : null) || roleConfig.defaultName}
            </p>
            <p className="text-xs text-white/60 truncate">
              {(user?.role === role ? (user?.regNo || user?.staffId) : null) || roleConfig.defaultSub}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
