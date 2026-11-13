"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Shirt,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Building2,
  Calendar,
  Check,
  X,
  RotateCw,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import ClientPortal from "@/components/common/ClientPortal";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useAuth } from "@/context/AuthContext";

// The 6 canonical processing stages requested in Part 7
const PROCESSING_STAGES = [
  { id: "Clothes Picked Up", label: "1. Clothes Collected", shortLabel: "Collected", step: 1, next: "In Washing" },
  { id: "In Washing", label: "2. In Washing", shortLabel: "Washing", step: 2, next: "In Drying" },
  { id: "In Drying", label: "3. In Drying", shortLabel: "Drying", step: 3, next: "Ironing" },
  { id: "Ironing", label: "4. Ironing & Steam Press", shortLabel: "Ironing", step: 4, next: "Quality Check" },
  { id: "Quality Check", label: "5. Quality Check", shortLabel: "QA Check", step: 5, next: "Ready for Delivery" },
  { id: "Ready for Delivery", label: "6. Ready for Delivery", shortLabel: "Ready", step: 6, next: null },
];

function ProcessLaundryContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const targetIdParam = searchParams.get("id");

  const { orders, updateOrderStatus, getOrderById } = useLaundryOrders();

  const [activeStage, setActiveStage] = useState(
    targetIdParam ? "all" : "In Washing"
  );
  const [searchTerm, setSearchTerm] = useState(targetIdParam || "");

  // Modal: Stage progression
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetNextStatus, setTargetNextStatus] = useState("");
  const [stageRemarks, setStageRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Filter orders that are currently in the 6 processing stages
  const processingOrders = useMemo(() => {
    return orders.filter((o) => {
      // Map statuses
      const status = o.status === "In Process" ? "In Washing" : o.status;
      return [
        "Clothes Picked Up",
        "In Washing",
        "In Drying",
        "Ironing",
        "Quality Check",
        "Ready for Delivery",
      ].includes(status);
    });
  }, [orders]);

  // Stage counts for badges
  const stageCounts = useMemo(() => {
    const counts = {};
    PROCESSING_STAGES.forEach((s) => {
      counts[s.id] = processingOrders.filter((o) => {
        const mapped = o.status === "In Process" ? "In Washing" : o.status;
        return mapped === s.id;
      }).length;
    });
    return counts;
  }, [processingOrders]);

  // Filtered by stage and search
  const displayedOrders = useMemo(() => {
    return processingOrders.filter((o) => {
      const mappedStatus = o.status === "In Process" ? "In Washing" : o.status;
      const matchesStage = activeStage === "all" || mappedStatus === activeStage;

      const matchesSearch =
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.studentName || o.student || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.roomBlock || "").toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStage && matchesSearch;
    });
  }, [processingOrders, activeStage, searchTerm]);

  // Handle next stage transition
  const handleOpenAdvanceModal = (order) => {
    const mapped = order.status === "In Process" ? "In Washing" : order.status;
    const currentStageObj = PROCESSING_STAGES.find((s) => s.id === mapped) || PROCESSING_STAGES[0];
    const nextStage = currentStageObj.next;

    if (!nextStage) return;

    setSelectedOrder(order);
    setTargetNextStatus(nextStage);

    if (nextStage === "In Washing") {
      setStageRemarks("Garments loaded into commercial washer. Detergent & sanitizer cycle started.");
    } else if (nextStage === "In Drying") {
      setStageRemarks("Washing cycle finished. Transferred to tumble dryer unit.");
    } else if (nextStage === "Ironing") {
      setStageRemarks("Drying complete. Clothes queued for steam press and crisp folding.");
    } else if (nextStage === "Quality Check") {
      setStageRemarks("Garments pressed. Undergoing stain & tag inspection by Hub Quality Inspector.");
    } else if (nextStage === "Ready for Delivery") {
      setStageRemarks("Quality inspection passed 100%. Packaged in fresh protective film, dispatched to runner.");
    }
    setUpdateSuccess(false);
  };

  const handleConfirmAdvance = (e) => {
    e.preventDefault();
    if (!selectedOrder || !targetNextStatus) return;

    setIsUpdating(true);
    updateOrderStatus(selectedOrder.id, targetNextStatus, stageRemarks);

    setIsUpdating(false);
    setUpdateSuccess(true);
    setTimeout(() => {
      setUpdateSuccess(false);
      setSelectedOrder(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Visual 6-Stage Process Stepper Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E3F0] shadow-soft space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#211747]">
            Active Wash Plant Workflow Stages
          </h3>
          <p className="text-xs text-[#6B6780]">
            Monitor and advance garments sequentially through the 6 hub processing stages
          </p>
        </div>

        {/* 6 Stage Buttons / Pipeline Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
          {PROCESSING_STAGES.map((stage) => {
            const count = stageCounts[stage.id] || 0;
            const isSelected = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(isSelected ? "all" : stage.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#211747] text-white border-[#211747] shadow-md ring-2 ring-[#F58220]"
                    : "bg-[#FAF9FD] text-[#211747] border-[#E5E3F0] hover:border-[#6633CC]/40 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-[#F58220] text-white"
                        : "bg-purple-100 text-[#6633CC]"
                    }`}
                  >
                    Stage {stage.step}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : count > 0
                        ? "bg-[#6633CC] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <p className="text-xs font-bold mt-2 truncate">
                  {stage.shortLabel}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveStage("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeStage === "all"
                ? "bg-[#6633CC] text-white shadow-purple"
                : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
            }`}
          >
            All Processing Orders ({processingOrders.length})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by ID, Student, or Room..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Processing Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
              <tr>
                <th className="py-3.5 px-6 font-bold">Request ID</th>
                <th className="py-3.5 px-6 font-bold">Student</th>
                <th className="py-3.5 px-6 font-bold">Hostel Location</th>
                <th className="py-3.5 px-6 font-bold">Service</th>
                <th className="py-3.5 px-6 font-bold text-center">Items & Weight</th>
                <th className="py-3.5 px-6 font-bold">Current Stage</th>
                <th className="py-3.5 px-6 font-bold text-right">Workflow Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8]">
              {displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#6B6780]">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-[#6633CC] flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-[#211747] text-sm">No orders currently in this stage</p>
                    <p className="text-xs text-[#8F8A9E] mt-1">Select another stage or clear filters to view other garments.</p>
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order) => {
                  const mappedStatus = order.status === "In Process" ? "In Washing" : order.status;
                  const currentStageObj = PROCESSING_STAGES.find((s) => s.id === mappedStatus) || PROCESSING_STAGES[0];
                  const nextStage = currentStageObj.next;

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF9FD]/80 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-6 font-mono font-bold text-xs text-[#211747]">
                        #{order.id}
                      </td>

                      {/* Student */}
                      <td className="py-4 px-6">
                        <p className="font-bold text-xs text-[#211747]">
                          {order.studentName || order.student || "Student Resident"}
                        </p>
                        <p className="text-[11px] text-[#6B6780]">
                          {order.studentRegNo || "LPU12345678"}
                        </p>
                      </td>

                      {/* Hostel */}
                      <td className="py-4 px-6 text-xs text-[#4A4560]">
                        <div className="font-medium text-[#211747]">{order.hostel || "Boys Hostel 3"}</div>
                        <div className="text-[11px] text-[#6B6780]">Room: {order.roomBlock || "B-32 / 210"}</div>
                      </td>

                      {/* Service */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-[#6633CC] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                          {order.service}
                        </span>
                      </td>

                      {/* Items & Weight */}
                      <td className="py-4 px-6 text-center text-xs">
                        <div className="font-bold text-[#211747]">{order.itemsCount || 0} pcs</div>
                        <div className="text-[11px] text-[#6B6780]">{order.weightKg || order.weight || order.approxWeight || 0} kg</div>
                      </td>

                      {/* Current Stage */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#6633CC] animate-ping" />
                          <Badge status={mappedStatus} showDot size="sm" />
                        </div>
                        <span className="text-[10px] text-[#8F8A9E] block mt-0.5">
                          Stage {currentStageObj.step} of 6
                        </span>
                      </td>

                      {/* Workflow Transition Action */}
                      <td className="py-4 px-6 text-right">
                        {nextStage ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAdvanceModal(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6633CC] hover:bg-[#5225A8] text-white text-xs font-bold shadow-sm transition-all hover:scale-102 cursor-pointer"
                          >
                            <span>Move to {nextStage}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ready for Dispatch
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL: ADVANCE WORKFLOW STAGE & RECORD TELEMETRY     */}
      {/* ==================================================== */}
      {selectedOrder && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => !updateSuccess && setSelectedOrder(null)}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#211747]">
                    Advance Stage #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-[#6B6780]">
                    Promote order to next workflow stage
                  </p>
                </div>
                {!updateSuccess && (
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {updateSuccess ? (
                <div className="text-center py-6 space-y-2 animate-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <Check className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <h4 className="text-base font-bold text-[#211747]">
                    Order Advanced to {targetNextStatus}!
                  </h4>
                  <p className="text-xs text-[#6B6780]">
                    Stage telemetry broadcasted. Student timeline updated in real-time.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmAdvance} className="space-y-4">
                  {/* Transition Graphic */}
                  <div className="p-3.5 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#6B6780] uppercase tracking-wider block">From</span>
                      <span className="font-bold text-[#211747]">{selectedOrder.status}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#F58220]" />
                    <div>
                      <span className="text-[10px] text-[#6B6780] uppercase tracking-wider block">To Next Stage</span>
                      <span className="font-bold text-[#6633CC]">{targetNextStatus}</span>
                    </div>
                  </div>

                  {/* Staff Remarks */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                      Hub Telemetry & Quality Remarks *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={stageRemarks}
                      onChange={(e) => setStageRemarks(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-[#6633CC] outline-none resize-none"
                      placeholder="Enter stage completion remarks..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit" disabled={isUpdating}>
                      {isUpdating ? "Saving..." : `Confirm ${targetNextStatus}`}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}

export default function StaffProcessLaundryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6B6780]">Loading processing workflow...</div>}>
      <ProcessLaundryContent />
    </Suspense>
  );
}
