"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Sparkles,
  Calendar,
  X,
  Building2,
  User,
  Scale,
  Shirt,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ClientPortal from "@/components/common/ClientPortal";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useAuth } from "@/context/AuthContext";

export default function StaffAssignedOrdersPage() {
  const { user } = useAuth();
  const { orders, updateOrderStatus, rejectOrderByStaff } = useLaundryOrders();

  // Search, Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, clothes-high, weight-high
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [orderToView, setOrderToView] = useState(null);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("In Washing");
  const [updateRemarks, setUpdateRemarks] = useState("");
  const [orderToReject, setOrderToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Base list of orders assigned to staff or within the hub
  const assignedOrders = useMemo(() => {
    return orders.filter((o) => {
      // Include all orders assigned to current staff or in operational lifecycle
      return (
        !o.status.includes("Cancelled") &&
        (o.assignedStaff?.staffId === user?.staffId ||
          !o.assignedStaff ||
          ["Request Accepted", "Clothes Picked Up", "In Washing", "In Drying", "Ironing", "Ready for Delivery"].includes(o.status))
      );
    });
  }, [orders, user?.staffId]);

  // Extract unique pickup dates for the date filter
  const pickupDates = useMemo(() => {
    const dates = new Set();
    assignedOrders.forEach((o) => {
      if (o.pickupDate) dates.add(o.pickupDate);
      else if (o.date) dates.add(o.date);
    });
    return Array.from(dates);
  }, [assignedOrders]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    return assignedOrders.filter((order) => {
      const idMatch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const studentMatch = (order.studentName || order.student || "").toLowerCase().includes(searchTerm.toLowerCase());
      const regMatch = (order.studentRegNo || "").toLowerCase().includes(searchTerm.toLowerCase());
      const roomMatch = (order.roomBlock || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = idMatch || studentMatch || regMatch || roomMatch;

      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = order.status === statusFilter;
      }

      let matchesDate = true;
      if (dateFilter !== "all") {
        matchesDate = (order.pickupDate || order.date) === dateFilter;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [assignedOrders, searchTerm, statusFilter, dateFilter]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      if (sortBy === "oldest") return a.id.localeCompare(b.id);
      if (sortBy === "clothes-high") return (b.itemsCount || 0) - (a.itemsCount || 0);
      if (sortBy === "weight-high") {
        const wA = parseFloat(a.weight || a.approxWeight || 0);
        const wB = parseFloat(b.weight || b.approxWeight || 0);
        return wB - wA;
      }
      return b.id.localeCompare(a.id); // default newest
    });
  }, [filteredOrders, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(start, start + itemsPerPage);
  }, [sortedOrders, currentPage, itemsPerPage]);

  // Handlers
  const handleOpenUpdate = (order) => {
    setOrderToUpdate(order);
    setNewStatus(order.status || "In Washing");
    setUpdateRemarks(`Updated status for order #${order.id} during hub processing.`);
  };

  const handleSaveStatus = (e) => {
    e.preventDefault();
    if (orderToUpdate) {
      updateOrderStatus(orderToUpdate.id, newStatus, updateRemarks);
      setOrderToUpdate(null);
    }
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (orderToReject) {
      rejectOrderByStaff(orderToReject.id, rejectionReason || "Rejected due to hub operational limits.");
      setOrderToReject(null);
      setRejectionReason("");
    }
  };

  const handleQuickAccept = (orderId) => {
    updateOrderStatus(orderId, "Request Accepted", "Staff accepted order and scheduled runner pickup.");
  };

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Top Action & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by Request ID, Student Name, Reg No..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#6B6780]" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white outline-none cursor-pointer hover:border-[#6633CC]"
              >
                <option value="all">All Statuses ({assignedOrders.length})</option>
                <option value="Request Placed">Request Placed</option>
                <option value="Request Accepted">Request Accepted</option>
                <option value="Clothes Picked Up">Clothes Picked Up</option>
                <option value="In Washing">In Washing</option>
                <option value="In Drying">In Drying</option>
                <option value="Ironing">Ironing</option>
                <option value="Ready for Delivery">Ready for Delivery</option>
              </select>
            </div>

            {/* Date Filter */}
            {pickupDates.length > 0 && (
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white outline-none cursor-pointer hover:border-[#6633CC]"
              >
                <option value="all">All Pickup Dates</option>
                {pickupDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Column */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#6B6780]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white outline-none cursor-pointer hover:border-[#6633CC]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="clothes-high">Most Clothes</option>
                <option value="weight-high">Heaviest Load</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Assigned Orders Table Card */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
              <tr>
                <th className="py-3.5 px-5 font-bold">Request ID</th>
                <th className="py-3.5 px-5 font-bold">Student</th>
                <th className="py-3.5 px-5 font-bold">Hostel & Room</th>
                <th className="py-3.5 px-5 font-bold">Service</th>
                <th className="py-3.5 px-5 font-bold text-center">Items</th>
                <th className="py-3.5 px-5 font-bold text-center">Weight</th>
                <th className="py-3.5 px-5 font-bold">Pickup</th>
                <th className="py-3.5 px-5 font-bold">Expected Delivery</th>
                <th className="py-3.5 px-5 font-bold">Status</th>
                <th className="py-3.5 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-[#6B6780]">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-[#6633CC] flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-[#211747] text-sm">No assigned orders found</p>
                    <p className="text-xs text-[#8F8A9E] mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const canAccept = ["Request Placed", "New", "Pending"].includes(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-[#FAF9FD]/80 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-5 font-bold text-[#211747]">
                        <span className="font-mono text-xs">#{order.id}</span>
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-xs text-[#211747]">
                          {order.studentName || order.student || "Student Resident"}
                        </p>
                        <p className="text-[11px] text-[#6B6780]">
                          {order.studentRegNo || "LPU12345678"}
                        </p>
                      </td>

                      {/* Hostel and Room */}
                      <td className="py-3.5 px-5 text-xs text-[#4A4560]">
                        <div className="font-medium text-[#211747]">
                          {order.hostel || "Boys Hostel 3"}
                        </div>
                        <div className="text-[11px] text-[#6B6780]">
                          {order.roomBlock || "B-32 / 210"}
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-semibold text-[#6633CC] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          {order.service}
                        </span>
                      </td>

                      {/* Clothes Count */}
                      <td className="py-3.5 px-5 text-center">
                        <span className="text-xs font-bold text-[#211747]">
                          {order.itemsCount || 0}
                        </span>
                        <span className="text-[10px] text-[#6B6780] block">pcs</span>
                      </td>

                      {/* Weight */}
                      <td className="py-3.5 px-5 text-center">
                        <span className="text-xs font-bold text-[#211747]">
                          {order.weight || order.approxWeight || "3.5"}
                        </span>
                        <span className="text-[10px] text-[#6B6780] block">kg</span>
                      </td>

                      {/* Pickup Date */}
                      <td className="py-3.5 px-5 text-xs text-[#4A4560]">
                        <span className="font-medium">{order.pickupDate || order.date || "Today"}</span>
                        <span className="text-[10px] text-[#8F8A9E] block">{order.pickupTime || "Morning Slot"}</span>
                      </td>

                      {/* Expected Delivery */}
                      <td className="py-3.5 px-5 text-xs text-[#4A4560]">
                        <span className="font-medium">{order.expectedDelivery || "Tomorrow, 6 PM"}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <Badge status={order.status} showDot size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If New: Quick Accept & Reject */}
                          {canAccept && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleQuickAccept(order.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#057A55] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                                title="Accept Request"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => setOrderToReject(order)}
                                className="px-2 py-1 rounded-lg border border-rose-300 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
                                title="Reject Request"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Update Status Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenUpdate(order)}
                            className="px-2.5 py-1 rounded-lg border border-[#6633CC] text-[#6633CC] text-xs font-semibold hover:bg-[#6633CC] hover:text-white transition-all shadow-xs"
                            title="Update Status"
                          >
                            Update
                          </button>

                          {/* View Docket */}
                          <button
                            type="button"
                            onClick={() => setOrderToView(order)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#211747] hover:bg-gray-100 transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 px-6 border-t border-[#F0EDF8] bg-[#FAF9FD] flex items-center justify-between text-xs text-[#6B6780]">
          <div>
            Showing <span className="font-bold text-[#211747]">
              {sortedOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-[#211747]">
              {Math.min(currentPage * itemsPerPage, sortedOrders.length)}
            </span>{" "}
            of <span className="font-bold text-[#211747]">{sortedOrders.length}</span> orders
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[#E5E3F0] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-[#211747]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[#E5E3F0] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: VIEW ORDER DETAILS                          */}
      {/* ==================================================== */}
      {orderToView && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setOrderToView(null)}
            />
            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Order Docket #{orderToView.id}
                  </h3>
                  <p className="text-xs text-[#6B6780]">Assigned Laundry Processing Profile</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderToView(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]">
                  <div>
                    <span className="text-[#6B6780] block text-[11px]">Student</span>
                    <span className="font-bold text-sm text-[#211747]">{orderToView.studentName || orderToView.student}</span>
                    <span className="text-[10px] text-[#8F8A9E] block">{orderToView.studentRegNo || "LPU12345678"}</span>
                  </div>
                  <div>
                    <span className="text-[#6B6780] block text-[11px]">Room & Block</span>
                    <span className="font-bold text-sm text-[#211747]">{orderToView.roomBlock || "B-32 / 210"}</span>
                    <span className="text-[10px] text-[#8F8A9E] block">{orderToView.hostel || "Boys Hostel 3"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-white rounded-xl border border-[#E5E3F0]">
                    <span className="text-[10px] text-[#6B6780] uppercase tracking-wider block">Service</span>
                    <span className="font-bold text-xs text-[#6633CC]">{orderToView.service}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E3F0]">
                    <span className="text-[10px] text-[#6B6780] uppercase tracking-wider block">Clothes</span>
                    <span className="font-bold text-xs text-[#211747]">{orderToView.itemsCount || 0} pcs</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E3F0]">
                    <span className="text-[10px] text-[#6B6780] uppercase tracking-wider block">Weight</span>
                    <span className="font-bold text-xs text-[#211747]">{orderToView.weight || orderToView.approxWeight || "3.5"} kg</span>
                  </div>
                </div>

                {orderToView.clothesBreakdown && (
                  <div className="p-3 bg-white rounded-xl border border-[#E5E3F0] space-y-1.5">
                    <span className="text-[11px] font-bold text-[#211747] block">Garment Breakdown:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(orderToView.clothesBreakdown).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 bg-gray-100 rounded text-[11px] font-medium text-[#4A4560]">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-[#FAF9FD] rounded-xl border border-[#E5E3F0] flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#6B6780] block">Expected Delivery</span>
                    <span className="font-bold text-xs text-[#211747]">{orderToView.expectedDelivery || "Tomorrow, 6 PM"}</span>
                  </div>
                  <div>
                    <Badge status={orderToView.status} showDot size="sm" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setOrderToView(null)}>
                  Close Docket
                </Button>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: UPDATE STATUS MODAL                         */}
      {/* ==================================================== */}
      {orderToUpdate && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setOrderToUpdate(null)}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
                <h3 className="text-lg font-bold text-[#211747]">
                  Update Status #{orderToUpdate.id}
                </h3>
                <button
                  type="button"
                  onClick={() => setOrderToUpdate(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStatus} className="space-y-4">
                <Select
                  label="Target Status"
                  options={[
                    "Request Accepted",
                    "Clothes Picked Up",
                    "In Washing",
                    "In Drying",
                    "Ironing",
                    "Ready for Delivery",
                    "Delivered",
                  ]}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Staff Telemetry Remarks
                  </label>
                  <textarea
                    value={updateRemarks}
                    onChange={(e) => setUpdateRemarks(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-[#6633CC] focus:border-transparent outline-none resize-none"
                    placeholder="Add note for student timeline..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setOrderToUpdate(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Update
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: REJECT ORDER MODAL                          */}
      {/* ==================================================== */}
      {orderToReject && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setOrderToReject(null)}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-4 my-auto">
              <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-[#F0EDF8]">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-[#211747]">
                  Reject Request #{orderToReject.id}
                </h3>
              </div>

              <p className="text-xs text-[#6B6780]">
                Rejecting this request will notify the student and credit any deducted points or wallet balances back immediately.
              </p>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Reason for Rejection *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                    placeholder="E.g. Clothes exceeded maximum weight threshold, restricted garments..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setOrderToReject(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    Confirm Rejection
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
