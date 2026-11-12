"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  UserCheck,
  UserX,
  Plus,
  Download,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building,
  Wallet,
  ShoppingBag,
  AlertCircle,
  X,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import ClientPortal from "@/components/common/ClientPortal";
import {
  getStoredStudents,
  saveStoredStudents,
} from "@/lib/supabase/authService";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useComplaints } from "@/hooks/useComplaints";
import { LPU_HOSTELS } from "@/lib/constants";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState(() => getStoredStudents());
  const [searchTerm, setSearchTerm] = useState("");
  const [hostelFilter, setHostelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const { orders } = useLaundryOrders();
  const { complaints } = useComplaints();

  // Load students from storage if updated externally
  useEffect(() => {
    const loaded = getStoredStudents();
    setStudents(loaded);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Add Student Form State
  const [studentForm, setStudentForm] = useState({
    name: "",
    regNo: "",
    hostel: "BH-3 (Boys Hostel 3)",
    hostelBlock: "Block B-32",
    roomNumber: "210",
    email: "",
    phone: "+91 98765 43210",
    password: "password123",
  });

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.regNo.trim()) return;

    const cleanRegNo = studentForm.regNo.trim().toUpperCase().replace(/^LPU/, "");
    const email =
      studentForm.email.trim() ||
      `${studentForm.name.toLowerCase().replace(/\s+/g, ".")}.${cleanRegNo}@lpu.in`;

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
      totalOrders: 0,
      role: "student",
    };

    const updated = [newStudent, ...students];
    setStudents(updated);
    saveStoredStudents(updated);
    setShowAddModal(false);
    showToast(`Student ${newStudent.name} (LPU${cleanRegNo}) enrolled successfully!`);

    setStudentForm({
      name: "",
      regNo: "",
      hostel: "BH-3 (Boys Hostel 3)",
      hostelBlock: "Block B-32",
      roomNumber: "210",
      email: "",
      phone: "+91 98765 43210",
      password: "password123",
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    const updated = students.map((s) =>
      s.id === editingStudent.id || s.regNo === editingStudent.regNo
        ? {
            ...s,
            ...editingStudent,
            blockRoom: `${editingStudent.hostelBlock || "Block"} / ${editingStudent.roomNumber || "Room"}`,
          }
        : s
    );
    setStudents(updated);
    saveStoredStudents(updated);
    if (selectedStudent && (selectedStudent.id === editingStudent.id || selectedStudent.regNo === editingStudent.regNo)) {
      setSelectedStudent({ ...selectedStudent, ...editingStudent });
    }
    setEditingStudent(null);
    showToast(`Updated profile for ${editingStudent.name}.`);
  };

  const handleToggleStatus = (st) => {
    const newStatus = st.status === "Deactivated" ? "Active" : "Deactivated";
    const updated = students.map((s) =>
      s.id === st.id || s.regNo === st.regNo ? { ...s, status: newStatus } : s
    );
    setStudents(updated);
    saveStoredStudents(updated);
    if (selectedStudent && (selectedStudent.id === st.id || selectedStudent.regNo === st.regNo)) {
      setSelectedStudent({ ...selectedStudent, status: newStatus });
    }
    showToast(`Account for ${st.name} is now ${newStatus}.`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Registration Number",
      "Full Name",
      "Email Address",
      "Phone",
      "Hostel",
      "Room",
      "Wallet Balance (INR)",
      "Account Status",
    ];
    const rows = filtered.map((s) => [
      `LPU${s.regNo}`,
      `"${s.name}"`,
      s.email || "N/A",
      s.phone || "N/A",
      `"${s.hostel}"`,
      `"${s.blockRoom || s.roomNumber || 'Room'}"`,
      s.walletBalance ?? 1000,
      s.status || "Active",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lpu_lms_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Student directory exported to CSV!");
  };

  // Filter logic
  const filtered = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      s.name?.toLowerCase().includes(q) ||
      s.regNo?.toLowerCase().includes(q) ||
      `lpu${s.regNo}`.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q);

    const matchHostel =
      hostelFilter === "all" || s.hostel?.toLowerCase().includes(hostelFilter.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && s.status !== "Deactivated") ||
      (statusFilter === "deactivated" && s.status === "Deactivated");

    return matchSearch && matchHostel && matchStatus;
  });

  // Calculate order & complaint counts for selected student
  const studentOrders = selectedStudent
    ? orders.filter(
        (o) =>
          o.studentRegNo === selectedStudent.regNo ||
          o.studentName?.toLowerCase() === selectedStudent.name?.toLowerCase()
      )
    : [];

  const studentComplaints = selectedStudent
    ? complaints.filter(
        (c) =>
          c.studentRegNo === selectedStudent.regNo ||
          c.studentName?.toLowerCase() === selectedStudent.name?.toLowerCase()
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211747] text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Directory Actions Bar (No Duplicate Heading) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            University Student Roster
          </span>
          <span className="text-xs text-[#8F8A9E] font-medium">• {students.length} Enrolled Residents</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-purple"
          >
            Enroll Student
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="sm:col-span-6">
          <Input
            placeholder="Search by name, LPU registration number, or email..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={hostelFilter}
            onChange={(e) => setHostelFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] transition-colors"
          >
            <option value="all">All Hostels (BH & GH)</option>
            <option value="BH-1">BH-1 (Boys Hostel 1)</option>
            <option value="BH-2">BH-2 (Boys Hostel 2)</option>
            <option value="BH-3">BH-3 (Boys Hostel 3)</option>
            <option value="BH-4">BH-4 (Boys Hostel 4)</option>
            <option value="BH-5">BH-5 (Boys Hostel 5)</option>
            <option value="BH-6">BH-6 (Boys Hostel 6)</option>
            <option value="GH-1">GH-1 (Girls Hostel 1)</option>
            <option value="GH-2">GH-2 (Girls Hostel 2)</option>
            <option value="GH-3">GH-3 (Girls Hostel 3)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] transition-colors"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Only</option>
            <option value="deactivated">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-[#6B6780]">Total Enrolled</span>
          <p className="text-xl font-black text-[#211747] mt-1">{students.length}</p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-emerald-700">Active Students</span>
          <p className="text-xl font-black text-emerald-800 mt-1">
            {students.filter((s) => s.status !== "Deactivated").length}
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-rose-700">Deactivated</span>
          <p className="text-xl font-black text-rose-800 mt-1">
            {students.filter((s) => s.status === "Deactivated").length}
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-[#6633CC]">Filtered Results</span>
          <p className="text-xl font-black text-[#6633CC] mt-1">{filtered.length}</p>
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
              <tr>
                <th className="py-3.5 px-5">Student Name</th>
                <th className="py-3.5 px-5">Reg Number</th>
                <th className="py-3.5 px-5">Hostel & Room</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Laundry Wallet</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8] text-[#211747]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8F8A9E]">
                    No students found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.regNo} className="hover:bg-[#FAF9FD] transition-colors">
                    <td className="py-3.5 px-5 font-bold">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6633CC] to-[#8C52FF] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {s.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("") || "ST"}
                        </div>
                        <div>
                          <p className="font-bold text-[#211747]">{s.name}</p>
                          <p className="text-[10px] text-[#8F8A9E]">{s.email || "lpu.in student"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-[#6633CC]">
                      LPU{s.regNo?.replace(/^LPU/, "")}
                    </td>
                    <td className="py-3.5 px-5 text-[#4A4560]">
                      <div className="font-semibold">{s.hostel?.split(" ")[0] || s.hostel}</div>
                      <div className="text-[11px] text-[#8F8A9E]">{s.blockRoom || s.roomNumber || "Room"}</div>
                    </td>
                    <td className="py-3.5 px-5 text-[#6B6780]">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-[#8F8A9E]" />
                        <span>{s.phone || "+91 98765 43210"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700">
                      ₹{s.walletBalance ?? 1000}
                    </td>
                    <td className="py-3.5 px-5">
                      {s.status === "Deactivated" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Deactivated
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="p-1.5 hover:bg-purple-50 text-[#6B6780] hover:text-[#6633CC] rounded-lg transition-colors cursor-pointer"
                          title="View student dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingStudent(s)}
                          className="p-1.5 hover:bg-gray-100 text-[#6B6780] hover:text-[#211747] rounded-lg transition-colors cursor-pointer"
                          title="Edit student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            s.status === "Deactivated"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          }`}
                        >
                          {s.status === "Deactivated" ? "Activate" : "Deactivate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW STUDENT DOSSIER */}
      {selectedStudent && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setSelectedStudent(null)} />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#6633CC] text-white flex items-center justify-center font-black text-lg">
                  {selectedStudent.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#211747]">{selectedStudent.name}</h3>
                  <p className="text-xs font-mono text-[#6633CC] font-bold">
                    LPU{selectedStudent.regNo?.replace(/^LPU/, "")} • {selectedStudent.hostel}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]/60">
                <span className="text-[10px] font-bold text-[#8F8A9E] uppercase">Room Allocation</span>
                <p className="text-xs font-bold text-[#211747] mt-0.5">
                  {selectedStudent.blockRoom || selectedStudent.roomNumber || "Block B-32 / 210"}
                </p>
              </div>
              <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]/60">
                <span className="text-[10px] font-bold text-[#8F8A9E] uppercase">Wallet Balance</span>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  ₹{selectedStudent.walletBalance ?? 1000}
                </p>
              </div>
              <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]/60">
                <span className="text-[10px] font-bold text-[#8F8A9E] uppercase">Orders Placed</span>
                <p className="text-xs font-bold text-[#6633CC] mt-0.5">
                  {studentOrders.length || selectedStudent.totalOrders || 8} Orders
                </p>
              </div>
              <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]/60">
                <span className="text-[10px] font-bold text-[#8F8A9E] uppercase">Account Status</span>
                <p className="text-xs font-bold text-[#211747] mt-0.5">
                  {selectedStudent.status || "Active"}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-4 rounded-2xl border border-[#E5E3F0] bg-white space-y-2 text-xs">
              <h4 className="font-bold text-[#211747] text-xs uppercase tracking-wider">Contact & Credentials</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#4A4560]">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#8F8A9E]" />
                  <span>{selectedStudent.email || `${selectedStudent.regNo}@lpu.in`}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8F8A9E]" />
                  <span>{selectedStudent.phone || "+91 98765 43210"}</span>
                </p>
              </div>
            </div>

            {/* Orders History Preview */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#211747] text-xs uppercase tracking-wider">Recent Laundry Requests</h4>
              {studentOrders.length === 0 ? (
                <p className="text-xs text-[#8F8A9E] p-3 bg-gray-50 rounded-xl">No active or past laundry orders logged.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {studentOrders.slice(0, 4).map((o) => (
                    <div
                      key={o.id}
                      className="p-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E3F0]/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#6633CC]">#{o.id}</span>
                        <span className="text-[#4A4560] ml-2">{o.service}</span>
                      </div>
                      <Badge status={o.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#F0EDF8]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(selectedStudent)}
                className={selectedStudent.status === "Deactivated" ? "text-emerald-700" : "text-rose-600"}
              >
                {selectedStudent.status === "Deactivated" ? "Activate Student" : "Deactivate Student"}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingStudent(selectedStudent);
                    setSelectedStudent(null);
                  }}
                >
                  Edit Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 2: ENROLL NEW STUDENT */}
      {showAddModal && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setShowAddModal(false)} />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  LPU Laundry Portal
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">Enroll New Student</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
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
                  <label className="font-bold text-[#4A4560]">Registration Number *</label>
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
                  <label className="font-bold text-[#4A4560]">Hostel Block</label>
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
                  onClick={() => setShowAddModal(false)}
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

      {/* MODAL 3: EDIT STUDENT */}
      {editingStudent && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setEditingStudent(null)} />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Edit Profile
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">
                  {editingStudent.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">Hostel</label>
                <select
                  value={editingStudent.hostel}
                  onChange={(e) => setEditingStudent({ ...editingStudent, hostel: e.target.value })}
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
                      setEditingStudent({ ...editingStudent, hostelBlock: e.target.value })
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
                      setEditingStudent({ ...editingStudent, roomNumber: e.target.value })
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
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
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
    </div>
  );
}
