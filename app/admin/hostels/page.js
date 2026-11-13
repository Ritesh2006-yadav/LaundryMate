"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
  AlertCircle,
  Eye,
  Edit2,
  Plus,
  Download,
  Search,
  CheckCircle2,
  X,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import ClientPortal from "@/components/common/ClientPortal";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useComplaints } from "@/hooks/useComplaints";

const INITIAL_HOSTELS = [
  {
    code: "BH-1",
    name: "Boys Hostel 1 (Vivekananda Bhawan)",
    gender: "Boys",
    blocks: 4,
    totalRooms: 480,
    occupiedRooms: 442,
    capacity: 960,
    studentsCount: 884,
    wardenName: "Dr. Rajesh Sharma",
    wardenPhone: "+91 98721 11001",
    wardenEmail: "warden.bh1@lpu.in",
    assignedStaff: "Ramesh Chand, Sunita Devi",
    laundryHub: "North Laundry Plant",
    pickupSlot: "07:00 AM - 09:30 AM",
    status: "Active",
  },
  {
    code: "BH-2",
    name: "Boys Hostel 2 (Tagore Bhawan)",
    gender: "Boys",
    blocks: 4,
    totalRooms: 520,
    occupiedRooms: 495,
    capacity: 1040,
    studentsCount: 990,
    wardenName: "Prof. Suresh Yadav",
    wardenPhone: "+91 98721 11002",
    wardenEmail: "warden.bh2@lpu.in",
    assignedStaff: "Mahesh Kumar, Deepa Rani",
    laundryHub: "Central Laundry Plant",
    pickupSlot: "07:30 AM - 10:00 AM",
    status: "Active",
  },
  {
    code: "BH-3",
    name: "Boys Hostel 3 (Kalam Bhawan)",
    gender: "Boys",
    blocks: 6,
    totalRooms: 750,
    occupiedRooms: 710,
    capacity: 1500,
    studentsCount: 1420,
    wardenName: "Dr. Baldev Singh",
    wardenPhone: "+91 98721 11003",
    wardenEmail: "warden.bh3@lpu.in",
    assignedStaff: "Rohit Kumar, Amit Sharma",
    laundryHub: "Central Laundry Plant",
    pickupSlot: "08:00 AM - 10:30 AM",
    status: "Active",
  },
  {
    code: "BH-4",
    name: "Boys Hostel 4 (Aryabhata Bhawan)",
    gender: "Boys",
    blocks: 4,
    totalRooms: 500,
    occupiedRooms: 460,
    capacity: 1000,
    studentsCount: 920,
    wardenName: "Dr. Harpreet Singh",
    wardenPhone: "+91 98721 11004",
    wardenEmail: "warden.bh4@lpu.in",
    assignedStaff: "Vikramjeet, Sunita Verma",
    laundryHub: "South Laundry Plant",
    pickupSlot: "08:30 AM - 11:00 AM",
    status: "Active",
  },
  {
    code: "BH-5",
    name: "Boys Hostel 5 (Bhabha Bhawan)",
    gender: "Boys",
    blocks: 4,
    totalRooms: 460,
    occupiedRooms: 430,
    capacity: 920,
    studentsCount: 860,
    wardenName: "Prof. Sunil Kumar",
    wardenPhone: "+91 98721 11005",
    wardenEmail: "warden.bh5@lpu.in",
    assignedStaff: "Dinesh Rawat",
    laundryHub: "South Laundry Plant",
    pickupSlot: "07:00 AM - 09:30 AM",
    status: "Active",
  },
  {
    code: "BH-6",
    name: "Boys Hostel 6 (Ramanujan Bhawan)",
    gender: "Boys",
    blocks: 5,
    totalRooms: 600,
    occupiedRooms: 550,
    capacity: 1200,
    studentsCount: 1100,
    wardenName: "Dr. Kuldeep Singh",
    wardenPhone: "+91 98721 11006",
    wardenEmail: "warden.bh6@lpu.in",
    assignedStaff: "Gurpreet Singh, Anil Kumar",
    laundryHub: "North Laundry Plant",
    pickupSlot: "08:00 AM - 10:30 AM",
    status: "Active",
  },
  {
    code: "GH-1",
    name: "Girls Hostel 1 (Sarojini Bhawan)",
    gender: "Girls",
    blocks: 5,
    totalRooms: 620,
    occupiedRooms: 590,
    capacity: 1240,
    studentsCount: 1180,
    wardenName: "Dr. Meenakshi Sundaram",
    wardenPhone: "+91 98721 11007",
    wardenEmail: "warden.gh1@lpu.in",
    assignedStaff: "Anita Devi, Rekha Kumari",
    laundryHub: "East Girls Hub",
    pickupSlot: "08:00 AM - 10:30 AM",
    status: "Active",
  },
  {
    code: "GH-2",
    name: "Girls Hostel 2 (Kalpana Chawla Bhawan)",
    gender: "Girls",
    blocks: 6,
    totalRooms: 780,
    occupiedRooms: 740,
    capacity: 1560,
    studentsCount: 1480,
    wardenName: "Dr. Ananya Roy",
    wardenPhone: "+91 98721 11008",
    wardenEmail: "warden.gh2@lpu.in",
    assignedStaff: "Pooja Sharma, Priya Bala",
    laundryHub: "East Girls Hub",
    pickupSlot: "08:30 AM - 11:00 AM",
    status: "Active",
  },
  {
    code: "GH-3",
    name: "Girls Hostel 3 (Gargi Bhawan)",
    gender: "Girls",
    blocks: 5,
    totalRooms: 640,
    occupiedRooms: 610,
    capacity: 1280,
    studentsCount: 1220,
    wardenName: "Prof. Sunita Chaudhary",
    wardenPhone: "+91 98721 11009",
    wardenEmail: "warden.gh3@lpu.in",
    assignedStaff: "Kiran Bala, Suman Devi",
    laundryHub: "East Girls Hub",
    pickupSlot: "07:30 AM - 10:00 AM",
    status: "Active",
  },
];

