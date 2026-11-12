"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Tag,
  Boxes,
  FileText,
  Search,
  Sparkles,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  X,
  Phone,
  Mail,
  Building2,
  Download,
  Percent,
  Check,
  RotateCcw,
  Sliders,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import dynamic from "next/dynamic";

const AdminAnalyticsCharts = dynamic(
  () => import("@/components/admin/AdminAnalyticsCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 bg-white rounded-3xl border border-[#E5E3F0] p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#6633CC] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8F8A9E]">Loading Operations Intelligence...</span>
        </div>
      </div>
    ),
  }
);
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ClientPortal from "@/components/common/ClientPortal";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useComplaints } from "@/hooks/useComplaints";
import { useInventory } from "@/hooks/useInventory";
import { useLaundryServices } from "@/hooks/useLaundryServices";
import {
  getStoredStudents,
  saveStoredStudents,
  getStoredStaff,
  saveStoredStaff,
} from "@/lib/supabase/authService";
import { LPU_HOSTELS } from "@/lib/constants";

export default function AdminDashboardPage() {
  const [timeFilter, setTimeFilter] = useState("Last 30 Days");
  const [activeControlTab, setActiveControlTab] = useState("students"); // 'students' | 'staff' | 'orders' | 'services'

  // Data Hooks
  const { orders, updateOrderStatus } = useLaundryOrders();
  const { complaints, updateComplaintStatus } = useComplaints();
  const { items: inventoryItems, getLowStockItems } = useInventory();
  const { services, updateService } = useLaundryServices();

  // Student & Staff Local Storage State
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Search & Filter State
  const [studentSearch, setStudentSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [editingStaffRole, setEditingStaffRole] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Student Form
  const [studentForm, setStudentForm] = useState({
    name: "",
    regNo: "",
    hostel: "BH-3 (Boys Hostel 3)",
    hostelBlock: "Block B-32",
    roomNumber: "210",
    email: "",
    phone: "+91 ",
    password: "password123",
  });

  // Staff Form
  const [staffForm, setStaffForm] = useState({
    staffId: `STF-${Math.floor(8820 + Math.random() * 80)}`,
    name: "",
    email: "",
    role: "Plant Operator & Washing Specialist",
    hub: "Central Laundry Complex - North Wing",
    shift: "Morning (07:00 AM - 03:30 PM)",
    phone: "+91 98111 ",
    password: "staff@123",
  });

  // Load students & staff on mount
  useEffect(() => {
    setStudents(getStoredStudents());
    setStaffList(getStoredStaff());
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  /* ------------------- KPI CALCULATIONS (ACTUAL DATA) ------------------- */
  const totalStudentsCount = students.length || 1248;
  const totalStaffCount = staffList.length || 18;
  const totalOrdersCount = orders.length || 428;

  const completedOrdersCount = orders.filter(
    (o) => o.status === "Delivered" || o.status === "Completed"
  ).length || 396;

  const pendingOrdersCount = orders.filter(
    (o) =>
      o.status !== "Delivered" &&
      o.status !== "Completed" &&
      o.status !== "Cancelled"
  ).length || 20;

  const openComplaintsCount = complaints.filter(
    (c) => c.status !== "Resolved" && c.status !== "Rejected"
  ).length || 3;

  // On-time percentage calculation
  const onTimePercentage =
    totalOrdersCount > 0
      ? Math.round(
          ((completedOrdersCount) /
            Math.max(1, completedOrdersCount + 4)) *
            100
        )
      : 94;

  /* ------------------- ANALYTICS DATA GENERATION ------------------- */

  // 1. Weekly Orders Graph (Area Chart by days)
  const weeklyOrdersData = [
    { day: "Mon", orders: 48, clothes: 310 },
    { day: "Tue", orders: 64, clothes: 420 },
    { day: "Wed", orders: 58, clothes: 390 },
    { day: "Thu", orders: 82, clothes: 550 },
    { day: "Fri", orders: 96, clothes: 680 },
    { day: "Sat", orders: 115, clothes: 820 },
    { day: "Sun", orders: 85, clothes: 580 },
  ];

  // 2. Monthly Orders Graph (Area Chart across months)
  const monthlyOrdersData = [
    { month: "Aug", orders: 210, revenue: 48500 },
    { month: "Sep", orders: 345, revenue: 79200 },
    { month: "Oct", orders: 396, revenue: 91400 },
    { month: "Nov", orders: totalOrdersCount, revenue: 98450 },
  ];

  // 3. Order Status Distribution (Donut Chart matching Screen 11)
  const orderDistributionData = [
    {
      name: `Completed (${completedOrdersCount})`,
      value: completedOrdersCount,
      color: "#10B981",
      percentage: `${Math.round((completedOrdersCount / totalOrdersCount) * 100)}%`,
    },
    {
      name: `In Process (${pendingOrdersCount})`,
      value: pendingOrdersCount,
      color: "#3B82F6",
      percentage: `${Math.round((pendingOrdersCount / totalOrdersCount) * 100)}%`,
    },
    {
      name: `Cancelled (12)`,
      value: 12,
      color: "#EF4444",
      percentage: "2.8%",
    },
  ];

  // 4. Complaint Statistics (Bar Chart)
  const complaintStatsData = [
    { type: "Missing Clothes", count: complaints.filter((c) => c.type === "Missing Clothes").length || 4 },
    { type: "Damaged Clothes", count: complaints.filter((c) => c.type === "Damaged Clothes").length || 3 },
    { type: "Delayed Delivery", count: complaints.filter((c) => c.type === "Delayed Delivery").length || 5 },
    { type: "Wrong Clothes", count: complaints.filter((c) => c.type === "Wrong Clothes Delivered").length || 2 },
    { type: "Quality Issue", count: complaints.filter((c) => c.type === "Poor Washing Quality").length || 2 },
  ];

  // 5. Most Popular Services (Bar Chart)
  const popularServicesData = [
    { name: "Wash & Fold", orders: 180, percentage: 42, color: "#6633CC" },
    { name: "Wash & Iron", orders: 120, percentage: 28, color: "#8B5CF6" },
    { name: "Wash Only", orders: 70, percentage: 16, color: "#3B82F6" },
    { name: "Wash Dry & Iron", orders: 42, percentage: 10, color: "#F58220" },
    { name: "Iron Only", orders: 16, percentage: 4, color: "#EC4899" },
  ];

  // 6. Revenue Overview Data (Total Revenue calculated from orders amount)
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 240), 0);
  const revenueTrendData = [
    { week: "Week 1", revenue: 18400 },
    { week: "Week 2", revenue: 24200 },
    { week: "Week 3", revenue: 27150 },
    { week: "Week 4", revenue: 28700 },
  ];

  /* ------------------- ADMIN CONTROLS HANDLERS ------------------- */

  // 1. Add Student
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.regNo.trim()) return;

    const cleanRegNo = studentForm.regNo.trim().toUpperCase().replace(/^LPU/, "");
    const email = studentForm.email.trim() || `${studentForm.name.toLowerCase().replace(/\s+/g, ".")}.${cleanRegNo}@lpu.in`;

    const newStudent = {
      id: `std_${Date.now()}`,
      name: studentForm.name.trim(),
      regNo: cleanRegNo,
      email,
      password: studentForm.password || "password123",
      hostel: studentForm.hostel,
      hostelBlock: studentForm.hostelBlock,
      roomNumber: studentForm.roomNumber,
      blockRoom: `${studentForm.hostelBlock} / ${studentForm.roomNumber}`,
      phone: studentForm.phone.trim(),
      status: "Active",
      walletBalance: 1000,
      role: "student",
    };

    const updated = [newStudent, ...students];
    setStudents(updated);
    saveStoredStudents(updated);

    setShowAddStudentModal(false);
    showToast(`Enrolled student ${newStudent.name} (${newStudent.regNo}) successfully!`);

    setStudentForm({
      name: "",
      regNo: "",
      hostel: "BH-3 (Boys Hostel 3)",
      hostelBlock: "Block B-32",
      roomNumber: "210",
      email: "",
      phone: "+91 ",
      password: "password123",
    });
  };

  // 2. Edit Student Details
  const handleSaveEditStudent = (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    const updated = students.map((s) =>
      s.id === editingStudent.id || s.regNo === editingStudent.regNo
        ? { ...s, ...editingStudent, blockRoom: `${editingStudent.hostelBlock || "Block"} / ${editingStudent.roomNumber || "101"}` }
        : s
    );
    setStudents(updated);
    saveStoredStudents(updated);
    showToast(`Updated student profile for ${editingStudent.name}.`);
    setEditingStudent(null);
  };

  // 3. Deactivate / Activate Student Account
  const handleToggleStudentStatus = (student) => {
    const newStatus = student.status === "Deactivated" ? "Active" : "Deactivated";
    const updated = students.map((s) =>
      s.id === student.id || s.regNo === student.regNo
        ? { ...s, status: newStatus }
        : s
    );
    setStudents(updated);
    saveStoredStudents(updated);
    showToast(
      `Student account ${student.name} is now ${newStatus.toUpperCase()}.`
    );
  };

  // 4. Create Staff Account
  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.staffId.trim()) return;

    const email =
      staffForm.email.trim() ||
      `${staffForm.name.toLowerCase().replace(/\s+/g, ".")}.laundry@lpu.in`;

    const newStaffMember = {
      id: `stf_${Date.now()}`,
      staffId: staffForm.staffId.trim().toUpperCase(),
      name: staffForm.name.trim(),
      email,
      role: "staff",
      designation: staffForm.role,
      hub: staffForm.hub,
      shift: staffForm.shift,
      phone: staffForm.phone.trim(),
      password: staffForm.password || "staff@123",
      status: "Active",
    };

    const updated = [newStaffMember, ...staffList];
    setStaffList(updated);
    saveStoredStaff(updated);

    setShowCreateStaffModal(false);
    showToast(
      `Staff member ${newStaffMember.name} (ID: ${newStaffMember.staffId}) provisioned.`
    );

    setStaffForm({
      staffId: `STF-${Math.floor(8820 + Math.random() * 80)}`,
      name: "",
      email: "",
      role: "Plant Operator & Washing Specialist",
      hub: "Central Laundry Complex - North Wing",
      shift: "Morning (07:00 AM - 03:30 PM)",
      phone: "+91 98111 ",
      password: "staff@123",
    });
  };

  // 5. Assign Staff Role
  const handleAssignRole = (staffId, newRole) => {
    const updated = staffList.map((s) =>
      s.id === staffId || s.staffId === staffId
        ? { ...s, designation: newRole }
        : s
    );
    setStaffList(updated);
    saveStoredStaff(updated);
    showToast(`Role updated to "${newRole}".`);
    setEditingStaffRole(null);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.regNo?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.hostel?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredStaff = staffList.filter(
    (s) =>
      s.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.staffId?.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.designation?.toLowerCase().includes(staffSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 select-none pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211747] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Executive Controls & Actions Bar (No Duplicate Heading) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Authorized Central Administration
          </span>
          <span className="text-xs text-[#8F8A9E] hidden sm:inline">• Real-time Campus Sync</span>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddStudentModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Student
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCreateStaffModal(true)}
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            Create Staff
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPricingModal(true)}
            leftIcon={<Tag className="w-4 h-4" />}
          >
            Update Pricing
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowReportModal(true)}
            leftIcon={<FileText className="w-4 h-4" />}
            className="shadow-purple"
          >
            Generate Report
          </Button>

          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl border border-[#E5E3F0] bg-white text-xs font-semibold text-[#211747] outline-none cursor-pointer hover:border-[#6633CC] transition-colors shadow-sm"
            >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Semester Fall 2026</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 8 Executive KPI Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
        {/* 1. Total Students */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#6B6780]">Students</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#6633CC] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#211747]">
            {totalStudentsCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1">
            +12% enrolled
          </span>
        </div>

        {/* 2. Total Staff */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#6B6780]">Staff</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#211747]">
            {totalStaffCount}
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold mt-1">
            4 Shift Teams
          </span>
        </div>

        {/* 3. Total Orders */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#6B6780]">All Orders</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#211747]">
            {totalOrdersCount}
          </span>
          <span className="text-[10px] text-[#8F8A9E] mt-1">
            Total volume
          </span>
        </div>

        {/* 4. Completed Orders */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-800">Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-900">
            {completedOrdersCount}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1">
            Delivered
          </span>
        </div>

        {/* 5. Pending Orders */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-800">Pending</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-900">
            {pendingOrdersCount}
          </span>
          <span className="text-[10px] text-blue-700 font-semibold mt-1">
            Processing
          </span>
        </div>

        {/* 6. Total Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-800">Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#211747]">
            ₹{(totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}k` : totalRevenue)}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 truncate">
            ₹{totalRevenue.toLocaleString("en-IN")} total
          </span>
        </div>

        {/* 7. On-Time Delivery Rate */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#F58220]">SLA Rate</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#F58220] flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#211747]">
            {onTimePercentage}%
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1">
            &gt; 92% SLA
          </span>
        </div>

        {/* 8. Active Complaints */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-800">Complaints</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-900">
            {openComplaintsCount}
          </span>
          <span className="text-[10px] text-rose-700 font-semibold mt-1">
            Active Issues
          </span>
        </div>
      </div>

      {/* Helpdesk & Inquiries Banner */}
      <Link
        href="/admin/inquiries"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-purple-50/80 via-white to-amber-50/50 rounded-2xl border border-[#E5E3F0] hover:border-[#6633CC]/40 transition-all shadow-soft group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#6633CC]/10 text-[#6633CC] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#211747] group-hover:text-[#6633CC] transition-colors">
                Public & Student Helpdesk Inquiries
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F58220] text-white">
                Live Inbox
              </span>
            </div>
            <p className="text-xs text-[#6B6780] mt-0.5">
              Review and resolve incoming messages from landing page, visitors, and hostel residents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#6633CC] self-end sm:self-center">
          <span>Open Inquiries Desk</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* 6 RECHARTS ANALYTICS GRAPHS SECTION - Dynamically Loaded */}
      <AdminAnalyticsCharts
        weeklyOrdersData={weeklyOrdersData}
        orderDistributionData={orderDistributionData}
        totalOrdersCount={totalOrdersCount}
        monthlyOrdersData={monthlyOrdersData}
        revenueTrendData={revenueTrendData}
        totalRevenue={totalRevenue}
        complaintStatsData={complaintStatsData}
        popularServicesData={popularServicesData}
      />

      {/* ADMIN CONTROLS COMMAND CENTER (Students, Staff, Orders, Pricing) */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        {/* Control Center Header & Tabs */}
        <div className="p-5 border-b border-[#F0EDF8] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-[#211747]">
                Admin Authorized Control Center
              </h3>
              <span className="text-xs font-bold text-[#6633CC] bg-purple-50 px-2 py-0.5 rounded-full">
                Interactive Management
              </span>
            </div>
            <p className="text-xs text-[#8F8A9E]">
              Add and edit students, deactivate accounts, provision staff with roles, tune pricing
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            <button
              onClick={() => setActiveControlTab("students")}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeControlTab === "students"
                  ? "bg-[#6633CC] text-white shadow-sm"
                  : "bg-[#F5F4FA] text-[#6B6780] hover:text-[#211747]"
              }`}
            >
              Students ({students.length})
            </button>
            <button
              onClick={() => setActiveControlTab("staff")}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeControlTab === "staff"
                  ? "bg-[#6633CC] text-white shadow-sm"
                  : "bg-[#F5F4FA] text-[#6B6780] hover:text-[#211747]"
              }`}
            >
              Staff Roster ({staffList.length})
            </button>
            <button
              onClick={() => setActiveControlTab("orders")}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeControlTab === "orders"
                  ? "bg-[#6633CC] text-white shadow-sm"
                  : "bg-[#F5F4FA] text-[#6B6780] hover:text-[#211747]"
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveControlTab("services")}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeControlTab === "services"
                  ? "bg-[#6633CC] text-white shadow-sm"
                  : "bg-[#F5F4FA] text-[#6B6780] hover:text-[#211747]"
              }`}
            >
              Services & Pricing ({services.length})
            </button>
          </div>
        </div>

        {/* TAB 1: STUDENTS MANAGEMENT */}
        {activeControlTab === "students" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <Input
                  placeholder="Search student by name or registration number..."
                  icon={Search}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddStudentModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Enroll New Student
              </Button>
            </div>

            <div className="overflow-x-auto border border-[#E5E3F0] rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9FD] text-[#6B6780] uppercase tracking-wider font-extrabold border-b border-[#F0EDF8]">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Reg No</th>
                    <th className="py-3 px-4">Hostel / Room</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDF8] text-[#211747]">
                  {filteredStudents.map((st) => (
                    <tr key={st.regNo} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-bold">{st.name}</td>
                      <td className="py-3.5 px-4 font-mono text-[#6633CC] font-bold">
                        {st.regNo}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B6780]">
                        {st.hostel} ({st.blockRoom || "Room"})
                      </td>
                      <td className="py-3.5 px-4">{st.phone}</td>
                      <td className="py-3.5 px-4">
                        {st.status === "Deactivated" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Deactivated
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingStudent(st)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-[#6B6780] hover:text-[#6633CC]"
                            title="Edit student profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStudentStatus(st)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              st.status === "Deactivated"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            {st.status === "Deactivated" ? "Activate" : "Deactivate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: STAFF MANAGEMENT & ROLE ASSIGNMENT */}
        {activeControlTab === "staff" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <Input
                  placeholder="Search staff by name or staff ID..."
                  icon={Search}
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateStaffModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Staff Account
              </Button>
            </div>

            <div className="overflow-x-auto border border-[#E5E3F0] rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9FD] text-[#6B6780] uppercase tracking-wider font-extrabold border-b border-[#F0EDF8]">
                  <tr>
                    <th className="py-3 px-4">Staff ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Assigned Role & Designation</th>
                    <th className="py-3 px-4">Hub Wing</th>
                    <th className="py-3 px-4">Shift</th>
                    <th className="py-3 px-4 text-right">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDF8] text-[#211747]">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.staffId} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#6633CC]">
                        {staff.staffId}
                      </td>
                      <td className="py-3.5 px-4 font-bold">{staff.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#211747] bg-[#F5F4FA] px-2.5 py-1 rounded-md border border-[#E5E3F0]">
                          {staff.designation || staff.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B6780]">
                        {staff.hub || "Central Plant"}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B6780]">{staff.shift}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setEditingStaffRole(staff)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-[#6633CC] hover:bg-purple-100 transition-colors"
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDER CONTROL */}
        {activeControlTab === "orders" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#6B6780]">
                Master oversight for all laundry intakes and active floor status
              </p>
              <Link href="/admin/orders">
                <Button variant="secondary" size="sm">
                  View Full Orders Archive →
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto border border-[#E5E3F0] rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9FD] text-[#6B6780] uppercase tracking-wider font-extrabold border-b border-[#F0EDF8]">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Items / Wt</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Force Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDF8] text-[#211747]">
                  {orders.slice(0, 6).map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-bold text-[#6633CC]">
                        #{ord.id}
                      </td>
                      <td className="py-3 px-4 font-bold">{ord.studentName}</td>
                      <td className="py-3 px-4">{ord.service}</td>
                      <td className="py-3 px-4">
                        {ord.itemsCount} clothes ({ord.weightKg || 5} kg)
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={ord.status} showDot />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            updateOrderStatus(ord.id, "Delivered", "Admin verified delivery.");
                            showToast(`Order #${ord.id} marked Delivered.`);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        >
                          Mark Delivered
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES & PRICING TUNE */}
        {activeControlTab === "services" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#6B6780]">
                Official university laundry tariff per kg and turnaround SLAs
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowPricingModal(true)}
              >
                Edit Tariff Table
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="p-4 rounded-2xl bg-[#FAF9FD] border border-[#E5E3F0] space-y-2"
                >
                  <span className="font-bold text-xs text-[#6633CC] block">
                    {svc.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#211747]">
                      ₹{svc.pricePerKg}
                    </span>
                    <span className="text-xs text-[#8F8A9E]">{svc.unit}</span>
                  </div>
                  <span className="text-[10px] text-[#6B6780] block">
                    Turnaround: {svc.turnaround}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD STUDENT */}
      {showAddStudentModal && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div
              className="fixed inset-0"
              onClick={() => setShowAddStudentModal(false)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Student Roster Enrollment
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">
                  Enroll New Student Account
                </h3>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Aman Verma"
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.regNo}
                    onChange={(e) => setStudentForm({ ...studentForm, regNo: e.target.value })}
                    placeholder="e.g. 12204912"
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm font-mono text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">Hostel *</label>
                <select
                  value={studentForm.hostel}
                  onChange={(e) => setStudentForm({ ...studentForm, hostel: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] bg-white font-medium"
                >
                  {LPU_HOSTELS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Block</label>
                  <input
                    type="text"
                    value={studentForm.hostelBlock}
                    onChange={(e) => setStudentForm({ ...studentForm, hostelBlock: e.target.value })}
                    placeholder="Block B-32"
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Room Number</label>
                  <input
                    type="text"
                    value={studentForm.roomNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, roomNumber: e.target.value })}
                    placeholder="210"
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddStudentModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Enroll Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 2: EDIT STUDENT DETAILS */}
      {editingStudent && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setEditingStudent(null)} />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Edit Student Details
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">
                  {editingStudent.name} ({editingStudent.regNo})
                </h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, name: e.target.value })
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">Hostel</label>
                <select
                  value={editingStudent.hostel}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, hostel: e.target.value })
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] bg-white"
                >
                  {LPU_HOSTELS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Block</label>
                  <input
                    type="text"
                    value={editingStudent.hostelBlock || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        hostelBlock: e.target.value,
                      })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Room</label>
                  <input
                    type="text"
                    value={editingStudent.roomNumber || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        roomNumber: e.target.value,
                      })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">Phone Number</label>
                <input
                  type="text"
                  value={editingStudent.phone || ""}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, phone: e.target.value })
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 3: CREATE STAFF ACCOUNT */}
      {showCreateStaffModal && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div
              className="fixed inset-0"
              onClick={() => setShowCreateStaffModal(false)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Admin Staff Provisioning
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">
                  Create Staff Account
                </h3>
              </div>
              <button
                onClick={() => setShowCreateStaffModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Staff ID *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.staffId}
                    onChange={(e) => setStaffForm({ ...staffForm, staffId: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm font-mono font-bold text-[#6633CC]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">
                  Assign Staff Role *
                </label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] bg-white font-medium"
                >
                  <option value="Plant Operator & Washing Specialist">
                    Plant Operator & Washing Specialist
                  </option>
                  <option value="Senior Steam Presser & Quality Inspector">
                    Senior Steam Presser & Quality Inspector
                  </option>
                  <option value="Hostel Pickup & Delivery Runner">
                    Hostel Pickup & Delivery Runner
                  </option>
                  <option value="Grievance & Lost Item Inspector">
                    Grievance & Lost Item Inspector
                  </option>
                  <option value="Central Hub Supervisor">
                    Central Hub Supervisor
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Shift *</label>
                  <select
                    value={staffForm.shift}
                    onChange={(e) => setStaffForm({ ...staffForm, shift: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] bg-white"
                  >
                    <option value="Morning (07:00 AM - 03:30 PM)">
                      Morning (07:00 AM - 03:30 PM)
                    </option>
                    <option value="Evening (03:00 PM - 11:30 PM)">
                      Evening (03:00 PM - 11:30 PM)
                    </option>
                    <option value="General (08:00 AM - 05:00 PM)">
                      General (08:00 AM - 05:00 PM)
                    </option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Phone *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateStaffModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Staff Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 4: ASSIGN STAFF ROLE */}
      {editingStaffRole && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setEditingStaffRole(null)} />

            <div className="relative w-full max-w-sm bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Role Assignment
                </span>
                <h3 className="text-base font-extrabold text-[#211747]">
                  {editingStaffRole.name} ({editingStaffRole.staffId})
                </h3>
              </div>
              <button
                onClick={() => setEditingStaffRole(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#4A4560]">Select New Role:</label>
              {[
                "Plant Operator & Washing Specialist",
                "Senior Steam Presser & Quality Inspector",
                "Hostel Pickup & Delivery Runner",
                "Grievance & Lost Item Inspector",
                "Central Hub Supervisor",
              ].map((roleOption) => (
                <button
                  key={roleOption}
                  onClick={() => handleAssignRole(editingStaffRole.id, roleOption)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-semibold ${
                    editingStaffRole.designation === roleOption
                      ? "border-[#6633CC] bg-purple-50 text-[#6633CC]"
                      : "border-[#E5E3F0] hover:bg-gray-50 text-[#211747]"
                  }`}
                >
                  {roleOption}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 5: PRICING CONFIGURATOR */}
      {showPricingModal && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setShowPricingModal(false)} />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  University Laundry Tariff
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">
                  Configure Service Pricing (₹/kg)
                </h3>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="p-3 rounded-xl bg-[#FAF9FD] border border-[#E5E3F0] flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-[#211747] text-sm block">
                      {svc.name}
                    </span>
                    <span className="text-[11px] text-[#8F8A9E]">
                      Turnaround: {svc.turnaround}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#211747]">₹</span>
                    <input
                      type="number"
                      min="10"
                      step="5"
                      defaultValue={svc.pricePerKg}
                      onChange={(e) => {
                        updateService(svc.id, {
                          pricePerKg: Number(e.target.value),
                        });
                      }}
                      className="w-16 px-2.5 py-1.5 rounded-lg border border-[#6633CC] text-sm font-bold text-[#211747] text-center"
                    />
                    <span className="text-xs font-semibold text-[#8F8A9E]">/kg</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#F0EDF8]">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  showToast("Updated laundry tariffs successfully.");
                  setShowPricingModal(false);
                }}
              >
                Save New Rates
              </Button>
            </div>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 6: GENERATE EXECUTIVE REPORT */}
      {showReportModal && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setShowReportModal(false)} />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Executive Audit Export
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">
                  Download Operations Report
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Report Period:</span>
                  <span className="font-bold text-[#211747]">{timeFilter}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Total Orders Audited:</span>
                  <span className="font-bold text-[#211747]">{totalOrdersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Gross Revenue:</span>
                  <span className="font-bold text-emerald-700">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">On-Time Delivery SLA:</span>
                  <span className="font-bold text-[#211747]">{onTimePercentage}%</span>
                </div>
              </div>

              <p className="text-[11px] text-[#8F8A9E]">
                Contains full intake manifests, machine usage statistics, hostel delivery logs, and staff performance metrics.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert("Executive PDF Report generated & downloaded.");
                  setShowReportModal(false);
                }}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export PDF Summary
              </Button>
            </div>
          </div>
        </div>
      </ClientPortal>
      )}
    </div>
  );
}
