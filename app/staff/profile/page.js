"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  Briefcase,
  MapPin,
  Calendar,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

export default function StaffProfilePage() {
  const { user } = useAuth();

  // Staff Profile State
  const isStaffUser = user?.role === "staff";
  const [name, setName] = useState(isStaffUser ? user.name : "Rohit Kumar");
  const [staffId, setStaffId] = useState(isStaffUser ? (user.staffId || "STF-8821") : "STF-8821");
  const [email, setEmail] = useState(isStaffUser ? user.email : "rohit.laundry@lpu.co.in");
  const [phone, setPhone] = useState(isStaffUser ? (user.phone || "+91 98111 22334") : "+91 98111 22334");
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98765 43210");
  const [designation, setDesignation] = useState(
    "Senior Laundry Hub Specialist & Quality Control Lead"
  );
  const [assignedHub, setAssignedHub] = useState(
    "Central Laundry Complex - North Wing"
  );
  const [assignedZone, setAssignedZone] = useState("Boys Hostel BH-1 to BH-5 & GH-2");
  const [shiftTimings, setShiftTimings] = useState("Morning Shift: 07:00 AM - 04:00 PM");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none pb-8">
      {/* Top Profile Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3F0] shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6633CC] to-[#8C52FF] text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-purple-100">
              {(isStaffUser ? user?.avatar : null) || "RK"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#211747]">
                  {name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Active Staff
                </span>
              </div>
              <p className="text-xs font-medium text-[#6633CC] font-mono">
                Staff ID: {staffId}
              </p>
              <p className="text-xs text-[#6B6780]">
                {designation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-[#8F8A9E] uppercase tracking-wider block">Assigned Zone</span>
              <span className="text-xs font-bold text-[#211747]">{assignedZone}</span>
            </div>
          </div>
        </div>

        {/* Operational Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#F0EDF8]">
          <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]">
            <span className="text-[10px] text-[#6B6780] uppercase tracking-wider font-semibold block">Total Handled</span>
            <span className="text-lg font-black text-[#211747]">1,428 orders</span>
          </div>
          <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]">
            <span className="text-[10px] text-[#6B6780] uppercase tracking-wider font-semibold block">On-Time Dispatch</span>
            <span className="text-lg font-black text-emerald-600">99.4%</span>
          </div>
          <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]">
            <span className="text-[10px] text-[#6B6780] uppercase tracking-wider font-semibold block">Service Rating</span>
            <span className="text-lg font-black text-[#F58220]">4.9 / 5.0 ⭐</span>
          </div>
          <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0]">
            <span className="text-[10px] text-[#6B6780] uppercase tracking-wider font-semibold block">Current Shift</span>
            <span className="text-lg font-black text-[#6633CC]">07:00 - 16:00</span>
          </div>
        </div>
      </div>

      {/* Main Profile Form Card */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3F0] shadow-soft space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#211747]">
            Staff Personnel & Operational Details
          </h3>
          <p className="text-xs text-[#6B6780]">
            Manage your university contact channels and hub operational assignments
          </p>
        </div>

        {/* Personal Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-[#211747] rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-[#6633CC] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
              University Staff ID
            </label>
            <input
              type="text"
              disabled
              value={staffId}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-[#6B6780] rounded-xl border border-[#E5E3F0] bg-gray-50 outline-none cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-[#6B6780] rounded-xl border border-[#E5E3F0] bg-gray-50 outline-none cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
              Contact Phone Number *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-[#211747] rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-[#6633CC] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
              Emergency Contact Phone
            </label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-[#211747] rounded-xl border border-[#E5E3F0] focus:ring-2 focus:ring-[#6633CC] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
              Designation
            </label>
            <input
              type="text"
              disabled
              value={designation}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-[#6B6780] rounded-xl border border-[#E5E3F0] bg-gray-50 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {/* Operational Hub Information */}
        <div className="pt-4 border-t border-[#F0EDF8] space-y-4">
          <h4 className="text-sm font-bold text-[#211747]">
            Assigned Hub & Shift Schedule
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] space-y-1">
              <span className="text-[10px] text-[#8F8A9E] uppercase tracking-wider font-semibold block flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#6633CC]" />
                Primary Hub
              </span>
              <p className="font-bold text-xs text-[#211747]">{assignedHub}</p>
            </div>

            <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] space-y-1">
              <span className="text-[10px] text-[#8F8A9E] uppercase tracking-wider font-semibold block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F58220]" />
                Assigned Hostel Blocks
              </span>
              <p className="font-bold text-xs text-[#211747]">{assignedZone}</p>
            </div>

            <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] space-y-1">
              <span className="text-[10px] text-[#8F8A9E] uppercase tracking-wider font-semibold block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Shift Timing
              </span>
              <p className="font-bold text-xs text-[#211747]">{shiftTimings}</p>
            </div>

            <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#E5E3F0] space-y-1">
              <span className="text-[10px] text-[#8F8A9E] uppercase tracking-wider font-semibold block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Specialization
              </span>
              <p className="font-bold text-xs text-[#211747]">Wash Cycle Optimization & Steam Press</p>
            </div>
          </div>
        </div>

        {/* Submit & Status Feedback */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F0EDF8]">
          {savedSuccess ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
              <Check className="w-4 h-4 stroke-[3]" />
              Staff Profile Details Saved Successfully!
            </span>
          ) : (
            <span className="text-xs text-[#8F8A9E]">
              Fields marked with * can be updated directly.
            </span>
          )}

          <Button
            variant="primary"
            size="md"
            type="submit"
            leftIcon={<Save className="w-4 h-4" />}
            className="text-xs font-bold shadow-purple"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
