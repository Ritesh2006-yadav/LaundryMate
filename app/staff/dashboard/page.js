"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  ArrowLeft,
  X,
  Search,
  Filter,
  UserCheck,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  Check,
  Ban,
  Phone,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCw,
  PackageCheck,
  Calendar,
  Building2,
  Zap,
  TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ClientPortal from "@/components/common/ClientPortal";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useComplaints } from "@/hooks/useComplaints";
import { useInventory } from "@/hooks/useInventory";
import { useAuth } from "@/context/AuthContext";

const STAFF_ROSTER = [
  {
    name: "Rohit Kumar",
    staffId: "STF-8821",
    phone: "+91 98111 22334",
    role: "Laundry Hub Runner & Operator",
    hub: "Central Laundry Complex - North Wing",
  },
  {
    name: "Suresh Pal",
    staffId: "STF-8819",
    phone: "+91 98222 33445",
    role: "Senior Steam Press Operator",
    hub: "Central Laundry Complex - Steam Unit",
  },
  {
    name: "Deepak Verma",
    staffId: "STF-8835",
    phone: "+91 98333 44556",
    role: "Hostel Collection Runner",
    hub: "Boys Hostel Hub 3",
  },
  {
    name: "Kiran Bala",
    staffId: "STF-8840",
    phone: "+91 98444 55667",
    role: "Garment Sorting Specialist",
    hub: "Girls Hostel Hub 2",
  },
];

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const { orders, updateOrderStatus, assignStaffToOrder, rejectOrderByStaff } = useLaundryOrders();
  const { complaints } = useComplaints();
  const { getLowStockItems } = useInventory();
  const lowStockItems = getLowStockItems ? getLowStockItems() : [];

  // Filters, Search & Sorting
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'clothes-high'

  // Modal 1: Update Order Status (Screen 10)
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [targetStatus, setTargetStatus] = useState("In Washing");
  const [statusRemarks, setStatusRemarks] = useState("Clothes are now in the washing process.");

  // Modal 2: Assign Staff Runner
  const [orderToAssign, setOrderToAssign] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState("STF-8821");

  // Modal 3: Reject Order with Reason
  const [orderToReject, setOrderToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Modal 4: View Order Details
  const [orderToView, setOrderToView] = useState(null);

  // ----------------------------------------------------
  // 6 DASHBOARD METRICS CALCULATION (Strict Part 4 Match)
  // ----------------------------------------------------
  const totalAssignedOrders = orders.filter((o) =>
    !["Cancelled", "Rejected"].includes(o.status)
  ).length;

  const pendingPickups = orders.filter((o) =>
    ["Request Placed", "New", "Pending", "Request Accepted"].includes(o.status)
  ).length;

  const ordersInWashing = orders.filter((o) =>
    ["In Washing", "In Process"].includes(o.status)
  ).length;

  const ordersInDrying = orders.filter((o) =>
    o.status === "In Drying"
  ).length;

  const readyForDeliveryCount = orders.filter((o) =>
    o.status === "Ready for Delivery"
  ).length;

  const completedTodayCount = orders.filter((o) =>
    ["Delivered", "Completed"].includes(o.status)
  ).length;

  const deliveredTodayCount = completedTodayCount;
  const newRequestsCount = pendingPickups;
  const inProgressCount = ordersInWashing + ordersInDrying;

  const urgentPickups = orders
    .filter((o) => ["Request Placed", "New", "Pending"].includes(o.status))
    .slice(0, 3);

  const attentionOrders = orders
    .filter((o) => ["In Washing", "Clothes Picked Up"].includes(o.status))
    .slice(0, 3);

  // ----------------------------------------------------
  // FILTERING AND SORTING
  // ----------------------------------------------------
  const filteredOrders = orders.filter((order) => {
    const studentName = order.studentName || order.student || "";
    const regNo = order.studentRegNo || "";
    const room = order.roomBlock || "";
    const id = order.id || "";
    const service = order.service || "";

    const matchesSearch =
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTab = true;
    if (activeTab === "new") {
      matchesTab = ["Request Placed", "New", "Pending"].includes(order.status);
    } else if (activeTab === "assigned") {
      matchesTab = ["Request Accepted", "Clothes Picked Up", "Picked Up"].includes(order.status);
    } else if (activeTab === "process") {
      matchesTab = ["In Washing", "In Process", "In Progress", "In Drying", "Ironing"].includes(order.status);
    } else if (activeTab === "ready") {
      matchesTab = ["Ready for Delivery"].includes(order.status);
    } else if (activeTab === "delivered") {
      matchesTab = ["Delivered", "Completed"].includes(order.status);
    } else if (activeTab === "rejected") {
      matchesTab = ["Rejected", "Cancelled"].includes(order.status);
    }

    return matchesSearch && matchesTab;
  });

  // Sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "oldest") {
      return a.id.localeCompare(b.id);
    }
    if (sortBy === "clothes-high") {
      return (b.itemsCount || 0) - (a.itemsCount || 0);
    }
    // Default newest
    return b.id.localeCompare(a.id);
  });

  // Quick Action Handlers for the 10 Staff Capabilities
  const handleOpenStatusModal = (order) => {
    setSelectedOrderForStatus(order);
    setTargetStatus(order.status || "In Washing");
    setStatusRemarks("Clothes are now in the washing process.");
  };

  const handleSaveStatusUpdate = (e) => {
    e.preventDefault();
    if (selectedOrderForStatus) {
      updateOrderStatus(selectedOrderForStatus.id, targetStatus, statusRemarks);
      setSelectedOrderForStatus(null);
    }
  };

  const handleQuickAccept = (order) => {
    updateOrderStatus(order.id, "Request Accepted", "Staff accepted order and scheduled runner pickup.");
  };

  const handleQuickPickedUp = (order) => {
    updateOrderStatus(order.id, "Clothes Picked Up", "Clothes collected from student hostel room.");
  };

  const handleQuickReady = (order) => {
    updateOrderStatus(order.id, "Ready for Delivery", "Packaged in fresh seal, assigned to runner.");
  };

  const handleQuickDelivered = (order) => {
    updateOrderStatus(order.id, "Delivered", "Delivered safely to student room.");
  };

  const handleConfirmAssignment = (e) => {
    e.preventDefault();
    if (!orderToAssign) return;

    const staffObj = STAFF_ROSTER.find((s) => s.staffId === selectedStaffId) || STAFF_ROSTER[0];
    assignStaffToOrder(orderToAssign.id, staffObj);
    updateOrderStatus(
      orderToAssign.id,
      "Request Accepted",
      `Assigned to runner ${staffObj.name} (${staffObj.staffId}).`
    );
    setOrderToAssign(null);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!orderToReject) return;

    rejectOrderByStaff(
      orderToReject.id,
      rejectionReason || "Order cannot be processed due to hostel laundry policy."
    );
    setOrderToReject(null);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6 select-none pb-8">
      {/* 1. Welcome Message with Staff Name & Shift Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#211747] via-[#2A1D59] to-[#3B257E] rounded-3xl p-6 text-white shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F58220] text-white text-[11px] font-black uppercase tracking-wider">
              Shift Active
            </span>
            <span className="text-xs text-white/70">
              STF-8821 • Central Complex North Wing
            </span>
          </div>
          <h2 className="text-2xl font-bold">
            Welcome back, {(user?.role === "staff" ? user?.name?.split(" ")[0] : "Rohit")}! 👋
          </h2>
          <p className="text-xs text-white/80">
            {totalAssignedOrders} active orders assigned • {pendingPickups} pickups scheduled • Plant operating at 94% efficiency
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/staff/pickups">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Clock className="w-4 h-4 text-[#F58220]" />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
            >
              Pickups ({pendingPickups})
            </Button>
          </Link>
          <Link href="/staff/process">
            <Button
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="bg-[#F58220] hover:bg-[#e07519] text-white text-xs font-bold shadow-orange"
            >
              Process Laundry
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Today's Work Summary Banner */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#4A4560]">
            <Building2 className="w-4 h-4 text-[#6633CC]" />
            <span className="font-semibold text-[#211747]">Zone:</span> Boys Hostels BH-1 to BH-5 & GH-2
          </div>
          <div className="flex items-center gap-2 text-[#4A4560]">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-[#211747]">Shift:</span> 07:00 AM - 04:00 PM (Morning Slot)
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All plant wash units connected & reporting</span>
        </div>
      </div>

      {/* 8. Quick Actions Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Link href="/staff/pickups" className="flex-shrink-0">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E3F0] hover:border-[#6633CC] text-xs font-bold text-[#211747] hover:bg-[#FAF9FD] transition-all shadow-xs cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#F58220]" />
            <span>Record Pickup</span>
          </button>
        </Link>
        <Link href="/staff/process" className="flex-shrink-0">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E3F0] hover:border-[#6633CC] text-xs font-bold text-[#211747] hover:bg-[#FAF9FD] transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Process Laundry</span>
          </button>
        </Link>
        <Link href="/staff/delivery" className="flex-shrink-0">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E3F0] hover:border-[#6633CC] text-xs font-bold text-[#211747] hover:bg-[#FAF9FD] transition-all shadow-xs cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-cyan-600" />
            <span>Ready Dispatch</span>
          </button>
        </Link>
        <Link href="/staff/assigned" className="flex-shrink-0">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E3F0] hover:border-[#6633CC] text-xs font-bold text-[#211747] hover:bg-[#FAF9FD] transition-all shadow-xs cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#6633CC]" />
            <span>Assigned Orders</span>
          </button>
        </Link>
        <Link href="/staff/complaints" className="flex-shrink-0">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E3F0] hover:border-rose-300 text-xs font-bold text-[#211747] hover:bg-rose-50/50 transition-all shadow-xs cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Complaints Desk ({complaints.length})</span>
          </button>
        </Link>
      </div>

      {/* 6 Core Dashboard Statistics Cards (Exact Part 4 Requirements) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Total Assigned Orders */}
        <div
          onClick={() => setActiveTab("all")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-card hover:-translate-y-0.5 ${
            activeTab === "all" ? "border-[#6633CC] ring-2 ring-[#6633CC]/20" : "border-[#E5E3F0]"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6633CC] flex items-center justify-center font-bold mb-2">
            <UserCheck className="w-5 h-5 text-[#6633CC]" />
          </div>
          <span className="text-2xl font-black text-[#211747] leading-none block">
            {totalAssignedOrders}
          </span>
          <p className="text-[11px] text-[#6B6780] font-semibold mt-1">Total Assigned</p>
        </div>

        {/* 2. Pending Pickups */}
        <Link href="/staff/pickups" className="block">
          <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] transition-all hover:border-amber-300 hover:shadow-card hover:-translate-y-0.5 h-full">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-2xl font-black text-amber-600 leading-none block">
              {pendingPickups}
            </span>
            <p className="text-[11px] text-[#6B6780] font-semibold mt-1">Pending Pickups</p>
          </div>
        </Link>

        {/* 3. Orders In Washing */}
        <div
          onClick={() => setActiveTab("process")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-card hover:-translate-y-0.5 ${
            activeTab === "process" ? "border-[#6633CC] ring-2 ring-[#6633CC]/20" : "border-[#E5E3F0]"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-blue-600 leading-none block">
            {ordersInWashing}
          </span>
          <p className="text-[11px] text-[#6B6780] font-semibold mt-1">In Washing</p>
        </div>

        {/* 4. Orders In Drying */}
        <div
          onClick={() => setActiveTab("process")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-card hover:-translate-y-0.5 border-[#E5E3F0]`}
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F58220] flex items-center justify-center font-bold mb-2">
            <RotateCw className="w-5 h-5 text-[#F58220]" />
          </div>
          <span className="text-2xl font-black text-[#F58220] leading-none block">
            {ordersInDrying}
          </span>
          <p className="text-[11px] text-[#6B6780] font-semibold mt-1">In Drying</p>
        </div>

        {/* 5. Ready for Delivery */}
        <Link href="/staff/delivery" className="block">
          <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] transition-all hover:border-emerald-300 hover:shadow-card hover:-translate-y-0.5 h-full">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-emerald-600 leading-none block">
              {readyForDeliveryCount}
            </span>
            <p className="text-[11px] text-[#6B6780] font-semibold mt-1">Ready for Delivery</p>
          </div>
        </Link>

        {/* 6. Completed Today */}
        <div
          onClick={() => setActiveTab("completed")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-card hover:-translate-y-0.5 ${
            activeTab === "completed" ? "border-[#6633CC] ring-2 ring-[#6633CC]/20" : "border-[#E5E3F0]"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold mb-2">
            <CheckCircle2 className="w-5 h-5 text-cyan-600" />
          </div>
          <span className="text-2xl font-black text-[#211747] leading-none block">
            {completedTodayCount}
          </span>
          <p className="text-[11px] text-[#6B6780] font-semibold mt-1">Completed Today</p>
        </div>
      </div>

      {/* 4 & 5. Urgent Pickup Requests & Orders Requiring Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Urgent Pickup Requests */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E3F0] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#211747]">Urgent Pickup Requests</h3>
                <p className="text-[11px] text-[#6B6780]">Pending doorstep student collections</p>
              </div>
            </div>
            <Link href="/staff/pickups" className="text-xs font-bold text-[#6633CC] hover:underline">
              View All ({pendingPickups}) →
            </Link>
          </div>

          <div className="space-y-2.5">
            {urgentPickups.length === 0 ? (
              <p className="text-xs text-[#8F8A9E] py-4 text-center">No urgent pickups waiting.</p>
            ) : (
              urgentPickups.map((order) => (
                <div
                  key={order.id}
                  className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#211747]">#{order.id}</span>
                      <span className="font-semibold text-[#211747]">{order.studentName || order.student}</span>
                    </div>
                    <span className="text-[11px] text-[#6B6780] block">
                      {order.roomBlock || "B-32 / 210"} • Slot: {order.pickupTime || "Morning 09:00 AM"}
                    </span>
                  </div>
                  <Link href={`/staff/pickups`}>
                    <Button variant="secondary" size="sm" className="text-xs font-bold">
                      Collect
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orders Requiring Attention */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E3F0] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#211747]">Orders Requiring Attention</h3>
                <p className="text-[11px] text-[#6B6780]">Wash cycle transitions & open dispute tickets</p>
              </div>
            </div>
            <Link href="/staff/complaints" className="text-xs font-bold text-[#6633CC] hover:underline">
              Complaints ({complaints.length}) →
            </Link>
          </div>

          <div className="space-y-2.5">
            {attentionOrders.map((order) => (
              <div
                key={order.id}
                className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#211747]">#{order.id}</span>
                    <Badge status={order.status} showDot size="sm" />
                  </div>
                  <span className="text-[11px] text-[#6B6780] block mt-0.5">
                    {order.service} • {order.itemsCount || 0} items • Ready for next cycle
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenStatusModal(order)}
                  className="px-3 py-1.5 rounded-xl border border-[#6633CC] text-[#6633CC] hover:bg-[#6633CC] hover:text-white text-xs font-bold transition-all"
                >
                  Update
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low-Stock Dashboard Notification Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-300 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs sm:text-sm text-amber-950">
                Plant Inventory Notice: {lowStockItems.length} materials reached safety threshold
              </p>
              <p className="text-[11px] text-amber-800 line-clamp-1">
                {lowStockItems.map((it) => `${it.name} (${it.currentStock} ${it.unit})`).join(" • ")}
              </p>
            </div>
          </div>
          <Link href="/staff/inventory" className="flex-shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold whitespace-nowrap"
            >
              Manage Inventory →
            </Button>
          </Link>
        </div>
      )}

      {/* Main Request Management Table Card (Matches Screen 9) */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        {/* Tabs Bar matching Screen 9 */}
        <div className="p-4 sm:p-6 pb-4 flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#F0EDF8] gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              All Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "new"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              Laundry Requests ({newRequestsCount})
            </button>

            <button
              onClick={() => setActiveTab("process")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "process"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              In Process ({inProgressCount})
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "completed"
                  ? "bg-[#6633CC] text-white shadow-purple"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              Completed ({readyForDeliveryCount + deliveredTodayCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6B6780] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white outline-none cursor-pointer hover:border-[#6633CC]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="clothes-high">Most Clothes</option>
              </select>
            </div>

            <Link
              href="/staff/requests"
              className="text-xs font-bold text-[#6633CC] hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:px-6 bg-[#FAF9FD] border-b border-[#F0EDF8]">
          <Input
            placeholder="Search by Request ID, Student Name, Reg No, Room, or Service..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Request Management Table: Exactly 10 Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Request ID</th>
                <th className="py-3.5 px-4 font-bold">Student Name</th>
                <th className="py-3.5 px-4 font-bold">Reg. Number</th>
                <th className="py-3.5 px-4 font-bold">Hostel Block</th>
                <th className="py-3.5 px-4 font-bold">Room No.</th>
                <th className="py-3.5 px-4 font-bold">Service</th>
                <th className="py-3.5 px-4 font-bold">Clothes</th>
                <th className="py-3.5 px-4 font-bold">Request Date</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8]">
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#6B6780] text-sm">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                sortedOrders.map((order) => {
                  const isNew = ["Request Placed", "New", "Pending"].includes(order.status);
                  const isAccepted = order.status === "Request Accepted";
                  const isPickedUp = ["Clothes Picked Up", "Picked Up"].includes(order.status);
                  const isInProcess = ["In Washing", "In Process", "In Drying", "Ironing", "In Progress"].includes(order.status);
                  const isReady = order.status === "Ready for Delivery";
                  const isDelivered = ["Delivered", "Completed"].includes(order.status);

                  // Extract room number and block cleanly
                  const roomBlockParts = (order.roomBlock || "B-32 / 210").split("/");
                  const blockStr = roomBlockParts[0]?.trim() || "Block B";
                  const roomStr = roomBlockParts[1]?.trim() || "210";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FAF9FD]/80 transition-colors"
                    >
                      {/* 1. Request ID */}
                      <td className="py-4 px-4 font-bold text-[#211747] whitespace-nowrap">
                        #{order.id}
                      </td>

                      {/* 2. Student Name */}
                      <td className="py-4 px-4 font-semibold text-[#211747] whitespace-nowrap">
                        {order.studentName || order.student || "Priya Sharma"}
                      </td>

                      {/* 3. Registration Number */}
                      <td className="py-4 px-4 text-xs font-medium text-[#6B6780] whitespace-nowrap">
                        {order.studentRegNo || "LPU11928374"}
                      </td>

                      {/* 4. Hostel Block */}
                      <td className="py-4 px-4 text-xs text-[#4A4560] whitespace-nowrap">
                        {order.hostel ? order.hostel.split("(")[0].trim() : blockStr}
                      </td>

                      {/* 5. Room Number */}
                      <td className="py-4 px-4 text-xs font-semibold text-[#211747] whitespace-nowrap">
                        {roomStr}
                      </td>

                      {/* 6. Service */}
                      <td className="py-4 px-4 text-xs font-medium text-[#4A4560] whitespace-nowrap">
                        {order.service}
                      </td>

                      {/* 7. Number of Clothes */}
                      <td className="py-4 px-4 text-xs text-[#6B6780] whitespace-nowrap">
                        <span className="font-semibold text-[#211747]">
                          {order.itemsCount || order.items || 0}
                        </span>{" "}
                        clothes
                      </td>

                      {/* 8. Request Date */}
                      <td className="py-4 px-4 text-xs text-[#6B6780] whitespace-nowrap">
                        {order.requestDate}
                      </td>

                      {/* 9. Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge status={order.status} showDot />
                      </td>

                      {/* 10. Actions (The 10 Staff Capabilities) */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If New: Show Accept / Reject / Assign */}
                          {isNew && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleQuickAccept(order)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                                title="Accept Request"
                              >
                                Accept
                              </button>

                              <button
                                type="button"
                                onClick={() => setOrderToAssign(order)}
                                className="px-2.5 py-1 rounded-lg border border-[#D3CEE8] text-[#6633CC] text-xs font-semibold hover:bg-purple-50 transition-colors"
                                title="Assign to Staff Runner"
                              >
                                Assign
                              </button>

                              <button
                                type="button"
                                onClick={() => setOrderToReject(order)}
                                className="px-2 py-1 rounded-lg border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
                                title="Reject Request"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* If Accepted: Mark Picked Up */}
                          {isAccepted && (
                            <button
                              type="button"
                              onClick={() => handleQuickPickedUp(order)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                              Mark Picked Up
                            </button>
                          )}

                          {/* If Picked Up: Start Washing */}
                          {isPickedUp && (
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(order.id, "In Washing", "Clothes loaded in washer.")
                              }
                              className="px-3 py-1 rounded-lg bg-[#6633CC] text-white text-xs font-semibold hover:bg-[#5225a8] transition-colors shadow-sm"
                            >
                              Start Washing
                            </button>
                          )}

                          {/* If In Process: Update Status / Ready */}
                          {isInProcess && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(order)}
                                className="px-3 py-1 rounded-lg border border-[#6633CC] text-[#6633CC] text-xs font-semibold hover:bg-[#6633CC] hover:text-white transition-all shadow-sm"
                              >
                                Update
                              </button>

                              <button
                                type="button"
                                onClick={() => handleQuickReady(order)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                                title="Mark Ready for Delivery"
                              >
                                Ready
                              </button>
                            </>
                          )}

                          {/* If Ready: Confirm Delivery */}
                          {isReady && (
                            <button
                              type="button"
                              onClick={() => handleQuickDelivered(order)}
                              className="px-3 py-1 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-700 transition-colors shadow-sm"
                            >
                              Confirm Delivery
                            </button>
                          )}

                          {/* View details action */}
                          <button
                            type="button"
                            onClick={() => setOrderToView(order)}
                            className="p-1 rounded-lg text-gray-400 hover:text-[#211747] hover:bg-gray-100 transition-colors"
                            title="View Full Docket"
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
      </div>

      {/* 6 & 7. Recent Activity & Weekly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 6. Recent Activity Telemetry */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E3F0] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#211747]">Recent Plant Activity</h3>
              <p className="text-[11px] text-[#6B6780]">Live staff telemetry & wash cycle logs</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                time: "10 mins ago",
                title: "Clothes Picked Up • #LMS1054",
                desc: "Runner Suresh Pal collected 6 items from GH-3 Room 210.",
                icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
                bg: "bg-amber-50",
              },
              {
                time: "25 mins ago",
                title: "Washing Cycle Finished • #LMS1050",
                desc: "Hygiene wash with anti-bacterial rinse completed on Washer Unit 3.",
                icon: <Sparkles className="w-3.5 h-3.5 text-blue-600" />,
                bg: "bg-blue-50",
              },
              {
                time: "1 hour ago",
                title: "Quality Check Passed • #LMS1048",
                desc: "Passed steam press and lint inspection. Handed to packaging team.",
                icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
                bg: "bg-emerald-50",
              },
              {
                time: "2 hours ago",
                title: "Doorstep Handover • #LMS1045",
                desc: "Delivered safely to student in BH-2 Room 402 with verification receipt.",
                icon: <Truck className="w-3.5 h-3.5 text-cyan-600" />,
                bg: "bg-cyan-50",
              },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]/60 text-xs">
                <div className={`w-8 h-8 rounded-xl ${activity.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {activity.icon}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#211747] truncate">{activity.title}</p>
                    <span className="text-[10px] text-[#8F8A9E] flex-shrink-0">{activity.time}</span>
                  </div>
                  <p className="text-[11px] text-[#6B6780] line-clamp-1">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Weekly Performance */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E3F0] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#211747]">Weekly Hub Performance</h3>
              <p className="text-[11px] text-[#6B6780]">Service quality metrics & operational SLA</p>
            </div>
            <span className="text-xs font-bold text-[#6633CC] bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100">
              Week 45 • Grade A+
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] space-y-1">
              <span className="text-[10px] text-[#6B6780] uppercase tracking-wider font-semibold block">
                On-Time Pickup SLA
              </span>
              <p className="text-xl font-black text-emerald-600">99.2%</p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "99.2%" }} />
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] space-y-1">
              <span className="text-[10px] text-[#6B6780] uppercase tracking-wider font-semibold block">
                Wash Quality Score
              </span>
              <p className="text-xl font-black text-[#6633CC]">98.7%</p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-[#6633CC] h-full rounded-full" style={{ width: "98.7%" }} />
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] space-y-1">
              <span className="text-[10px] text-[#6B6780] uppercase tracking-wider font-semibold block">
                Avg. Processing Time
              </span>
              <p className="text-xl font-black text-[#211747]">21.4 hrs</p>
              <span className="text-[10px] text-emerald-600 font-semibold">2.6 hrs faster than SLA target</span>
            </div>

            <div className="p-3.5 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] space-y-1">
              <span className="text-[10px] text-[#6B6780] uppercase tracking-wider font-semibold block">
                Student Satisfaction
              </span>
              <p className="text-xl font-black text-[#F58220]">4.91 / 5.0</p>
              <span className="text-[10px] text-[#6B6780]">Based on 342 resident ratings</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: UPDATE ORDER STATUS (Screen 10 UI Match)    */}
      {/* ==================================================== */}
      {selectedOrderForStatus && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setSelectedOrderForStatus(null)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-5 my-auto">
              {/* Header with back arrow matching Screen 10 */}
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForStatus(null)}
                    className="p-1 -ml-1 text-[#6B6780] hover:text-[#211747]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Update Order Status
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForStatus(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order details header matching Screen 10 */}
              <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Request ID:</span>
                  <span className="font-bold text-[#211747]">
                    #{selectedOrderForStatus.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Student:</span>
                  <span className="font-bold text-[#211747]">
                    {selectedOrderForStatus.studentName || selectedOrderForStatus.student || "Priya Sharma"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Service:</span>
                  <span className="font-bold text-[#6633CC]">
                    {selectedOrderForStatus.service}
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-[#E5E3F0]">
                  <span className="text-[#6B6780]">Room / Block:</span>
                  <span className="font-semibold text-[#211747]">
                    {selectedOrderForStatus.hostel ? `${selectedOrderForStatus.hostel}, ` : ""}
                    {selectedOrderForStatus.roomBlock || "B-32 / 210"}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveStatusUpdate} className="space-y-4">
                <Select
                  label="Update Status"
                  options={[
                    "Request Accepted",
                    "Clothes Picked Up",
                    "In Washing",
                    "In Drying",
                    "Ironing",
                    "Ready for Delivery",
                    "Delivered",
                  ]}
                  value={targetStatus}
                  onChange={(e) => {
                    setTargetStatus(e.target.value);
                    if (e.target.value === "In Washing") setStatusRemarks("Clothes are now in the washing process.");
                    else if (e.target.value === "In Drying") setStatusRemarks("Clothes are in the automated tumble drying cycle.");
                    else if (e.target.value === "Ironing") setStatusRemarks("Garments being steam pressed and folded.");
                    else if (e.target.value === "Ready for Delivery") setStatusRemarks("Packaged in protective cover, assigned to runner.");
                    else if (e.target.value === "Delivered") setStatusRemarks("Delivered to student hostel room.");
                    else if (e.target.value === "Clothes Picked Up") setStatusRemarks("Clothes collected from student hostel room.");
                  }}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Remarks (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    className="w-full rounded-2xl border border-[#E5E3F0] p-3 text-sm text-[#1A162B] focus:border-[#6633CC] focus:ring-4 focus:ring-[#6633CC]/10 outline-none transition-all resize-none"
                    placeholder="Clothes are now in the washing process."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EDF8]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedOrderForStatus(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" className="shadow-purple">
                    Update Status
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: ASSIGN STAFF RUNNER                         */}
      {/* ==================================================== */}
      {orderToAssign && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setOrderToAssign(null)}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    Dispatch Logistics
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Assign Runner to #{orderToAssign.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderToAssign(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmAssignment} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Select Available Hub Staff
                  </label>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {STAFF_ROSTER.map((staff) => (
                      <label
                        key={staff.staffId}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedStaffId === staff.staffId
                            ? "border-[#6633CC] bg-[#6633CC]/5 ring-2 ring-[#6633CC]/20"
                            : "border-[#E5E3F0] hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="staffSelection"
                            value={staff.staffId}
                            checked={selectedStaffId === staff.staffId}
                            onChange={(e) => setSelectedStaffId(e.target.value)}
                            className="w-4 h-4 text-[#6633CC] focus:ring-[#6633CC]"
                          />
                          <div>
                            <p className="font-bold text-xs text-[#211747]">
                              {staff.name} ({staff.staffId})
                            </p>
                            <p className="text-[10px] text-[#6B6780]">
                              {staff.hub}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOrderToAssign(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Confirm Assignment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: REJECT ORDER WITH REASON                    */}
      {/* ==================================================== */}
      {orderToReject && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setOrderToReject(null)}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-4 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Ban className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#211747]">
                  Reject Request #{orderToReject.id}
                </h3>
                <p className="text-xs text-[#6B6780] mt-1 leading-relaxed">
                  Provide an administrative reason for rejecting this laundry booking.
                  The student will be notified and any quota deducted will be returned.
                </p>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Rejection Reason
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Unserviceable delicate silk garments, laundry capacity full for current slot..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-rose-500 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOrderToReject(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="danger" size="sm">
                    Reject Order
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: VIEW FULL DOCKET                            */}
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
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    Staff Laundry Docket
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Order #{orderToView.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderToView(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Student Name:</span>
                  <span className="font-bold text-[#211747]">
                    {orderToView.studentName || orderToView.student}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Registration No:</span>
                  <span className="font-semibold text-[#211747]">
                    {orderToView.studentRegNo || "LPU11928374"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Hostel Room:</span>
                  <span className="font-semibold text-[#211747]">
                    {orderToView.hostel || "BH-3"}, {orderToView.roomBlock || "B-32 / 210"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Service Type:</span>
                  <span className="font-bold text-[#6633CC]">{orderToView.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Clothes & Weight:</span>
                  <span className="font-semibold text-[#211747]">
                    {orderToView.itemsCount || 0} pieces (~{orderToView.weightKg || 0} kg)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Current Status:</span>
                  <Badge status={orderToView.status} showDot />
                </div>
              </div>

              {orderToView.specialInstructions && (
                <p className="text-xs text-[#6B6780] italic bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                  Student Instructions: "{orderToView.specialInstructions}"
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setOrderToView(null)}
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
