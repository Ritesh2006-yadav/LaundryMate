"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  X,
  ExternalLink,
  Clock,
  UserCheck,
  Shield,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import ClientPortal from "@/components/common/ClientPortal";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useLaundryOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hostelFilter, setHostelFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignedStaffMap, setAssignedStaffMap] = useState({});
  const [toastMsg, setToastMsg] = useState("");

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.roomBlock?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      o.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesHostel =
      hostelFilter === "all" ||
      (o.roomBlock && o.roomBlock.toLowerCase().includes(hostelFilter.toLowerCase())) ||
      (o.hostel && o.hostel.toLowerCase().includes(hostelFilter.toLowerCase()));

    const matchesService =
      serviceFilter === "all" ||
      (o.service && o.service.toLowerCase().includes(serviceFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesHostel && matchesService;
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleExportCSV = () => {
    const headers = [
      "Order ID",
      "Student Name",
      "Service",
      "Clothes Count",
      "Weight (kg)",
      "Hostel Room",
      "Pickup Date",
      "Status",
      "Amount (INR)",
    ];
    const rows = filtered.map((o) => [
      `"${o.id}"`,
      `"${o.studentName}"`,
      `"${o.service}"`,
      o.itemsCount,
      o.weightKg || 5,
      `"${o.roomBlock || ""}"`,
      `"${o.requestDate || ""}"`,
      `"${o.status}"`,
      o.amount || 200,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `lpu_lms_orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded order master spreadsheet.");
  };

  const handleForceStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus, `Administrator set status to ${newStatus}.`);
    showToast(`Order #${orderId} transitioned to ${newStatus}.`);
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  return (
    <div className="space-y-6 select-none pb-12">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211747] text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Registry Controls & Actions Bar (No Duplicate Heading) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Master Orders Registry
          </span>
          <span className="text-xs text-[#8F8A9E] font-medium">• {orders.length} Total Records</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
          className="shadow-purple self-end sm:self-center"
        >
          Export CSV Spreadsheet
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5E3F0] shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search orders by ID (#LMS1054), Student Name, Service, or Room..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] transition-colors"
            >
              <option value="all">All Hostels (BH/GH)</option>
              <option value="BH-1">BH-1</option>
              <option value="BH-2">BH-2</option>
              <option value="BH-3">BH-3</option>
              <option value="BH-4">BH-4</option>
              <option value="BH-5">BH-5</option>
              <option value="BH-6">BH-6</option>
              <option value="GH-1">GH-1</option>
              <option value="GH-2">GH-2</option>
              <option value="GH-3">GH-3</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] transition-colors"
            >
              <option value="all">All Services</option>
              <option value="Wash & Fold">Wash & Fold</option>
              <option value="Wash & Iron">Wash & Iron</option>
              <option value="Wash Only">Wash Only</option>
              <option value="Wash Dry Iron">Wash Dry Iron</option>
              <option value="Iron Only">Iron Only</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: "all", label: "All Orders" },
            { id: "request placed", label: "Placed" },
            { id: "clothes picked up", label: "Picked Up" },
            { id: "in washing", label: "In Washing" },
            { id: "in drying", label: "In Drying" },
            { id: "ironing", label: "Ironing" },
            { id: "ready for delivery", label: "Ready" },
            { id: "delivered", label: "Delivered" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                statusFilter === st.id
                  ? "bg-[#6633CC] text-white shadow-sm font-bold"
                  : "bg-[#F5F4FA] text-[#6B6780] hover:bg-gray-200/70"
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
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FD] text-[#6B6780] uppercase tracking-wider font-extrabold border-b border-[#F0EDF8]">
              <tr>
                <th className="py-4 px-5">Order ID</th>
                <th className="py-4 px-4">Student</th>
                <th className="py-4 px-4">Service</th>
                <th className="py-4 px-4">Items / Weight</th>
                <th className="py-4 px-4">Hostel / Room</th>
                <th className="py-4 px-4">Intake Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8] text-[#211747]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8F8A9E]">
                    No orders found matching this criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF9FD] transition-colors">
                    <td className="py-4 px-5 font-mono font-extrabold text-sm text-[#6633CC]">
                      #{order.id}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-sm text-[#211747] block">
                        {order.studentName}
                      </span>
                      <span className="text-[10px] text-[#8F8A9E]">
                        {order.studentRegNo || "LPU Student"}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#4A4560]">
                      {order.service}
                    </td>
                    <td className="py-4 px-4">
                      {order.itemsCount} clothes ({order.weightKg || 5} kg)
                    </td>
                    <td className="py-4 px-4 text-[#6B6780]">
                      {order.roomBlock || "BH-3 / 210"}
                    </td>
                    <td className="py-4 px-4 text-[#8F8A9E]">
                      {order.requestDate}
                    </td>
                    <td className="py-4 px-4">
                      <Badge status={order.status} showDot />
                    </td>
                    <td className="py-4 px-4 font-bold text-[#211747]">
                      ₹{order.amount || 200}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs py-1 px-2.5"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                        <Link href={`/student/track-order/${order.id}`}>
                          <button
                            title="Live Tracking View"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#6633CC]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div
              className="fixed inset-0"
              onClick={() => setSelectedOrder(null)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    Order Master Record
                  </span>
                  <h3 className="text-xl font-extrabold text-[#211747]">
                    Order #{selectedOrder.id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Student:</span>
                  <span className="font-bold text-[#211747]">{selectedOrder.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Hostel & Room:</span>
                  <span className="font-semibold text-[#211747]">{selectedOrder.roomBlock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Service Type:</span>
                  <span className="font-bold text-[#6633CC]">{selectedOrder.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Clothes Manifest:</span>
                  <span className="font-semibold text-[#211747]">
                    {selectedOrder.itemsCount} items ({selectedOrder.weightKg || 5} kg)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Current Stage:</span>
                  <Badge status={selectedOrder.status} showDot />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Total Tariff:</span>
                  <span className="font-extrabold text-[#211747]">₹{selectedOrder.amount || 200}</span>
                </div>
              </div>

              {/* Admin Override Stage */}
              <div className="space-y-2 text-xs">
                <label className="font-bold text-[#4A4560]">
                  Admin Force Status Transition:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Request Accepted",
                    "Clothes Picked Up",
                    "In Washing",
                    "In Drying",
                    "Ironing",
                    "Ready for Delivery",
                    "Delivered",
                    "Cancelled",
                  ].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleForceStatus(selectedOrder.id, st)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        selectedOrder.status === st
                          ? "bg-[#6633CC] text-white border-[#6633CC]"
                          : "bg-white hover:bg-gray-50 border-[#E5E3F0] text-[#211747]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#F0EDF8]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
