"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  Shield,
  Bell,
  Database,
  CheckCircle2,
  Sliders,
  Clock,
  Sparkles,
  Calendar,
  Building2,
  Wallet,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminSettingsPage() {
  const [maxWeight, setMaxWeight] = useState("15");
  const [monthlyAllowance, setMonthlyAllowance] = useState("1000");
  const [academicTerm, setAcademicTerm] = useState("Semester Fall 2026");
  const [pickupHours, setPickupHours] = useState("07:00 AM - 11:00 AM");
  const [deliveryHours, setDeliveryHours] = useState("04:00 PM - 08:30 PM");
  const [expressMultiplier, setExpressMultiplier] = useState("1.5");
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoAssignRunners, setAutoAssignRunners] = useState(true);
  const [allowOverweight, setAllowOverweight] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lpu_lms_admin_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.maxWeight) setMaxWeight(parsed.maxWeight);
        if (parsed.monthlyAllowance) setMonthlyAllowance(parsed.monthlyAllowance);
        if (parsed.academicTerm) setAcademicTerm(parsed.academicTerm);
        if (parsed.pickupHours) setPickupHours(parsed.pickupHours);
        if (parsed.deliveryHours) setDeliveryHours(parsed.deliveryHours);
        if (parsed.expressMultiplier) setExpressMultiplier(parsed.expressMultiplier);
        if (parsed.smsAlerts !== undefined) setSmsAlerts(parsed.smsAlerts);
        if (parsed.emailAlerts !== undefined) setEmailAlerts(parsed.emailAlerts);
        if (parsed.autoAssignRunners !== undefined) setAutoAssignRunners(parsed.autoAssignRunners);
        if (parsed.allowOverweight !== undefined) setAllowOverweight(parsed.allowOverweight);
      }
    } catch (e) {
      console.warn("Settings storage read failed", e);
    }
  }, []);

  const handleSaveSettings = (e) => {
    e?.preventDefault();
    const payload = {
      maxWeight,
      monthlyAllowance,
      academicTerm,
      pickupHours,
      deliveryHours,
      expressMultiplier,
      smsAlerts,
      emailAlerts,
      autoAssignRunners,
      allowOverweight,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("lpu_lms_admin_settings", JSON.stringify(payload));
    } catch (e) {
      console.warn("Settings save error", e);
    }
    setToastMsg("System settings saved and applied university-wide.");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none pb-12">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211747] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
            Central Operations Control
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
            Active Campus Policy
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSaveSettings}
          className="shadow-purple"
        >
          Save System Rules
        </Button>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3F0] shadow-soft space-y-6">
        {/* Section 1: Academic & Session Details */}
        <div>
          <h4 className="font-extrabold text-[#211747] text-base mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#6633CC]" />
            Academic Term & Operating Hours
          </h4>
          <p className="text-xs text-[#6B6780] mb-4">
            University hostel calendar parameters and daily staff dispatch schedules
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Current Academic Session"
              value={academicTerm}
              onChange={(e) => setAcademicTerm(e.target.value)}
            />
            <Input
              label="Doorstep Pickup Window"
              value={pickupHours}
              onChange={(e) => setPickupHours(e.target.value)}
            />
            <Input
              label="Room Delivery Window"
              value={deliveryHours}
              onChange={(e) => setDeliveryHours(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Quota & Limits */}
        <div className="pt-6 border-t border-[#F0EDF8]">
          <h4 className="font-extrabold text-[#211747] text-base mb-1 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            Student Quota & Booking Limits
          </h4>
          <p className="text-xs text-[#6B6780] mb-4">
            Subsidized hostel laundry limits per student account
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Max Clothes Weight per Order (Kg)"
              type="number"
              min="5"
              max="30"
              value={maxWeight}
              onChange={(e) => setMaxWeight(e.target.value)}
            />
            <Input
              label="Default Monthly Wallet Subsidy (₹)"
              type="number"
              min="200"
              max="5000"
              value={monthlyAllowance}
              onChange={(e) => setMonthlyAllowance(e.target.value)}
            />
            <Input
              label="Express Rush Delivery Multiplier"
              type="number"
              step="0.1"
              min="1.0"
              max="3.0"
              value={expressMultiplier}
              onChange={(e) => setExpressMultiplier(e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Notification & Runner Gateways */}
        <div className="pt-6 border-t border-[#F0EDF8]">
          <h4 className="font-extrabold text-[#211747] text-base mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#F58220]" />
            Automation & Notification Gateways
          </h4>
          <div className="space-y-3.5">
            <label className="flex items-center gap-3 cursor-pointer text-xs text-[#4A4560] font-medium p-3 rounded-2xl bg-[#FAF9FD] hover:bg-purple-50/50 transition-colors border border-[#E5E3F0]/60">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#6633CC] focus:ring-[#6633CC]/20"
              />
              <div>
                <span className="font-bold text-[#211747] block">SMS Notification Gateway</span>
                <span className="text-[11px] text-[#6B6780]">Send instant SMS text to students upon laundry collection and delivery dispatch</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-[#4A4560] font-medium p-3 rounded-2xl bg-[#FAF9FD] hover:bg-purple-50/50 transition-colors border border-[#E5E3F0]/60">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#6633CC] focus:ring-[#6633CC]/20"
              />
              <div>
                <span className="font-bold text-[#211747] block">University Email Digest Relay</span>
                <span className="text-[11px] text-[#6B6780]">Send order invoices and monthly statements to student official @lpu.in email addresses</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-[#4A4560] font-medium p-3 rounded-2xl bg-[#FAF9FD] hover:bg-purple-50/50 transition-colors border border-[#E5E3F0]/60">
              <input
                type="checkbox"
                checked={autoAssignRunners}
                onChange={(e) => setAutoAssignRunners(e.target.checked)}
                className="w-4 h-4 rounded text-[#6633CC] focus:ring-[#6633CC]/20"
              />
              <div>
                <span className="font-bold text-[#211747] block">Automatic Runner Dispatch</span>
                <span className="text-[11px] text-[#6B6780]">Automatically assign incoming hostel pickup requests to on-duty staff based on hostel wing</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
