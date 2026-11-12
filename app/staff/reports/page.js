"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";

export default function StaffReportsPage() {
  const { orders } = useLaundryOrders();
  const [toastMsg, setToastMsg] = useState("");

  const completedToday = orders.filter(
    (o) => o.status === "Delivered" || o.status === "Completed"
  );
  const inProcessNow = orders.filter((o) =>
    ["In Washing", "In Drying", "Ironing", "Ready for Delivery"].includes(o.status)
  );

  const totalKg = orders.reduce((sum, o) => sum + (o.weightKg || 5), 0);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleExportShiftCSV = () => {
    let csv = "data:text/csv;charset=utf-8,";
    csv += "Order ID,Student Name,Service,Weight(kg),Pieces,Status,Hostel\n";
    orders.forEach((o) => {
      csv += `"${o.id}","${o.studentName}","${o.service}",${o.weightKg || 5},${o.itemsCount},"${o.status}","${o.roomBlock || ""}"\n`;
    });

    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.href = encoded;
    link.download = `lpu_laundry_shift_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded Shift Operational Report.");
  };

  return (
    <div className="space-y-6 select-none pb-12">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211747] text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
            Shift Operations Audit
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
            {orders.length} Shift Records
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportShiftCSV}
          className="shadow-purple"
        >
          Export Shift CSV
        </Button>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-[#211747] text-base">
            Today's Operational Summary ({new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })})
          </h2>
          <span className="text-xs font-bold text-[#6633CC] bg-purple-50 px-2.5 py-1 rounded-full">
            Active Shift: Morning
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0]">
            <span className="text-xs font-semibold text-[#8F8A9E]">Total Weight Washed</span>
            <p className="text-2xl font-black text-[#211747] mt-1">{totalKg} kg</p>
            <span className="text-[10px] text-[#8F8A9E]">Across all active batches</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0]">
            <span className="text-xs font-semibold text-emerald-800">Delivered Today</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {completedToday.length} Orders
            </p>
            <span className="text-[10px] text-emerald-600">Dispatched to hostellers</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0]">
            <span className="text-xs font-semibold text-[#6633CC]">Active on Floor</span>
            <p className="text-2xl font-black text-[#6633CC] mt-1">
              {inProcessNow.length} Orders
            </p>
            <span className="text-[10px] text-purple-700">Washing, Drying & Pressing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
