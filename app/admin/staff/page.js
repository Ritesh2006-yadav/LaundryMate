"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserCheck,
  Plus,
  Shield,
  X,
  Phone,
  Building2,
  Clock,
  CheckCircle2,
  Search,
  Download,
  Edit2,
  Trash2,
  Mail,
  Award,
  TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import ClientPortal from "@/components/common/ClientPortal";
import { getStoredStaff, saveStoredStaff } from "@/lib/supabase/authService";

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState(() => getStoredStaff());
  const [searchTerm, setSearchTerm] = useState("");
  const [hubFilter, setHubFilter] = useState("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [newStaff, setNewStaff] = useState({
    staffId: `STF-${Math.floor(8820 + Math.random() * 80)}`,
    name: "",
    email: "",
    designation: "Plant Operator & Washing Specialist",
    hub: "Central Laundry Complex - North Wing",
    phone: "+91 98765 11223",
    shift: "Morning (07:00 AM - 03:30 PM)",
    password: "staff@123",
  });

  useEffect(() => {
    setStaffList(getStoredStaff());
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.staffId.trim()) return;

    const email =
      newStaff.email.trim() ||
      `${newStaff.name.toLowerCase().replace(/\s+/g, ".")}.laundry@lpu.in`;

    const initials =
      newStaff.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "ST";

    const createdStaff = {
      id: `stf_${Date.now()}`,
      staffId: newStaff.staffId.trim().toUpperCase(),
      name: newStaff.name.trim(),
      email,
      password: newStaff.password || "staff@123",
      role: "staff",
      designation: newStaff.designation,
      hub: newStaff.hub,
      phone: newStaff.phone.trim(),
      shift: newStaff.shift,
      avatar: initials,
      status: "Active",
      ordersCompleted: Math.floor(40 + Math.random() * 60),
      rating: 4.8,
    };

    const updated = [createdStaff, ...staffList];
    setStaffList(updated);
    saveStoredStaff(updated);

    setIsAddModalOpen(false);
    showToast(`Staff member ${createdStaff.name} (${createdStaff.staffId}) provisioned successfully!`);

    setNewStaff({
      staffId: `STF-${Math.floor(8820 + Math.random() * 80)}`,
      name: "",
      email: "",
      designation: "Plant Operator & Washing Specialist",
      hub: "Central Laundry Complex - North Wing",
      phone: "+91 98765 11223",
      shift: "Morning (07:00 AM - 03:30 PM)",
      password: "staff@123",
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingStaff) return;

    const updated = staffList.map((st) =>
      st.staffId === editingStaff.staffId ? { ...st, ...editingStaff } : st
    );
    setStaffList(updated);
    saveStoredStaff(updated);
    setEditingStaff(null);
    showToast(`Updated profile for ${editingStaff.name}.`);
  };

  const handleToggleStatus = (st) => {
    const newStatus = st.status === "Deactivated" ? "Active" : "Deactivated";
    const updated = staffList.map((s) =>
      s.staffId === st.staffId ? { ...s, status: newStatus } : s
    );
    setStaffList(updated);
    saveStoredStaff(updated);
    showToast(`Staff member ${st.name} is now ${newStatus}.`);
  };

  const handleExportCSV = () => {
    const headers = ["Staff ID", "Full Name", "Designation", "Hub / Zone", "Shift", "Phone", "Status", "Rating"];
    const rows = filtered.map((s) => [
      s.staffId,
      `"${s.name}"`,
      `"${s.designation}"`,
      `"${s.hub}"`,
      `"${s.shift}"`,
      s.phone,
      s.status || "Active",
      s.rating || "4.8",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lpu_staff_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Staff roster exported to CSV!");
  };

  const filtered = staffList.filter((st) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      st.name?.toLowerCase().includes(q) ||
      st.staffId?.toLowerCase().includes(q) ||
      st.hub?.toLowerCase().includes(q) ||
      st.designation?.toLowerCase().includes(q);

    const matchHub =
      hubFilter === "all" || st.hub?.toLowerCase().includes(hubFilter.toLowerCase());

    return matchSearch && matchHub;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211747] text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Staff Actions Bar (No Duplicate Heading) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Operations Roster
          </span>
          <span className="text-xs text-[#8F8A9E] font-medium">• {staffList.length} Active Personnel</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Roster
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="shadow-purple"
          >
            Provision Staff
          </Button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3 text-xs text-[#211747]">
        <Shield className="w-5 h-5 text-[#6633CC] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Administrative Security Notice: </span>
          <span>
            Staff credentials cannot be self-registered. All staff accounts must be provisioned and assigned to official laundry hub wings directly by university operations administrators.
          </span>
        </div>
      </div>

      {/* Search & Hub Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="sm:col-span-8">
          <Input
            placeholder="Search by staff name, ID (e.g. STF-8821), designation, or hub..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] transition-colors"
          >
            <option value="all">All Plant Zones & Hubs</option>
            <option value="North">North Wing Plant</option>
            <option value="South">South Wing Plant</option>
            <option value="BH">Boys Hostels Zone</option>
            <option value="GH">Girls Hostels Zone</option>
          </select>
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-[#6B6780]">Total Staff</span>
          <p className="text-xl font-black text-[#211747] mt-1">{staffList.length}</p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-emerald-700">Active On Duty</span>
          <p className="text-xl font-black text-emerald-800 mt-1">
            {staffList.filter((s) => s.status !== "Deactivated").length}
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-indigo-700">Shifts Active</span>
          <p className="text-xl font-black text-indigo-800 mt-1">3 Shift Rotations</p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-[#F58220]">Avg Staff SLA</span>
          <p className="text-xl font-black text-[#F58220] mt-1">98.4% On-Time</p>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((st) => (
          <div
            key={st.staffId}
            className="bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-[#6633CC]/10 text-[#6633CC] flex items-center justify-center font-bold text-base shadow-sm">
                  {st.avatar || "ST"}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      st.status === "Deactivated"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {st.status || "Active"}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-base text-[#211747]">{st.name}</h4>
              <p className="text-xs font-mono font-bold text-[#6633CC] mt-0.5">
                Staff ID: {st.staffId}
              </p>
              <p className="text-xs text-[#6B6780] font-medium mt-1">
                {st.designation}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 text-xs text-[#4A4560] space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#8F8A9E] flex-shrink-0" />
                <span className="truncate">{st.hub}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#8F8A9E] flex-shrink-0" />
                <span>{st.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#8F8A9E] flex-shrink-0" />
                <span className="text-[11px] text-[#6B6780]">{st.shift}</span>
              </div>
            </div>

            {/* Performance Stats & Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Award className="w-4 h-4 text-[#F58220]" />
                <span>{st.ordersCompleted || 72} Orders Fulfilled</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingStaff(st)}
                  className="p-1.5 rounded-lg text-[#6B6780] hover:text-[#211747] hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Edit staff details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleStatus(st)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                    st.status === "Deactivated"
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  {st.status === "Deactivated" ? "Activate" : "Deactivate"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: PROVISION NEW STAFF */}
      {isAddModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6633CC]">
                    University Access Management
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Provision New Staff Member
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Unique Staff ID"
                    value={newStaff.staffId}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, staffId: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Full Name"
                    placeholder="e.g. Gurpreet Singh"
                    value={newStaff.name}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Role / Designation"
                    options={[
                      "Plant Operator & Washing Specialist",
                      "Senior Steam Presser & Quality Inspector",
                      "Hostel Pickup & Delivery Runner",
                      "Chemical & Machinery Maintenance Engineer",
                      "Shift Supervisor",
                    ]}
                    value={newStaff.designation}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, designation: e.target.value })
                    }
                    required
                  />

                  <Select
                    label="Plant / Zone Hub"
                    options={[
                      "Central Laundry Complex - North Wing",
                      "Central Laundry Complex - South Wing",
                      "BH-1 to BH-4 Zone",
                      "BH-5 to BH-8 Zone",
                      "GH-1 to GH-6 Zone",
                    ]}
                    value={newStaff.hub}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, hub: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Contact Phone"
                    value={newStaff.phone}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, phone: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Default Password"
                    value={newStaff.password}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, password: e.target.value })
                    }
                    required
                  />
                </div>

                <Select
                  label="Assigned Shift"
                  options={[
                    "Morning (07:00 AM - 03:30 PM)",
                    "Evening (03:00 PM - 11:30 PM)",
                    "General (08:00 AM - 05:00 PM)",
                  ]}
                  value={newStaff.shift}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, shift: e.target.value })
                  }
                  required
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EDF8]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm font-semibold text-[#211747] hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="md">
                    Issue Staff Account
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* MODAL 2: EDIT STAFF DETAILS */}
      {editingStaff && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setEditingStaff(null)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6633CC]">
                    Edit Staff Details
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    {editingStaff.name} ({editingStaff.staffId})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-xs text-[#4A4560]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.name}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, name: e.target.value })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-xs text-[#4A4560]">Role / Designation</label>
                    <select
                      value={editingStaff.designation}
                      onChange={(e) =>
                        setEditingStaff({ ...editingStaff, designation: e.target.value })
                      }
                      className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] bg-white"
                    >
                      <option>Plant Operator & Washing Specialist</option>
                      <option>Senior Steam Presser & Quality Inspector</option>
                      <option>Hostel Pickup & Delivery Runner</option>
                      <option>Chemical & Machinery Maintenance Engineer</option>
                      <option>Shift Supervisor</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-xs text-[#4A4560]">Assigned Hub</label>
                    <select
                      value={editingStaff.hub}
                      onChange={(e) =>
                        setEditingStaff({ ...editingStaff, hub: e.target.value })
                      }
                      className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] bg-white"
                    >
                      <option>Central Laundry Complex - North Wing</option>
                      <option>Central Laundry Complex - South Wing</option>
                      <option>BH-1 to BH-4 Zone</option>
                      <option>BH-5 to BH-8 Zone</option>
                      <option>GH-1 to GH-6 Zone</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-xs text-[#4A4560]">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={editingStaff.phone}
                      onChange={(e) =>
                        setEditingStaff({ ...editingStaff, phone: e.target.value })
                      }
                      className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-xs text-[#4A4560]">Assigned Shift</label>
                    <select
                      value={editingStaff.shift}
                      onChange={(e) =>
                        setEditingStaff({ ...editingStaff, shift: e.target.value })
                      }
                      className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] bg-white"
                    >
                      <option>Morning (07:00 AM - 03:30 PM)</option>
                      <option>Evening (03:00 PM - 11:30 PM)</option>
                      <option>General (08:00 AM - 05:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EDF8]">
                  <button
                    type="button"
                    onClick={() => setEditingStaff(null)}
                    className="px-5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm font-semibold text-[#211747] hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="md">
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
