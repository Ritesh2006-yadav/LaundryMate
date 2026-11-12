"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  X,
  AlertTriangle,
  Printer,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  Ban,
  FileText,
  UserCheck,
  ChevronRight,
  Phone,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import ClientPortal from "@/components/common/ClientPortal";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useAuth } from "@/context/AuthContext";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { orders, cancelOrder } = useLaundryOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modals state
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Filter orders by student's registration number (or all if demo)
  const studentOrders = orders.filter((o) => {
    if (!user?.regNo) return true;
    return !o.studentRegNo || o.studentRegNo === user.regNo || o.studentName === user.name;
  });

  const filteredOrders = studentOrders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.assignedStaff?.name && o.assignedStaff.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.status && o.status.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" &&
        [
          "Request Placed",
          "Request Accepted",
          "Clothes Picked Up",
          "Picked Up",
          "In Washing",
          "In Process",
          "In Drying",
          "Ironing",
          "In Progress",
        ].includes(o.status)) ||
      (filterStatus === "completed" &&
        ["Delivered", "Completed", "Ready for Delivery"].includes(o.status)) ||
      (filterStatus === "cancelled" && o.status === "Cancelled");

    return matchesSearch && matchesStatus;
  });

  const handleConfirmCancel = () => {
    if (!orderToCancel) return;
    cancelOrder(orderToCancel.id, cancelReason || "Cancelled by student");
    setOrderToCancel(null);
    setCancelReason("");
  };

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#6B6780]">
            Review all your active wash requests, pickup slots, and delivered clothes
          </span>
        </div>

        <Link href="/student/new-request" className="self-start sm:self-auto">
          <Button variant="orange" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            New Laundry Request
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by Request ID, service, staff name or status..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Orders" },
            { id: "active", label: "In Progress" },
            { id: "completed", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st.id
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
              <tr>
                <th className="py-3.5 px-6">Request ID</th>
                <th className="py-3.5 px-6">Service Type</th>
                <th className="py-3.5 px-6">Clothes & Weight</th>
                <th className="py-3.5 px-6">Pickup Date</th>
                <th className="py-3.5 px-6">Expected Delivery</th>
                <th className="py-3.5 px-6">Assigned Staff</th>
                <th className="py-3.5 px-6">Current Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B6780] text-sm">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isCancellable =
                    order.status === "Request Placed" || order.status === "Pending";
                  const isOngoing =
                    [
                      "Request Placed",
                      "Request Accepted",
                      "Clothes Picked Up",
                      "Picked Up",
                      "In Washing",
                      "In Process",
                      "In Drying",
                      "Ironing",
                      "In Progress",
                      "Ready for Delivery",
                    ].includes(order.status);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FAF9FD]/80 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-[#211747]">
                        #{order.id}
                      </td>

                      <td className="py-4 px-6 font-medium text-[#4A4560]">
                        <div>{order.service}</div>
                        <div className="text-[10px] text-[#6633CC] font-semibold">
                          ₹{order.amount || 200}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-[#6B6780]">
                        <span className="font-semibold text-[#211747]">
                          {order.itemsCount || 8} clothes
                        </span>
                        <div className="text-[10px] text-[#8F8A9E]">
                          ~{order.weightKg || 5} kg
                        </div>
                      </td>

                      <td className="py-4 px-6 text-[#6B6780]">
                        <div className="font-medium text-[#211747]">
                          {order.requestDate}
                        </div>
                        {order.pickupSlot && (
                          <div className="text-[10px] text-[#8F8A9E] truncate max-w-[130px]">
                            {order.pickupSlot.split("(")[0]}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-[#6B6780]">
                        <div className="font-medium text-[#211747]">
                          {order.expectedDelivery || "Within 48 hrs"}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-[#6633CC] flex items-center justify-center font-bold text-[11px]">
                            {order.assignedStaff?.name?.split(" ").map(n => n[0]).join("") || "RK"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#211747] leading-tight">
                              {order.assignedStaff?.name || "Rohit Kumar"}
                            </p>
                            <p className="text-[10px] text-[#8F8A9E]">
                              {order.assignedStaff?.staffId || "STF-8821"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge status={order.status} showDot />
                      </td>

                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link href={`/student/track-order/${order.id}`}>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl border border-[#93C5FD] text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-all shadow-sm"
                          >
                            Track
                          </button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(order)}
                          className="px-3 py-1.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] hover:bg-gray-100 transition-all"
                        >
                          Docket
                        </button>

                        {isCancellable && (
                          <button
                            type="button"
                            onClick={() => setOrderToCancel(order)}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            Cancel
                          </button>
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

      {/* Cancellation Confirmation Modal */}
      {orderToCancel && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setOrderToCancel(null)}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-4 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#211747]">
                  Cancel Request #{orderToCancel.id}?
                </h3>
                <p className="text-xs text-[#6B6780] mt-1 leading-relaxed">
                  Are you sure you want to cancel this order? Since the runner has not
                  yet collected your clothes, your quota / payment will be fully refunded.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Changed schedule, clothes washed manually, incorrect service selection..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E3F0] text-xs text-[#211747] focus:outline-none focus:border-rose-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setOrderToCancel(null)}
                >
                  Keep Order
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* Digital Receipt / Docket Modal */}
      {selectedReceipt && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setSelectedReceipt(null)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    University Digital Laundry Docket
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Order #{selectedReceipt.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Service Type:</span>
                    <span className="font-bold text-[#211747]">
                      {selectedReceipt.service}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Pickup & Delivery Room:</span>
                    <span className="font-semibold text-[#211747]">
                      {selectedReceipt.hostel || "BH-5"}, {selectedReceipt.roomBlock || "A / 808"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Garments & Weight:</span>
                    <span className="font-semibold text-[#211747]">
                      {selectedReceipt.itemsCount || 8} pieces • {selectedReceipt.weightKg || 5} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Booking Date:</span>
                    <span className="font-semibold text-[#211747]">
                      {selectedReceipt.requestDate} ({selectedReceipt.requestTime || "10:00 AM"})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Expected Delivery:</span>
                    <span className="font-bold text-[#6633CC]">
                      {selectedReceipt.expectedDelivery || "Within 48 hrs"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6780]">Assigned Staff:</span>
                    <span className="font-semibold text-[#211747]">
                      {selectedReceipt.assignedStaff?.name || "Rohit Kumar"} ({selectedReceipt.assignedStaff?.staffId || "STF-8821"})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6780]">Current Status:</span>
                    <Badge status={selectedReceipt.status} showDot />
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E5E3F0] items-center">
                    <span className="font-bold text-[#211747]">Total Paid:</span>
                    <span className="font-extrabold text-[#6633CC] text-lg">
                      ₹{selectedReceipt.amount || 200}
                    </span>
                  </div>
                </div>

                {selectedReceipt.specialInstructions && (
                  <p className="text-xs text-[#6B6780] italic bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                    Special Instructions: "{selectedReceipt.specialInstructions}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F0EDF8]">
                <Link href={`/student/track-order/${selectedReceipt.id}`}>
                  <Button variant="secondary" size="sm">
                    View Full Timeline
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Print Receipt
                </Button>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
