"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Scale,
  Shirt,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
  Building2,
  PackageCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import ClientPortal from "@/components/common/ClientPortal";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useAuth } from "@/context/AuthContext";
import { getISTNow } from "@/lib/utils/scheduling";

export default function StaffPickupManagementPage() {
  const { user } = useAuth();
  const { orders, updateOrderStatus, getOrderById } = useLaundryOrders();

  const [activeTab, setActiveTab] = useState("today"); // 'today' | 'upcoming' | 'all'
  const [searchTerm, setSearchTerm] = useState("");

  // Modal: Mark Clothes Collected
  const [orderToCollect, setOrderToCollect] = useState(null);
  const [actualCount, setActualCount] = useState(6);
  const [actualWeight, setActualWeight] = useState(3.5);
  const [collectionRemarks, setCollectionRemarks] = useState(
    "Garments collected in tagged laundry bag and verified with resident."
  );
  const [collectionSuccess, setCollectionSuccess] = useState(false);

  // Filter orders that need pickup
  const pickupOrders = useMemo(() => {
    return orders.filter((o) =>
      ["Request Placed", "New", "Pending", "Request Accepted", "Clothes Picked Up"].includes(o.status)
    );
  }, [orders]);

  // Today vs Upcoming evaluated dynamically in IST (Asia/Kolkata)
  const todayPickups = useMemo(() => {
    const { todayKey, day, month } = getISTNow();
    return pickupOrders.filter((o) => {
      const pDate = (o.pickupDate || o.pickupDateKey || "").toLowerCase();
      return (
        pDate.includes("today") ||
        pDate.includes(todayKey) ||
        pDate.includes(`${day} ${month}`) ||
        !o.pickupDate
      );
    });
  }, [pickupOrders]);

  const upcomingPickups = useMemo(() => {
    return pickupOrders.filter(
      (o) =>
        !todayPickups.includes(o)
    );
  }, [pickupOrders, todayPickups]);

  const currentList = activeTab === "today" ? todayPickups : activeTab === "upcoming" ? upcomingPickups : pickupOrders;

  const filteredList = useMemo(() => {
    return currentList.filter((order) => {
      const matchSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.studentName || order.student || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.roomBlock || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.hostel || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [currentList, searchTerm]);

  // Quick stats
  const pendingCount = todayPickups.filter((o) => o.status !== "Clothes Picked Up").length;
  const collectedCount = todayPickups.filter((o) => o.status === "Clothes Picked Up").length;

  const handleOpenCollectionModal = (order) => {
    setOrderToCollect(order);
    setActualCount(order.itemsCount || 6);
    setActualWeight(parseFloat(order.weight || order.approxWeight || 3.5));
    setCollectionRemarks("Garments collected from student room and tagged for wash plant.");
    setCollectionSuccess(false);
  };

  const handleConfirmCollection = (e) => {
    e.preventDefault();
    if (!orderToCollect) return;

    // Update order with actual weight, count, remarks, and status
    const updatedTelemetry = `${collectionRemarks} (Actual: ${actualCount} garments, ${actualWeight} kg)`;
    updateOrderStatus(orderToCollect.id, "Clothes Picked Up", updatedTelemetry);

    setCollectionSuccess(true);
    setTimeout(() => {
      setCollectionSuccess(false);
      setOrderToCollect(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Pickup Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6780]">Today&apos;s Pickups</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6633CC] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#211747] mt-2">{todayPickups.length}</p>
          <span className="text-[11px] text-[#6B6780] font-medium">Scheduled for current shift</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6780]">Pending Collection</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</p>
          <span className="text-[11px] text-[#6B6780] font-medium">Runners dispatched</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6780]">Collected Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{collectedCount}</p>
          <span className="text-[11px] text-[#6B6780] font-medium">Intake verified</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6780]">Upcoming Pickups</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-2">{upcomingPickups.length}</p>
          <span className="text-[11px] text-[#6B6780] font-medium">Next 48 hours</span>
        </div>
      </div>

      {/* Action / Search / Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tab Filter */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("today")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "today"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              Today&apos;s Pickups ({todayPickups.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "upcoming"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              Upcoming ({upcomingPickups.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              All Pickups ({pickupOrders.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search student, room, ID..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pickups Table Card */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
              <tr>
                <th className="py-3.5 px-6 font-bold">Request ID</th>
                <th className="py-3.5 px-6 font-bold">Student Resident</th>
                <th className="py-3.5 px-6 font-bold">Hostel Location</th>
                <th className="py-3.5 px-6 font-bold">Pickup Slot</th>
                <th className="py-3.5 px-6 font-bold">Service & Est. Load</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#6B6780]">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-[#6633CC] flex items-center justify-center mx-auto mb-3">
                      <PackageCheck className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-[#211747] text-sm">No scheduled pickups in this queue</p>
                    <p className="text-xs text-[#8F8A9E] mt-1">All requested laundry items have been processed or none match criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((order) => {
                  const isCollected = order.status === "Clothes Picked Up";
                  return (
                    <tr key={order.id} className="hover:bg-[#FAF9FD]/80 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-6 font-mono font-bold text-xs text-[#211747]">
                        #{order.id}
                      </td>

                      {/* Student */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#6633CC]/10 text-[#6633CC] flex items-center justify-center font-bold text-xs">
                            {(order.studentName || order.student || "S")[0]}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-[#211747]">
                              {order.studentName || order.student || "Student Resident"}
                            </p>
                            <p className="text-[11px] text-[#6B6780]">
                              {order.studentRegNo || "LPU12345678"}
                            </p>
                            {order.contactPhone && (
                              <a
                                href={`tel:${order.contactPhone}`}
                                className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5 font-semibold"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{order.contactPhone}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Hostel Location */}
                      <td className="py-4 px-6 text-xs text-[#4A4560]">
                        <div className="flex items-center gap-1.5 font-bold text-[#211747]">
                          <Building2 className="w-3.5 h-3.5 text-[#8F8A9E]" />
                          <span>{order.hostel || "Boys Hostel 3"}</span>
                        </div>
                        <div className="text-[11px] text-[#6B6780] pl-5">
                          Room: {order.roomBlock || "B-32 / 210"}
                        </div>
                        <div className="text-[10px] text-[#6633CC] font-semibold pl-5">
                          Delivers to: Same room
                        </div>
                      </td>

                      {/* Pickup Slot */}
                      <td className="py-4 px-6 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-[#211747]">
                          <Clock className="w-3.5 h-3.5 text-[#F58220]" />
                          <span>{order.pickupTime || "09:00 - 11:00 AM"}</span>
                        </div>
                        <div className="text-[11px] text-[#6B6780] pl-5">
                          {order.pickupDate || order.date || "Today"}
                        </div>
                      </td>

                      {/* Service & Load */}
                      <td className="py-4 px-6 text-xs">
                        <span className="font-semibold text-[#6633CC]">{order.service}</span>
                        <div className="text-[11px] text-[#6B6780] mt-0.5">
                          {order.itemsCount || 6} items • ~{order.weight || order.approxWeight || 3.5} kg
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <Badge status={order.status} showDot size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        {isCollected ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <Check className="w-3.5 h-3.5" />
                            Collected
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenCollectionModal(order)}
                            className="text-xs font-bold shadow-purple"
                          >
                            Mark Collected
                          </Button>
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
      {/* MODAL: RECORD ACTUAL COUNT, WEIGHT & CONFIRM PICKUP  */}
      {/* ==================================================== */}
      {orderToCollect && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => !collectionSuccess && setOrderToCollect(null)}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#211747]">
                    Confirm Clothes Pickup #{orderToCollect.id}
                  </h3>
                  <p className="text-xs text-[#6B6780]">
                    Record actual verified weight and items from student
                  </p>
                </div>
                {!collectionSuccess && (
                  <button
                    type="button"
                    onClick={() => setOrderToCollect(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {collectionSuccess ? (
                <div className="text-center py-6 space-y-2 animate-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <Check className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <h4 className="text-base font-bold text-[#211747]">
                    Pickup Confirmed & Verified!
                  </h4>
                  <p className="text-xs text-[#6B6780]">
                    Order #{orderToCollect.id} marked as Clothes Picked Up. Tracking updated.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmCollection} className="space-y-4">
                  {/* Student summary */}
                  <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#6B6780]">Student:</span>
                      <span className="font-bold text-[#211747]">
                        {orderToCollect.studentName || orderToCollect.student} ({orderToCollect.studentRegNo || "LPU12345678"})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B6780]">Pickup Room:</span>
                      <span className="font-bold text-[#211747]">
                        {orderToCollect.hostel ? `${orderToCollect.hostel}, ` : ""}
                        {orderToCollect.roomBlock || "B-32 / 210"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B6780]">Delivery Destination:</span>
                      <span className="font-bold text-emerald-700">
                        Same Room ({orderToCollect.hostel ? `${orderToCollect.hostel}, ` : ""}{orderToCollect.roomBlock || "B-32 / 210"})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B6780]">Resident Phone:</span>
                      <a
                        href={`tel:${orderToCollect.contactPhone || "+919876543210"}`}
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{orderToCollect.contactPhone || "+91 98765 43210"}</span>
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B6780]">Service Type:</span>
                      <span className="font-bold text-[#6633CC]">{orderToCollect.service}</span>
                    </div>
                    {orderToCollect.runnerNotes && (
                      <div className="pt-1.5 border-t border-[#E5E3F0] text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg">
                        <span className="font-bold">Runner Note:</span> {orderToCollect.runnerNotes}
                      </div>
                    )}
                  </div>

                  {/* Actual Count & Weight Input Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560] flex items-center gap-1">
                        <Shirt className="w-3.5 h-3.5 text-[#6633CC]" />
                        <span>Actual Clothes (pcs) *</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={actualCount}
                        onChange={(e) => setActualCount(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm font-bold text-[#211747] rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-[#6633CC] outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560] flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-[#6633CC]" />
                        <span>Scale Weight (kg) *</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="50"
                        required
                        value={actualWeight}
                        onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm font-bold text-[#211747] rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-[#6633CC] outline-none"
                      />
                    </div>
                  </div>

                  {/* Pickup Remarks */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                      Pickup Telemetry Remarks
                    </label>
                    <textarea
                      rows={2}
                      value={collectionRemarks}
                      onChange={(e) => setCollectionRemarks(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-[#6633CC] outline-none resize-none"
                      placeholder="E.g. Verified 6 garments in green mesh bag..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => setOrderToCollect(null)}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      Confirm Pickup
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