export default function AdminHostelsPage() {
  const [hostels, setHostels] = useState(INITIAL_HOSTELS);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  // Modals
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [editingHostel, setEditingHostel] = useState(null);
  const [wardenSimulationHostel, setWardenSimulationHostel] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const { orders } = useLaundryOrders();
  const { complaints } = useComplaints();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingHostel) return;

    setHostels((prev) =>
      prev.map((h) => (h.code === editingHostel.code ? { ...editingHostel } : h))
    );
    if (selectedHostel?.code === editingHostel.code) {
      setSelectedHostel({ ...editingHostel });
    }
    setEditingHostel(null);
    showToast(`Updated hostel records for ${editingHostel.code}.`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Hostel Code",
      "Hostel Name",
      "Gender",
      "Blocks",
      "Total Rooms",
      "Occupied Rooms",
      "Capacity",
      "Warden Name",
      "Warden Phone",
      "Warden Email",
      "Assigned Laundry Staff",
      "Plant Hub",
    ];
    const rows = filtered.map((h) => [
      h.code,
      `"${h.name}"`,
      h.gender,
      h.blocks,
      h.totalRooms,
      h.occupiedRooms,
      h.capacity,
      `"${h.wardenName}"`,
      h.wardenPhone,
      h.wardenEmail,
      `"${h.assignedStaff}"`,
      `"${h.laundryHub}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lpu_hostels_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported hostel registry to CSV!");
  };

  const filtered = hostels.filter((h) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      h.code.toLowerCase().includes(q) ||
      h.name.toLowerCase().includes(q) ||
      h.wardenName.toLowerCase().includes(q);
    const matchGender =
      genderFilter === "all" || h.gender.toLowerCase() === genderFilter.toLowerCase();
    return matchSearch && matchGender;
  });

  // Calculate totals
  const totalCapacity = hostels.reduce((sum, h) => sum + h.capacity, 0);
  const totalRooms = hostels.reduce((sum, h) => sum + h.totalRooms, 0);
  const totalOccupied = hostels.reduce((sum, h) => sum + h.occupiedRooms, 0);

  // Simulation filtered data when viewing as Warden
  const simulatedHostelData = wardenSimulationHostel
    ? {
        orders: orders.filter((o) =>
          o.hostel?.toLowerCase().includes(wardenSimulationHostel.code.toLowerCase())
        ),
        complaints: complaints.filter((c) =>
          c.hostel?.toLowerCase().includes(wardenSimulationHostel.code.toLowerCase())
        ),
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211747] text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
            Campus Residential Complexes
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
            {hostels.length} Hostels Active
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Directory
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setWardenSimulationHostel(hostels[2])} // BH-3 by default
            leftIcon={<Shield className="w-4 h-4 text-[#6633CC]" />}
          >
            Simulate Warden View
          </Button>
        </div>
      </div>

      {/* Warden Simulation Active Alert */}
      {wardenSimulationHostel && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-[#6633CC]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6633CC] text-white flex items-center justify-center font-bold flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#211747]">
                Active Warden Perspective: {wardenSimulationHostel.code} ({wardenSimulationHostel.wardenName})
              </p>
              <p className="text-[11px] text-[#6B6780]">
                Viewing restricted data: {simulatedHostelData.orders.length} orders & {simulatedHostelData.complaints.length} complaints for this hostel
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWardenSimulationHostel(null)}
          >
            Exit Warden Mode
          </Button>
        </div>
      )}

      {/* Overview Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-[#6B6780]">Hostel Complexes</span>
          <p className="text-2xl font-black text-[#211747] mt-1">{hostels.length} Hostels</p>
          <span className="text-[10px] text-purple-600 font-semibold">6 Boys • 3 Girls</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-[#6B6780]">Total Room Capacity</span>
          <p className="text-2xl font-black text-[#211747] mt-1">{totalRooms.toLocaleString()} Rooms</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{totalOccupied.toLocaleString()} occupied</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-[#6B6780]">Total Residents</span>
          <p className="text-2xl font-black text-[#211747] mt-1">{totalCapacity.toLocaleString()}</p>
          <span className="text-[10px] text-[#8F8A9E]">Max university capacity</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E3F0] shadow-soft">
          <span className="text-[11px] font-bold text-[#6B6780]">Laundry Doorstep Hubs</span>
          <p className="text-2xl font-black text-[#6633CC] mt-1">3 Central Plants</p>
          <span className="text-[10px] text-[#F58220] font-semibold">100% daily coverage</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="sm:col-span-8">
          <Input
            placeholder="Search hostel by code (e.g. BH-3), complex name, or warden..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-1.5">
          {["all", "boys", "girls"].map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                genderFilter === g
                  ? "bg-[#6633CC] text-white shadow-sm"
                  : "bg-[#F5F4FA] text-[#6B6780] hover:text-[#211747]"
              }`}
            >
              {g === "all" ? "All Hostels" : `${g} Hostels`}
            </button>
          ))}
        </div>
      </div>

      {/* Hostels Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((hostel) => {
          const hostelOrders = orders.filter((o) =>
            o.hostel?.toLowerCase().includes(hostel.code.toLowerCase())
          );
          const occupancyRate = Math.round((hostel.occupiedRooms / hostel.totalRooms) * 100);

          return (
            <div
              key={hostel.code}
              className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft p-5 flex flex-col justify-between hover:border-[#6633CC]/40 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF8]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6633CC] flex items-center justify-center font-black text-sm">
                      {hostel.code}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#211747] leading-tight">
                        {hostel.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-[#8F8A9E]">
                        {hostel.gender} Hostel • {hostel.blocks} Residential Blocks
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      hostel.gender === "Boys"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {hostel.gender}
                  </span>
                </div>

                {/* Capacity & Occupancy Progress */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B6780]">Occupancy</span>
                    <span className="font-bold text-[#211747]">
                      {hostel.occupiedRooms} / {hostel.totalRooms} Rooms ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6633CC]"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Warden Info Card */}
                <div className="mt-3.5 p-3 rounded-2xl bg-[#FAF9FD] border border-[#E5E3F0]/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#8F8A9E] uppercase">
                      Chief Warden
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">On Duty</span>
                  </div>
                  <p className="font-bold text-[#211747]">{hostel.wardenName}</p>
                  <p className="text-[11px] text-[#6B6780] font-mono flex items-center gap-1.5 pt-0.5">
                    <Phone className="w-3 h-3 text-[#8F8A9E]" />
                    <span>{hostel.wardenPhone}</span>
                  </p>
                </div>

                {/* Laundry Logistics Info */}
                <div className="mt-3 space-y-1 text-xs text-[#4A4560]">
                  <p className="flex items-center justify-between">
                    <span className="text-[#8F8A9E]">Laundry Hub:</span>
                    <span className="font-semibold text-[#211747]">{hostel.laundryHub}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-[#8F8A9E]">Pickup Slot:</span>
                    <span className="font-semibold text-[#6633CC]">{hostel.pickupSlot}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-[#8F8A9E]">Staff Team:</span>
                    <span className="font-semibold text-[#211747] truncate max-w-[150px]">
                      {hostel.assignedStaff}
                    </span>
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#F0EDF8] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6633CC]">
                  {hostelOrders.length} Active Orders
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingHostel(hostel)}
                    className="p-1.5 rounded-lg text-[#6B6780] hover:text-[#211747] hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Edit hostel details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedHostel(hostel)}
                  >
                    Dossier
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: HOSTEL DOSSIER & WARDEN DETAILS */}
      {selectedHostel && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setSelectedHostel(null)} />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#6633CC] text-white flex items-center justify-center font-black text-lg">
                  {selectedHostel.code}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#211747]">{selectedHostel.name}</h3>
                  <p className="text-xs text-[#8F8A9E]">
                    {selectedHostel.gender} Complex • {selectedHostel.blocks} Residential Blocks
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedHostel(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]/60">
                <span className="text-[10px] font-bold text-[#8F8A9E] uppercase">Capacity</span>
                <p className="text-xs font-bold text-[#211747] mt-0.5">
                  {selectedHostel.capacity} Students
                </p>
              </div>
              <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]/60">
                <span className="text-[10px] font-bold text-[#8F8A9E] uppercase">Occupied</span>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  {selectedHostel.occupiedRooms} / {selectedHostel.totalRooms} Rooms
                </p>
              </div>
              <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]/60">
                <span className="text-[10px] font-bold text-[#8F8A9E] uppercase">Pickup Window</span>
                <p className="text-xs font-bold text-[#6633CC] mt-0.5">
                  {selectedHostel.pickupSlot}
                </p>
              </div>
              <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]/60">
                <span className="text-[10px] font-bold text-[#8F8A9E] uppercase">Assigned Plant</span>
                <p className="text-xs font-bold text-[#211747] mt-0.5">
                  {selectedHostel.laundryHub}
                </p>
              </div>
            </div>

            {/* Warden Details Card */}
            <div className="p-4 rounded-2xl border border-[#E5E3F0] bg-white space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#211747] uppercase tracking-wider">
                  Hostel Chief Warden
                </h4>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Authorized Warden
                </span>
              </div>
              <p className="text-sm font-bold text-[#211747]">{selectedHostel.wardenName}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[#4A4560]">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8F8A9E]" />
                  <span>{selectedHostel.wardenPhone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#8F8A9E]" />
                  <span>{selectedHostel.wardenEmail}</span>
                </p>
              </div>
            </div>

            {/* Assigned Staff Operations */}
            <div className="p-4 rounded-2xl border border-[#E5E3F0] bg-white space-y-2 text-xs">
              <h4 className="font-bold text-[#211747] uppercase tracking-wider">
                Assigned Laundry Staff Team
              </h4>
              <p className="text-[#4A4560] leading-relaxed">
                {selectedHostel.assignedStaff} are scheduled for daily room-to-room intake in this hostel.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F0EDF8]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWardenSimulationHostel(selectedHostel);
                  setSelectedHostel(null);
                }}
                leftIcon={<Shield className="w-4 h-4 text-[#6633CC]" />}
              >
                View as {selectedHostel.code} Warden
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingHostel(selectedHostel);
                    setSelectedHostel(null);
                  }}
                >
                  Edit Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedHostel(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 2: EDIT HOSTEL DETAILS */}
      {editingHostel && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setEditingHostel(null)} />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Edit Complex Records
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">
                  {editingHostel.code} - {editingHostel.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingHostel(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">Chief Warden Name</label>
                <input
                  type="text"
                  required
                  value={editingHostel.wardenName}
                  onChange={(e) =>
                    setEditingHostel({ ...editingHostel, wardenName: e.target.value })
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Warden Phone</label>
                  <input
                    type="text"
                    required
                    value={editingHostel.wardenPhone}
                    onChange={(e) =>
                      setEditingHostel({ ...editingHostel, wardenPhone: e.target.value })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#4A4560]">Warden Email</label>
                  <input
                    type="email"
                    required
                    value={editingHostel.wardenEmail}
                    onChange={(e) =>
                      setEditingHostel({ ...editingHostel, wardenEmail: e.target.value })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">Pickup Timing Window</label>
                <input
                  type="text"
                  value={editingHostel.pickupSlot}
                  onChange={(e) =>
                    setEditingHostel({ ...editingHostel, pickupSlot: e.target.value })
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#4A4560]">Assigned Laundry Staff Team</label>
                <input
                  type="text"
                  value={editingHostel.assignedStaff}
                  onChange={(e) =>
                    setEditingHostel({ ...editingHostel, assignedStaff: e.target.value })
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingHostel(null)}
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
