"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  Boxes,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  CheckCheck,
  Trash2,
  Filter,
  ShieldAlert,
  Sparkles,
  Info,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const INITIAL_ADMIN_NOTIFICATIONS = [
  {
    id: "notif-adm-1",
    type: "inventory",
    title: "Low Inventory Alert: Premium Detergent",
    message: "Stock level dropped to 8 kg (minimum threshold is 15 kg). Please place a supplier purchase order.",
    time: "15 minutes ago",
    date: "Today, 10:45 AM",
    severity: "danger",
    unread: true,
    actionLink: "/admin/inventory",
    actionLabel: "View Inventory",
  },
  {
    id: "notif-adm-2",
    type: "complaint",
    title: "Urgent Complaint Escalation: CMP-2026-004",
    message: "Student Rahul Sharma (BH-3, Room 210) reported a missing blazer in order #ORD-2026-904. Investigation unresolved > 24 hours.",
    time: "1 hour ago",
    date: "Today, 09:30 AM",
    severity: "warning",
    unread: true,
    actionLink: "/admin/complaints",
    actionLabel: "Review Complaint",
  },
  {
    id: "notif-adm-3",
    type: "order",
    title: "Daily Capacity Reached in Hub BH-2",
    message: "BH-2 hub processed 120 laundry orders today, reaching 95% of scheduled machine capacity.",
    time: "3 hours ago",
    date: "Today, 07:15 AM",
    severity: "info",
    unread: true,
    actionLink: "/admin/orders",
    actionLabel: "View Orders",
  },
  {
    id: "notif-adm-4",
    type: "staff",
    title: "Staff Shift Completed: Rohit Kumar",
    message: "Morning pickup shift logged 42 student collections completed across BH-3 with 100% on-time record.",
    time: "Yesterday",
    date: "09 Nov 2026, 06:00 PM",
    severity: "success",
    unread: false,
    actionLink: "/admin/staff",
    actionLabel: "Staff Audit",
  },
  {
    id: "notif-adm-5",
    type: "system",
    title: "Automatic System Backup Completed",
    message: "PostgreSQL master database and transaction ledgers were backed up to AWS S3 glacier vault successfully.",
    time: "Yesterday",
    date: "09 Nov 2026, 02:00 AM",
    severity: "info",
    unread: false,
    actionLink: "/admin/settings",
    actionLabel: "System Settings",
  },
  {
    id: "notif-adm-6",
    type: "inventory",
    title: "Packaging Poly Bags Reorder Recommended",
    message: "Poly Bags roll inventory is at 35 bags. Reorder threshold is 50 bags.",
    time: "2 days ago",
    date: "08 Nov 2026, 04:30 PM",
    severity: "warning",
    unread: false,
    actionLink: "/admin/inventory",
    actionLabel: "Restock Now",
  },
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_ADMIN_NOTIFICATIONS);
  const [filterType, setFilterType] = useState("all");

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (filterType === "unread") return n.unread;
    if (filterType === "inventory") return n.type === "inventory";
    if (filterType === "complaint") return n.type === "complaint";
    if (filterType === "system") return n.type === "system" || n.type === "staff";
    return true;
  });
  const filteredNotifications = filtered;

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "danger":
        return <Badge variant="danger" size="sm">Critical Alert</Badge>;
      case "warning":
        return <Badge variant="warning" size="sm">Attention</Badge>;
      case "success":
        return <Badge variant="success" size="sm">Completed</Badge>;
      default:
        return <Badge variant="info" size="sm">Information</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "inventory":
        return <Boxes className="w-5 h-5 text-rose-600" />;
      case "complaint":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "staff":
        return <Clock className="w-5 h-5 text-emerald-600" />;
      default:
        return <Info className="w-5 h-5 text-[#6633CC]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
            Operational & Incident Feed
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
            {filtered.length} {filtered.length === 1 ? "Alert" : "Alerts"}
          </span>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {unreadCount} Unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="secondary"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4 text-[#6633CC]" />}
            >
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: `All Alerts (${notifications.length})` },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "inventory", label: "Inventory Stock" },
          { id: "complaint", label: "Complaints & SLA" },
          { id: "system", label: "System & Staff" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === tab.id
                ? "bg-[#6633CC] text-white shadow-sm"
                : "bg-white text-[#4A4560] border border-[#E5E3F0] hover:bg-[#F5F4FA]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E3F0] space-y-2">
            <Bell className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-[#211747]">No notifications in this filter</p>
            <p className="text-xs text-[#8F8A9E]">All operational systems and hubs are running smoothly.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.unread
                  ? "bg-white border-[#6633CC]/30 shadow-card"
                  : "bg-white/80 border-[#E5E3F0] hover:bg-white"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    item.severity === "danger"
                      ? "bg-rose-50"
                      : item.severity === "warning"
                      ? "bg-amber-50"
                      : item.severity === "success"
                      ? "bg-emerald-50"
                      : "bg-purple-50"
                  }`}
                >
                  {getTypeIcon(item.type)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-[#211747] leading-snug">
                      {item.title}
                    </h4>
                    {getSeverityBadge(item.severity)}
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-[#6633CC]" />
                    )}
                  </div>
                  <p className="text-xs text-[#4A4560] leading-relaxed">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-[#8F8A9E] pt-1">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                {item.actionLink && (
                  <Link
                    href={item.actionLink}
                    onClick={() => handleMarkAsRead(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F4FA] hover:bg-purple-50 hover:text-[#6633CC] text-xs font-semibold text-[#211747] transition-colors border border-[#E5E3F0]"
                  >
                    <span>{item.actionLabel || "View"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {item.unread && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="p-1.5 text-[#8F8A9E] hover:text-[#6633CC] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(item.id)}
                  className="p-1.5 text-[#8F8A9E] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

