"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Check,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useNotifications } from "@/hooks/useNotifications";

export default function StudentNotificationsPage() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none pb-8">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#6B6780]">
            Stay updated with your wash cycle checkpoints, runner pickups and complaint resolutions
          </span>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllAsRead}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E3F0] text-[#6B6780] text-sm">
            You have no notifications at this time.
          </div>
        ) : (
          notifications.map((n) => {
            const isComplaint = n.type === "complaint";

            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                  n.unread
                    ? "bg-white border-[#6633CC]/20 shadow-soft ring-1 ring-[#6633CC]/10"
                    : "bg-[#FAF9FD] border-[#E5E3F0]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isComplaint
                      ? "bg-rose-50 text-rose-600"
                      : "bg-[#EBF5FF] text-[#2563EB]"
                  }`}
                >
                  {isComplaint ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-[#211747] truncate">
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-[#8F8A9E] flex-shrink-0">
                      {n.time}
                    </span>
                  </div>

                  <p className="text-xs text-[#4A4560] mt-1 leading-relaxed">
                    {n.desc}
                  </p>

                  {n.link && (
                    <div className="mt-2.5">
                      <Link
                        href={n.link}
                        className="text-xs font-bold text-[#6633CC] hover:underline inline-flex items-center gap-1"
                      >
                        <span>View details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {n.unread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6633CC] flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
