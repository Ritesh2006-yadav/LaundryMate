"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Truck,
  CheckCircle2,
  Clock,
  User,
  Building2,
  AlertCircle,
  AlertTriangle,
  Search,
  Check,
  X,
  Phone,
  ShieldCheck,
  Calendar,
  RotateCcw,
  ArrowRight,
  PackageCheck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import ClientPortal from "@/components/common/ClientPortal";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useAuth } from "@/context/AuthContext";

export default function StaffDeliveryManagementPage() {
  const { user } = useAuth();
  const { orders, updateOrderStatus } = useLaundryOrders();

  const [activeTab, setActiveTab] = useState("ready"); // 'ready' | 'out' | 'delivered' | 'all'
  const [searchTerm, setSearchTerm] = useState("");

  // Modal 1: Confirm Successful Delivery
  const [orderToDeliver, setOrderToDeliver] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
  const [deliveryRemarks, setDeliveryRemarks] = useState(
    "Garments handed over directly to student resident in room. Checked tag seal."
  );
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  // Modal 2: Report Unsuccessful Delivery Attempt
  const [orderUnsuccessful, setOrderUnsuccessful] = useState(null);
  const [unsuccessfulReason, setUnsuccessfulReason] = useState("Student room locked / resident unavailable");
  const [unsuccessfulRemarks, setUnsuccessfulRemarks] = useState(
    "Runner visited room, no response on call. Package returned to Central Hub shelf for next slot."
  );

  // Filter orders relevant to delivery
  const deliveryOrders = useMemo(() => {
    return orders.filter((o) =>
      ["Ready for Delivery", "Out for Delivery", "Delivered", "Delivery Attempted"].includes(o.status)
    );
  }, [orders]);

  // Tab subsets
  const readyOrders = useMemo(() => deliveryOrders.filter((o) => o.status === "Ready for Delivery"), [deliveryOrders]);
  const outOrders = useMemo(() => deliveryOrders.filter((o) => o.status === "Out for Delivery"), [deliveryOrders]);
  const deliveredOrders = useMemo(() => deliveryOrders.filter((o) => o.status === "Delivered"), [deliveryOrders]);

  const currentTabList = useMemo(() => {
    if (activeTab === "ready") return readyOrders;
    if (activeTab === "out") return outOrders;
    if (activeTab === "delivered") return deliveredOrders;
    return deliveryOrders;
  }, [activeTab, readyOrders, outOrders, deliveredOrders, deliveryOrders]);

  const filteredOrders = useMemo(() => {
    return currentTabList.filter((order) => {
      const match =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.studentName || order.student || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.roomBlock || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.hostel || "").toLowerCase().includes(searchTerm.toLowerCase());
      return match;
    });
  }, [currentTabList, searchTerm]);

  // Actions
  const handleMarkOutForDelivery = (orderId) => {
    updateOrderStatus(
      orderId,
      "Out for Delivery",
      `Order dispatched with runner ${user?.name || "Rohit Kumar"}. En route to hostel room.`
    );
  };

  const handleConfirmDeliver = (e) => {
    e.preventDefault();
    if (!orderToDeliver) return;

    const fullTelemetry = `Delivered at ${deliveryTime}: ${deliveryRemarks}`;
    updateOrderStatus(orderToDeliver.id, "Delivered", fullTelemetry);

    setDeliverySuccess(true);
    setTimeout(() => {
      setDeliverySuccess(false);
      setOrderToDeliver(null);
    }, 1200);
  };

  const handleConfirmUnsuccessful = (e) => {
    e.preventDefault();
    if (!orderUnsuccessful) return;

    const reasonTelemetry = `Unsuccessful delivery attempt: ${unsuccessfulReason}. ${unsuccessfulRemarks}`;
    // Revert back to Ready for Delivery with telemetry note
    updateOrderStatus(orderUnsuccessful.id, "Ready for Delivery", reasonTelemetry);
    setOrderUnsuccessful(null);
  };

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6780]">Ready for Dispatch</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#211747] mt-2">{readyOrders.length}</p>
          <span className="text-[11px] text-[#6B6780] font-medium">Packaged on shelf</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6780]">Out for Delivery</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-cyan-600 mt-2">{outOrders.length}</p>
          <span className="text-[11px] text-[#6B6780] font-medium">With hostel runners</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6780]">Delivered Today</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6633CC] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#6633CC] mt-2">{deliveredOrders.length}</p>
          <span className="text-[11px] text-[#6B6780] font-medium">Successful handovers</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6780]">Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-2">98.5%</p>
          <span className="text-[11px] text-[#6B6780] font-medium">Zero missed handovers</span>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("ready")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "ready"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              Ready for Dispatch ({readyOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("out")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "out"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              Out for Delivery ({outOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("delivered")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "delivered"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              Delivered ({deliveredOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              All Records ({deliveryOrders.length})
            </button>
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by ID, Student, Room..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Delivery Table */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
              <tr>
                <th className="py-3.5 px-6 font-bold">Request ID</th>
                <th className="py-3.5 px-6 font-bold">Student</th>
                <th className="py-3.5 px-6 font-bold">Hostel Location</th>
                <th className="py-3.5 px-6 font-bold">Service & Items</th>
                <th className="py-3.5 px-6 font-bold">Delivery Schedule</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#6B6780]">
                    <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-3">
                      <Truck className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-[#211747] text-sm">No delivery orders in this queue</p>
                    <p className="text-xs text-[#8F8A9E] mt-1">Check other tabs or search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isReady = order.status === "Ready for Delivery";
                  const isOut = order.status === "Out for Delivery";
                  const isDelivered = order.status === "Delivered";

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
                        <div className="font-semibold text-[#211747]">{order.hostel || "Boys Hostel 3"}</div>
                        <div className="text-[11px] text-[#6B6780]">Room: {order.roomBlock || "B-32 / 210"}</div>
                      </td>

                      {/* Service & Items */}
                      <td className="py-4 px-6 text-xs">
                        <span className="font-semibold text-[#6633CC]">{order.service}</span>
                        <div className="text-[11px] text-[#6B6780] mt-0.5">
                          {order.itemsCount || 6} clothes • {order.weight || order.approxWeight || 3.5} kg
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-6 text-xs text-[#4A4560]">
                        <div className="font-medium text-[#211747]">
                          {order.expectedDelivery || "Today, 05:00 - 07:00 PM"}
                        </div>
                        <div className="text-[10px] text-[#8F8A9E]">Evening Delivery Slot</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <Badge status={order.status} showDot size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If Ready: Dispatch out for delivery */}
                          {isReady && (
                            <button
                              type="button"
                              onClick={() => handleMarkOutForDelivery(order.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {/* If Out: Confirm Delivery OR Report Issue */}
                          {isOut && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderToDeliver(order);
                                  setDeliverySuccess(false);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#057A55] hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Delivered</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setOrderUnsuccessful(order)}
                                className="px-2.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                                title="Report Unsuccessful Attempt"
                              >
                                Issue
                              </button>
                            </>
                          )}

                          {/* If Delivered: Receipt Badge */}
                          {isDelivered && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-[#6633CC] text-xs font-bold border border-purple-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Completed
                            </span>
                          )}
                        </div>
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
      {/* MODAL 1: CONFIRM SUCCESSFUL HANDOVER / DELIVERY      */}
      {/* ==================================================== */}
      {orderToDeliver && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => !deliverySuccess && setOrderToDeliver(null)}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#211747]">
                    Confirm Handover #{orderToDeliver.id}
                  </h3>
                  <p className="text-xs text-[#6B6780]">
                    Record delivery time and resident handover remarks
                  </p>
                </div>
                {!deliverySuccess && (
                  <button
                    type="button"
                    onClick={() => setOrderToDeliver(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {deliverySuccess ? (
                <div className="text-center py-6 space-y-2 animate-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <Check className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <h4 className="text-base font-bold text-[#211747]">
                    Handover Recorded Successfully!
                  </h4>
                  <p className="text-xs text-[#6B6780]">
                    Order #{orderToDeliver.id} marked as Delivered. Student notified.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmDeliver} className="space-y-4">
                  <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#6B6780]">Resident:</span>
                      <span className="font-bold text-[#211747]">
                        {orderToDeliver.studentName || orderToDeliver.student} ({orderToDeliver.studentRegNo || "LPU12345678"})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B6780]">Delivery Destination:</span>
                      <span className="font-bold text-emerald-700">
                        Same Room ({orderToDeliver.hostel ? `${orderToDeliver.hostel}, ` : ""}{orderToDeliver.roomBlock || "B-32 / 210"})
                      </span>
                    </div>
                    {orderToDeliver.contactPhone && (
                      <div className="flex justify-between">
                        <span className="text-[#6B6780]">Mobile Number:</span>
                        <a
                          href={`tel:${orderToDeliver.contactPhone}`}
                          className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{orderToDeliver.contactPhone}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                      Handover Timestamp *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-[#211747] rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-[#6633CC] outline-none"
                      placeholder="e.g. 05:45 PM"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                      Delivery Remarks / Resident Confirmation
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryRemarks}
                      onChange={(e) => setDeliveryRemarks(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-[#6633CC] outline-none resize-none"
                      placeholder="E.g. Handed to student in room B-210, verified tag seal..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => setOrderToDeliver(null)}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      Confirm Delivery
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </ClientPortal>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: HANDLE UNSUCCESSFUL DELIVERY ATTEMPT        */}
      {/* ==================================================== */}
      {orderUnsuccessful && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setOrderUnsuccessful(null)}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-4 my-auto">
              <div className="flex items-center gap-3 text-amber-600 pb-2 border-b border-[#F0EDF8]">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-bold text-[#211747]">
                    Delivery Issue #{orderUnsuccessful.id}
                  </h3>
                  <p className="text-xs text-[#6B6780]">
                    Record attempt note & reschedule for next slot
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmUnsuccessful} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Issue Reason *
                  </label>
                  <select
                    value={unsuccessfulReason}
                    onChange={(e) => setUnsuccessfulReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="Student room locked / resident unavailable">
                      Student room locked / resident unavailable
                    </option>
                    <option value="Resident requested reschedule to later time">
                      Resident requested reschedule to later time
                    </option>
                    <option value="Wrong room number entered by student">
                      Wrong room number entered by student
                    </option>
                    <option value="Hostel block floor access restricted">
                      Hostel block floor access restricted
                    </option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Staff Dispatch Notes
                  </label>
                  <textarea
                    rows={2}
                    value={unsuccessfulRemarks}
                    onChange={(e) => setUnsuccessfulRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => setOrderUnsuccessful(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  >
                    Save & Reschedule
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}

