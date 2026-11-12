"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  Clock,
  Truck,
  AlertCircle,
  Sparkles,
  Calendar,
  Filter,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_STAFF_ALERTS = [
  {
    id: "stf-notif-1",
    title: "New Order Assignment: #LMS1055",
    desc: "Order assigned to your hub queue by operations dispatch. Student: Priya Sharma (BH-3, Room 210).",
    time: "15 mins ago",
    category: "assignment",
    unread: true,
    link: "/staff/assigned",
  },
  {
    id: "stf-notif-2",
    title: "Urgent Pickup Reminder: GH-2 Block A",
    desc: "Pickup window 09:00 - 11:00 AM ending in 30 minutes. 3 student bags awaiting collection.",
    time: "45 mins ago",
    category: "pickup",
    unread: true,
    link: "/staff/pickups",
  },
  {
    id: "stf-notif-3",
    title: "Wash Plant Batch Completed: Washer Unit 4",
    desc: "Cycle for 4 orders (including #LMS1054) completed. Ready for automated tumble drying.",
    time: "2 hours ago",
    category: "process",
    unread: true,
    link: "/staff/process",
  },
  {
    id: "stf-notif-4",
    title: "Delivery Dispatch Alert: 5 Orders Ready",
    desc: "Fresh steam pressed packages packaged on Hub Rack 2. Assigned runner delivery window 05:00 PM.",
    time: "3 hours ago",
    category: "delivery",
    unread: false,
    link: "/staff/delivery",
  },
  {
    id: "stf-notif-5",
    title: "Student Complaint Response Required: #CMP-901",
    desc: "Student uploaded laundry receipt photo regarding missing blue jersey. Investigation notes needed.",
    time: "Yesterday",
    category: "complaint",
    unread: false,
    link: "/staff/complaints",
  },
];

export default function StaffNotificationsPage() {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  // Combined notifications ensuring staff role alerts are present
  const [filterType, setFilterType] = useState("all");
  const [localAlerts, setLocalAlerts] = useState(DEFAULT_STAFF_ALERTS);

  const unreadCount = localAlerts.filter((a) => a.unread).length;

  const handleMarkOne = (id) => {
    setLocalAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unread: false } : a))
    );
    markAsRead(id);
  };

  const handleMarkAll = () => {
    setLocalAlerts((prev) => prev.map((a) => ({ ...a, unread: false })));
    markAllAsRead();
  };

  const filteredAlerts = useMemo(() => {
    if (filterType === "all") return localAlerts;
    if (filterType === "unread") return localAlerts.filter((a) => a.unread);
    return localAlerts.filter((a) => a.category === filterType);
  }, [localAlerts, filterType]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "assignment":
        return <ClipboardList className="w-5 h-5 text-[#6633CC]" />;
      case "pickup":
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case "process":
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      case "delivery":
        return <Truck className="w-5 h-5 text-cyan-600" />;
      case "complaint":
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-[#6633CC]" />;
    }
  };

  const getCategoryBg = (category) => {
    switch (category) {
      case "assignment":
        return "bg-purple-50";
      case "pickup":
        return "bg-amber-50";
      case "process":
        return "bg-blue-50";
      case "delivery":
        return "bg-cyan-50";
      case "complaint":
        return "bg-rose-50";
      default:
        return "bg-purple-50";
    }
  };

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6633CC] flex items-center justify-center font-bold shadow-xs">
            <Bell className="w-5 h-5 text-[#6633CC]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#211747]">
              Operations Dispatch Alerts
            </h3>
            <p className="text-xs text-[#6B6780]">
              You have {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAll}
            leftIcon={<CheckCheck className="w-4 h-4 text-[#6633CC]" />}
            className="text-xs font-bold"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Alerts" },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "assignment", label: "Assignments" },
          { id: "pickup", label: "Pickups" },
          { id: "process", label: "Processing" },
          { id: "delivery", label: "Deliveries" },
          { id: "complaint", label: "Complaints" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterType === tab.id
                ? "bg-[#6633CC] text-white shadow-purple"
                : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E3F0] shadow-soft">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#6633CC] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-[#211747]">All caught up!</p>
            <p className="text-xs text-[#8F8A9E] mt-1">No notifications found under this filter.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                alert.unread
                  ? "border-[#6633CC]/30 bg-purple-50/20 shadow-soft ring-1 ring-[#6633CC]/10"
                  : "border-[#E5E3F0] hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${getCategoryBg(
                      alert.category
                    )}`}
                  >
                    {getCategoryIcon(alert.category)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#211747]">
                        {alert.title}
                      </h4>
                      {alert.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#6633CC]" />
                      )}
                    </div>
                    <p className="text-xs text-[#6B6780] leading-relaxed">
                      {alert.desc}
                    </p>
                    <span className="text-[11px] font-medium text-[#8F8A9E] block pt-1">
                      {alert.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {alert.link && (
                    <Link href={alert.link}>
                      <button
                        type="button"
                        onClick={() => handleMarkOne(alert.id)}
                        className="p-2 text-[#6633CC] hover:bg-purple-50 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                        title="View Related Page"
                      >
                        <span className="hidden sm:inline">View</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </Link>
                  )}

                  {alert.unread && (
                    <button
                      type="button"
                      onClick={() => handleMarkOne(alert.id)}
                      className="p-2 text-[#6B6780] hover:text-[#211747] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

