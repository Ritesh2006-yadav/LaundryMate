"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Shield,
  Wallet,
  CheckCircle2,
  Save,
  PlusCircle,
  CreditCard,
  X,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ClientPortal from "@/components/common/ClientPortal";
import { useAuth } from "@/context/AuthContext";
import { getStoredStudents, saveStoredStudents } from "@/lib/supabase/authService";

export default function StudentProfilePage() {
  const { user, logout, updateUserProfile } = useAuth();
  const [phone, setPhone] = useState(user?.phone || "+91 81076 15285");
  const [blockRoom, setBlockRoom] = useState(user?.blockRoom || "A / 808");
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 1000);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [toastMsg, setToastMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever the authenticated user profile loads or refreshes
  useEffect(() => {
    if (user) {
      if (user.phone) setPhone(user.phone);
      if (user.blockRoom) setBlockRoom(user.blockRoom);
      if (user.walletBalance !== undefined) setWalletBalance(user.walletBalance);
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Split blockRoom into block and room if formatted
      const parts = blockRoom.split("/").map((p) => p.trim());
      const hostelBlock = parts[0] || user?.hostelBlock || "Block A";
      const roomNumber = parts[1] || user?.roomNumber || "808";

      if (updateUserProfile) {
        await updateUserProfile({
          phone,
          blockRoom,
          hostelBlock,
          roomNumber,
        });
      }

      // Also ensure local student storage is updated for offline resilience
      const allStudents = getStoredStudents();
      const updated = allStudents.map((s) =>
        s.regNo === user?.regNo || s.email === user?.email
          ? { ...s, phone, blockRoom, hostelBlock, roomNumber }
          : s
      );
      saveStoredStudents(updated);

      showToast("Profile details updated successfully.");
    } catch (err) {
      console.warn("Profile update error", err);
      showToast("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    const newBal = walletBalance + Number(topUpAmount);
    setWalletBalance(newBal);
    try {
      if (updateUserProfile) {
        await updateUserProfile({ walletBalance: newBal });
      }
      const allStudents = getStoredStudents();
      const updated = allStudents.map((s) =>
        s.regNo === user?.regNo || s.email === user?.email
          ? { ...s, walletBalance: newBal }
          : s
      );
      saveStoredStudents(updated);
      showToast(`₹${topUpAmount} added to laundry quota balance!`);
      setIsTopUpOpen(false);
    } catch (err) {
      console.warn("Top-up balance error", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none pb-12">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211747] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Resident Account • {user?.role || "Student"}
          </span>
          <span className="text-xs font-semibold text-[#6B6780] hidden sm:inline">
            Status: <span className="text-emerald-600 font-bold">Active</span> • Verified via Supabase
          </span>
        </div>

        <Button variant="danger" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* User Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3F0] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6633CC] to-[#8C52FF] text-white flex items-center justify-center font-extrabold text-2xl shadow-purple flex-shrink-0">
            {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : "AG")}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#211747]">
              {user?.name || "Akshay Gupta"}
            </h2>
            <p className="text-xs text-[#6B6780] mt-0.5">
              Registration Number:{" "}
              <span className="font-semibold text-[#211747]">
                {user?.regNo || "12413882"}
              </span>
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#6633CC] text-xs font-semibold mt-2.5">
              <Wallet className="w-3.5 h-3.5" />
              Laundry Balance: ₹{walletBalance}
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsTopUpOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4 text-[#6633CC]" />}
          className="text-xs"
        >
          Top-up Balance
        </Button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3F0] shadow-soft space-y-5">
        <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
          <h3 className="text-base font-extrabold text-[#211747]">
            Hostel Residence Information
          </h3>
          <span className="text-xs text-[#8F8A9E]">
            Contact info used for laundry pickup notifications
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            icon={User}
            value={user?.name || "Akshay Gupta"}
            disabled
          />
          <Input
            label="LPU Registration Number (Locked)"
            icon={Shield}
            value={user?.regNo || "12413882"}
            disabled
          />
          <Input
            label="Hostel Name (Locked)"
            icon={Building2}
            value={user?.hostel || "BH-5 (Boys Hostel 5)"}
            disabled
          />
          <Input
            label="Room / Block (Editable)"
            icon={MapPin}
            value={blockRoom}
            onChange={(e) => setBlockRoom(e.target.value)}
            required
          />
          <Input
            label="University Email (Locked)"
            icon={Mail}
            value={user?.email || "akshayguptaa19@gmail.com"}
            disabled
          />
          <Input
            label="Mobile Number (Editable)"
            icon={Phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-[#F0EDF8]">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="shadow-purple"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Top-up Balance Modal */}
      {isTopUpOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setIsTopUpOpen(false)} />

            <div className="relative w-full max-w-sm bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    Digital Quota Wallet
                  </span>
                  <h3 className="text-base font-extrabold text-[#211747]">
                    Recharge Laundry Balance
                  </h3>
                </div>
                <button
                  onClick={() => setIsTopUpOpen(false)}
                  className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTopUp} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">Recharge Amount (₹):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[200, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-2 rounded-xl border font-bold text-xs transition-all ${
                          topUpAmount === amt
                            ? "bg-[#6633CC] text-white border-[#6633CC]"
                            : "bg-[#F5F4FA] border-[#E5E3F0] text-[#211747]"
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-[#211747] space-y-1">
                  <span className="font-bold">New Balance After Top-up:</span>
                  <p className="text-lg font-black text-[#6633CC]">
                    ₹{walletBalance + Number(topUpAmount)}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#F0EDF8]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsTopUpOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Confirm Recharge
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
