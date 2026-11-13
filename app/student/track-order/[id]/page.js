"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  Sparkles,
  Phone,
  UserCheck,
  Building2,
  Calendar,
  Printer,
  AlertCircle,
  FileText,
  PackageCheck,
  ChevronDown,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import WashingMachineIllustration from "@/components/student/WashingMachineIllustration";

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id || "";
  const { getOrderById } = useLaundryOrders();

  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  // Retrieve matching order strictly by ID
  const activeOrder = rawId ? getOrderById(rawId) : null;

  if (!activeOrder) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-3xl p-8 border border-[#E5E3F0] shadow-card">
        <div className="w-16 h-16 rounded-full bg-purple-50 text-[#6633CC] flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#211747]">Order Not Found</h3>
        <p className="text-xs text-[#6B6780] mt-1 mb-6">
          Could not locate any active laundry order with ID #{rawId}.
        </p>
        <Link href="/student/my-orders">
          <Button variant="primary">View All My Orders</Button>
        </Link>
      </div>
    );
  }

  // 8 Tracking stages in exact sequence requested
  const STAGES_SEQUENCE = [
    "Request Placed",
    "Request Accepted",
    "Clothes Picked Up",
    "In Washing",
    "In Drying",
    "Ironing",
    "Ready for Delivery",
    "Delivered",
  ];

  // Map timeline items to ensure all 8 stages are represented
  const fullTimeline = STAGES_SEQUENCE.map((stageName) => {
    const existing = activeOrder.timeline?.find(
      (t) =>
        t.status.toLowerCase() === stageName.toLowerCase() ||
        (stageName === "Clothes Picked Up" && t.status === "Picked Up")
    );

    if (existing) {
      return {
        name: stageName,
        time: existing.time || "–",
        completed: existing.completed,
        current: existing.current,
      };
    }

    // Default timeline logic if missing from storage record
    return {
      name: stageName,
      time: "–",
      completed: false,
      current: false,
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none pb-8">
      {/* Order Status Docket Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E3F0] shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6633CC] flex items-center justify-center font-bold">
            <PackageCheck className="w-5 h-5 text-[#6633CC]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#211747]">
                Order #{activeOrder.id}
              </span>
              <span className="text-[11px] text-[#6B6780]">
                • {activeOrder.service} ({activeOrder.itemsCount || 6} clothes)
              </span>
            </div>
            <p className="text-xs text-[#6B6780]">
              Pickup: {activeOrder.hostel} ({activeOrder.roomBlock})
            </p>
          </div>
        </div>

        {/* Right Info: Status Badge */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Badge status={activeOrder.status} showDot size="md" />
        </div>
      </div>

      {/* Main Grid: Split Screen matching Screen 7 */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E3F0] shadow-soft grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ==================================================== */}
        {/* LEFT: 8 CHECKPOINTS TIMELINE (7 cols)                */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 space-y-6 pl-2 pr-2 sm:pr-6">
          <div className="border-b border-[#F0EDF8] pb-3 mb-4">
            <h3 className="font-bold text-[#211747] text-base">
              Laundry Progress Milestones
            </h3>
            <p className="text-xs text-[#6B6780]">
              Live updates logged by the hostel hub scanner
            </p>
          </div>

          <div className="space-y-5">
            {fullTimeline.map((step, idx) => {
              const isCompleted = step.completed;
              const isCurrent = step.current;

              return (
                <div key={idx} className="relative flex items-start gap-4 group">
                  {/* Vertical Connecting Line */}
                  {idx < fullTimeline.length - 1 && (
                    <div
                      className={`absolute left-[13px] top-6 w-[2px] h-10 transition-colors ${
                        isCompleted ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    />
                  )}

                  {/* Circular Node Icon */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-50"
                        : isCurrent
                        ? "bg-[#6633CC] text-white ring-4 ring-[#6633CC]/20 shadow-purple animate-pulse"
                        : "bg-white text-gray-300 border-2 border-gray-200"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                  </div>

                  {/* Stage Label and Detailed Timestamp */}
                  <div className="flex-1 -mt-0.5">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-bold ${
                          isCurrent
                            ? "text-[#6633CC]"
                            : isCompleted
                            ? "text-[#211747]"
                            : "text-gray-400 font-medium"
                        }`}
                      >
                        {step.name}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#6633CC]/10 text-[#6633CC]">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8F8A9E] mt-0.5 font-medium">
                      {step.time || "Pending next stage"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT: 3D GRAPHIC & ASSIGNED STAFF CARD (5 cols)     */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* 3D Washing Machine Graphic Card (Screen 7 Visual) */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#F5F4FA] rounded-3xl border border-[#E5E3F0] text-center">
            <WashingMachineIllustration
              status={activeOrder.status}
              className="w-48 h-56 mb-2"
            />

            <h4 className="text-sm font-bold text-[#211747] mt-2">
              {activeOrder.status === "In Washing"
                ? "Cycle in progress at Central Hub"
                : activeOrder.status === "In Drying"
                ? "Tumble drying and fabric conditioning"
                : activeOrder.status === "Ironing"
                ? "Steam pressing & crisp packaging"
                : activeOrder.status === "Ready for Delivery"
                ? "Packaged and staged for delivery runner"
                : activeOrder.status === "Delivered"
                ? "Delivered safely to hostel room"
                : "Scheduled for collection"}
            </h4>

            <p className="text-xs text-[#6B6780] mt-1">
              Estimated Delivery:{" "}
              <span className="font-bold text-[#6633CC]">
                {activeOrder.expectedDelivery || "Tomorrow, 06:00 PM"}
              </span>
            </p>
          </div>

          {/* Assigned Staff & Hub Runner Info Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E3F0] shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                Assigned Staff Member
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#6633CC]">
                {activeOrder.assignedStaff?.staffId || "STF-8821"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6633CC] to-[#8C52FF] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                {activeOrder.assignedStaff?.name?.split(" ").map(n => n[0]).join("") || "RK"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#211747] truncate">
                  {activeOrder.assignedStaff?.name || "Rohit Kumar"}
                </p>
                <p className="text-xs text-[#6B6780] truncate">
                  {activeOrder.assignedStaff?.role || "Laundry Hub Runner & Operator"}
                </p>
              </div>

              <a
                href={`tel:${activeOrder.assignedStaff?.phone || "+919811122334"}`}
                className="p-2 rounded-xl bg-purple-50 text-[#6633CC] hover:bg-[#6633CC] hover:text-white transition-all shadow-sm"
                title="Call Assigned Runner"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#E5E3F0] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#6B6780]">Assigned Hub:</span>
                <span className="font-semibold text-[#211747]">
                  {activeOrder.assignedStaff?.hub || "Central Complex - North Wing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6780]">Pickup Room:</span>
                <span className="font-semibold text-[#211747]">
                  {activeOrder.hostel || "BH-5"}, {activeOrder.roomBlock || "A / 808"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6780]">Delivery Room:</span>
                <span className="font-semibold text-emerald-700">
                  Same ({activeOrder.hostel || "BH-5"}, {activeOrder.roomBlock || "A / 808"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6780]">Service Type:</span>
                <span className="font-bold text-[#6633CC]">
                  {activeOrder.service} ({activeOrder.itemsCount || 6} clothes)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>

            <Link
              href={`/student/complaints?orderId=${activeOrder.id}`}
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                leftIcon={<AlertCircle className="w-4 h-4" />}
              >
                Raise Issue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

