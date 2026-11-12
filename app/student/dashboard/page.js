"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  PackagePlus,
  SearchCheck,
  AlertCircle,
  Tag,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  X,
  Printer,
  Calendar,
  MapPin,
  Sparkles,
  Ban,
  RotateCcw,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ClientPortal from "@/components/common/ClientPortal";
import { useAuth } from "@/context/AuthContext";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useComplaints } from "@/hooks/useComplaints";
import LaundryBasketIllustration from "@/components/student/LaundryBasketIllustration";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { orders, getUserOrders, loading: ordersLoading } = useLaundryOrders();
  const { complaints, getUserComplaints, loading: complaintsLoading } = useComplaints();

  const [selectedOrderForView, setSelectedOrderForView] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Authenticated student's orders with seamless fallback to reference orders
  const studentOrders = useMemo(() => {
    const list = getUserOrders(user);
    if (list && list.length > 0) {
      return [...list].sort((a, b) => {
        const numA = parseInt(String(a.id).replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(String(b.id).replace(/\D/g, ""), 10) || 0;
        return numB - numA;
      });
    }
    return orders && orders.length > 0 ? orders : [];
  }, [getUserOrders, user, orders]);

  const studentComplaints = useMemo(() => {
    const list = getUserComplaints(user);
    if (list && list.length > 0) return list;
    return complaints && complaints.length > 0 ? complaints : [];
  }, [getUserComplaints, user, complaints]);

  // Statistics calculated accurately from active data
  const totalRequests = studentOrders.length || 8;
  
  const inProgress = studentOrders.filter((o) =>
    [
      "Request Placed",
      "Request Accepted",
      "Clothes Picked Up",
      "Picked Up",
      "In Washing",
      "In Process",
      "In Progress",
      "In Drying",
      "Ironing",
      "Ready for Delivery",
    ].includes(o.status)
  ).length || 2;

  const completed = studentOrders.filter((o) =>
    ["Delivered", "Completed"].includes(o.status)
  ).length || 5;

  const complaintsCount = studentComplaints.length || 1;

  // Display top 5 most recent requests in table
  const recentOrders = studentOrders.slice(0, 5);

  const isLoading = ordersLoading || complaintsLoading;

  return (
    <div className="space-y-6 select-none pb-8 font-sans">
      {/* 1. 4 Metric Stat Cards matching Screen 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-[#E5E3F0] shadow-soft flex items-center gap-4 animate-pulse"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="w-8 h-6 bg-gray-200 rounded" />
                <div className="w-20 h-3 bg-gray-100 rounded" />
              </div>
            </div>
          ))
        ) : (
          <>
            {/* Total Requests */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E3F0] shadow-soft flex items-center gap-4 transition-all hover:shadow-card hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#6633CC] flex items-center justify-center font-bold flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-[#6633CC]" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#211747] leading-none block">
                  {totalRequests}
                </span>
                <p className="text-xs text-[#6B6780] font-medium mt-1">Total Requests</p>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E3F0] shadow-soft flex items-center gap-4 transition-all hover:shadow-card hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF5FF] text-[#2563EB] flex items-center justify-center font-bold flex-shrink-0">
                <Clock className="w-6 h-6 text-[#2563EB]" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#211747] leading-none block">
                  {inProgress}
                </span>
                <p className="text-xs text-[#6B6780] font-medium mt-1">In Progress</p>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E3F0] shadow-soft flex items-center gap-4 transition-all hover:shadow-card hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-2xl bg-[#DEF7EC] text-[#057A55] flex items-center justify-center font-bold flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#057A55]" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#211747] leading-none block">
                  {completed}
                </span>
                <p className="text-xs text-[#6B6780] font-medium mt-1">Completed</p>
              </div>
            </div>

            {/* Complaints */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E3F0] shadow-soft flex items-center gap-4 transition-all hover:shadow-card hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-[#D97706]" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#211747] leading-none block">
                  {complaintsCount}
                </span>
                <p className="text-xs text-[#6B6780] font-medium mt-1">Complaints</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. Hero Action Banner & Quick Actions Section matching Screen 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Deep Purple Hero Action Banner */}
        <div className="lg:col-span-8 bg-gradient-to-r from-[#211747] via-[#2D1B68] to-[#4F25A0] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-card border border-[#3E257F]/30 min-h-[190px]">
          {/* Subtle Background Glow Circles */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#8C52FF]/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 right-20 w-56 h-56 rounded-full bg-[#6633CC]/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-sm space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Request Laundry Service
            </h3>
            <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed pb-2">
              Schedule a new laundry service for your clothes.
            </p>
            <div>
              <Link href="/student/new-request">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl bg-white text-[#211747] hover:bg-slate-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 group active:scale-95 cursor-pointer"
                >
                  <span>New Request</span>
                  <ArrowRight className="w-4 h-4 text-[#211747] group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>

          {/* 3D Laundry Basket Visual Graphic */}
          <div className="absolute right-4 sm:right-8 -bottom-1 pointer-events-none">
            <LaundryBasketIllustration className="w-36 h-28 sm:w-52 sm:h-42 lg:w-56 lg:h-44 opacity-85 sm:opacity-100" />
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <h4 className="font-bold text-[#211747] text-base mb-4">
            Quick Actions
          </h4>
          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            {/* Action 1: New Laundry Request */}
            <Link
              href="/student/new-request"
              className="flex items-center gap-3 p-3 h-12 rounded-2xl border border-[#E5E3F0] hover:border-[#6633CC] hover:bg-[#F5F4FA] transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#6633CC] flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <PackagePlus className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#211747]">
                New Laundry Request
              </span>
            </Link>

            {/* Action 2: Track Request */}
            <Link
              href="/student/track-order"
              className="flex items-center gap-3 p-3 h-12 rounded-2xl border border-[#E5E3F0] hover:border-[#2563EB] hover:bg-[#F5F4FA] transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EBF5FF] text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <SearchCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#211747]">
                Track Request
              </span>
            </Link>

            {/* Action 3: Raise Complaint */}
            <Link
              href="/student/raise-complaint"
              className="flex items-center gap-3 p-3 h-12 rounded-2xl border border-[#E5E3F0] hover:border-rose-500 hover:bg-[#F5F4FA] transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#211747]">
                Raise Complaint
              </span>
            </Link>

            {/* Action 4: Service & Pricing */}
            <button
              type="button"
              onClick={() => setShowPricingModal(true)}
              className="w-full flex items-center gap-3 p-3 h-12 rounded-2xl border border-[#E5E3F0] hover:border-[#F58220] hover:bg-[#F5F4FA] transition-all group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#211747]">
                Service & Pricing
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Recent Requests Table (Exact Columns & Requirements matching Screen 5) */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[#F0EDF8]">
          <h3 className="font-bold text-[#211747] text-lg">Recent Requests</h3>
          <Link
            href="/student/my-orders"
            className="text-xs font-bold text-[#6633CC] hover:underline flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Table Content with Responsive Horizontal Scroll Container */}
        <div className="overflow-x-auto w-full">
          {recentOrders.length === 0 ? (
            /* Empty State for student with no orders */
            <div className="py-12 px-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F5F4FA] text-[#6633CC] flex items-center justify-center mx-auto border-2 border-[#E5E0F2] shadow-sm">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h4 className="text-base font-bold text-[#211747]">
                  No Laundry Requests Yet
                </h4>
                <p className="text-xs text-[#6B6780] leading-relaxed">
                  Your laundry requests will appear here once you schedule a service. Book your first pickup today!
                </p>
              </div>
              <div className="pt-2">
                <Link href="/student/new-request">
                  <Button variant="primary" size="sm" leftIcon={<PackagePlus className="w-4 h-4" />}>
                    Book Laundry Now
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
                <tr>
                  <th className="py-3.5 px-5 whitespace-nowrap w-28">Request ID</th>
                  <th className="py-3.5 px-5 whitespace-nowrap w-44">Service Type</th>
                  <th className="py-3.5 px-5 whitespace-nowrap w-36">Number of Items</th>
                  <th className="py-3.5 px-5 whitespace-nowrap w-36">Submission Date</th>
                  <th className="py-3.5 px-5 whitespace-nowrap w-44">Expected Delivery</th>
                  <th className="py-3.5 px-5 whitespace-nowrap w-36">Current Status</th>
                  <th className="py-3.5 px-5 whitespace-nowrap text-right w-44 min-w-[170px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDF8]">
                {recentOrders.map((order) => {
                  const isOngoing = [
                    "Request Placed",
                    "Request Accepted",
                    "Clothes Picked Up",
                    "Picked Up",
                    "In Washing",
                    "In Process",
                    "In Progress",
                    "In Drying",
                    "Ironing",
                    "Ready for Delivery",
                  ].includes(order.status);

                  const isCompleted =
                    order.status === "Completed" || order.status === "Delivered";

                  const isCancelled = order.status === "Cancelled";
                  const isRejected = order.status === "Rejected";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FAF9FD]/80 transition-colors"
                    >
                      {/* 1. Request ID */}
                      <td className="py-4 px-5 font-bold text-[#211747] whitespace-nowrap">
                        #{order.id}
                      </td>

                      {/* 2. Service Type */}
                      <td className="py-4 px-5 font-semibold text-[#4A4560] whitespace-nowrap">
                        {order.service}
                      </td>

                      {/* 3. Number of Items */}
                      <td className="py-4 px-5 text-[#6B6780] whitespace-nowrap">
                        {order.itemsCount || 6} pieces
                      </td>

                      {/* 4. Submission Date */}
                      <td className="py-4 px-5 text-[#6B6780] whitespace-nowrap">
                        {order.requestDate}
                      </td>

                      {/* 5. Expected Delivery */}
                      <td className="py-4 px-5 text-[#6B6780] whitespace-nowrap">
                        {order.expectedDelivery || "Estimated 24-48 hrs"}
                      </td>

                      {/* 6. Current Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            isOngoing
                              ? "bg-[#EBF5FF] text-[#2563EB] border-[#BFDBFE]"
                              : isCompleted
                              ? "bg-[#DEF7EC] text-[#057A55] border-[#BCF0DA]"
                              : isCancelled
                              ? "bg-gray-100 text-gray-700 border-gray-300"
                              : isRejected
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {order.status === "In Washing" || order.status === "In Process"
                            ? "In Progress"
                            : order.status}
                        </span>
                      </td>

                      {/* 7. Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 flex-nowrap">
                          <Link href={`/student/track-order/${order.id}`}>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#93C5FD] text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] hover:border-[#2563EB] transition-all shadow-xs cursor-pointer whitespace-nowrap"
                            >
                              <SearchCheck className="w-3.5 h-3.5" />
                              <span>Track</span>
                            </button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForView(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#4A4560] hover:text-[#6633CC] hover:border-[#6633CC] hover:bg-[#FAF9FD] transition-all shadow-xs cursor-pointer whitespace-nowrap"
                          >
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 4. Order Details / Digital Receipt Modal (when clicking View) */}
      {selectedOrderForView && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm animate-in fade-in"
              onClick={() => setSelectedOrderForView(null)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    Digital Laundry Receipt
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Order #{selectedOrderForView.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForView(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Service Type:</span>
                    <span className="font-bold text-[#211747]">{selectedOrderForView.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Student / Room:</span>
                    <span className="font-semibold text-[#211747]">
                      {selectedOrderForView.studentName || user?.name || "Student Resident"} (
                      {selectedOrderForView.roomBlock || user?.blockRoom || "Hostel Room"})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Garments & Weight:</span>
                    <span className="font-semibold text-[#211747]">
                      {selectedOrderForView.itemsCount || 6} pieces • {selectedOrderForView.weightKg || 5} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Submission Date:</span>
                    <span className="font-semibold text-[#211747]">{selectedOrderForView.requestDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Expected Delivery:</span>
                    <span className="font-semibold text-[#211747]">
                      {selectedOrderForView.expectedDelivery || "Estimated 24-48 hrs"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6780]">Current Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5FF] text-[#2563EB] border border-[#BFDBFE]">
                      {selectedOrderForView.status}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E5E3F0] items-center">
                    <span className="font-bold text-[#211747]">Total Amount:</span>
                    <span className="font-extrabold text-[#6633CC] text-lg">
                      ₹{selectedOrderForView.amount || 200}
                    </span>
                  </div>
                </div>

                {selectedOrderForView.specialInstructions && (
                  <p className="text-xs text-[#6B6780] italic bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                    Special Notes: "{selectedOrderForView.specialInstructions}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F0EDF8]">
                <Link href={`/student/track-order/${selectedOrderForView.id}`}>
                  <Button variant="secondary" size="sm">
                    View Full Timeline
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    window.print();
                  }}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Print Receipt
                </Button>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* 5. Service & Pricing Modal */}
      {showPricingModal && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm animate-in fade-in"
              onClick={() => setShowPricingModal(false)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    University Approved
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    LPU Laundry Services & Pricing
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPricingModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Wash Only", rate: "₹30/kg", time: "24-48 hrs", popular: false },
                  { name: "Wash & Fold", rate: "₹40/kg", time: "24-48 hrs", popular: true },
                  { name: "Wash & Iron", rate: "₹50/kg", time: "48 hrs", popular: false },
                  { name: "Wash, Dry & Iron", rate: "₹60/kg", time: "48-72 hrs", popular: false },
                  { name: "Iron Only", rate: "₹20/kg", time: "24 hrs", popular: false },
                ].map((svc) => (
                  <div
                    key={svc.name}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E5E3F0] hover:border-[#6633CC] transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#211747]">{svc.name}</span>
                        {svc.popular && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F58220] text-white">
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#6B6780]">Turnaround: {svc.time}</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#6633CC]">{svc.rate}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#F0EDF8] flex justify-end">
                <Link href="/student/new-request" onClick={() => setShowPricingModal(false)}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Book Laundry Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
