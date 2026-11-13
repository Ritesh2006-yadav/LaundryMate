"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useComplaints } from "@/hooks/useComplaints";
import { useInventory } from "@/hooks/useInventory";

export default function AdminReportsPage() {
  const { orders } = useLaundryOrders();
  const { complaints } = useComplaints();
  const { getInventoryReport } = useInventory();
  const [toastMsg, setToastMsg] = useState("");

  const inventoryReport = getInventoryReport();
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDownloadReport = (title, type) => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (type === "orders") {
      csvContent += "Order ID,Student,Service,Items,Weight(kg),Status,Amount\n";
      orders.forEach((o) => {
        csvContent += `"${o.id}","${o.studentName}","${o.service}",${o.itemsCount || 0},${o.weightKg || 0},"${o.status}",${o.amount || 0}\n`;
      });
    } else if (type === "complaints") {
      csvContent += "Complaint ID,Student,Type,Status,Order ID,Description\n";
      complaints.forEach((c) => {
        csvContent += `"${c.id}","${c.studentName}","${c.type}","${c.status}","${c.orderId}","${c.description.replace(/"/g, '""')}"\n`;
      });
    } else {
      csvContent += `Report Title,${title}\n`;
      csvContent += `Generated At,${new Date().toLocaleString("en-GB")}\n`;
      csvContent += `Total Orders,${orders.length}\n`;
      csvContent += `Total Revenue (INR),${totalRevenue}\n`;
      csvContent += `Open Complaints,${complaints.filter((c) => c.status !== "Resolved").length}\n`;
      csvContent += `Inventory Asset Value,${inventoryReport.totalValuation}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Downloaded: ${title}`);
  };

  const reportsList = [
    {
      title: "November 2026 Monthly University Billing Reconciliation",
      type: "orders",
      period: "Monthly",
      desc: "Comprehensive order records with student laundry quota deductions and tariffs.",
    },
    {
      title: "Hostel Resident Grievance Resolution & SLA Performance Audit",
      type: "complaints",
      period: "Weekly",
      desc: "Turnaround logs, missing clothes claim investigations, and damage settlements.",
    },
    {
      title: "Chemical Supplies & Packaging Inventory Asset Valuation Statement",
      type: "inventory",
      period: "Quarterly",
      desc: "Detergent stock levels, consumption logs, and vendor procurement balances.",
    },
    {
      title: "University Doorstep Pickup & Fleet Turnaround Summary",
      type: "executive",
      period: "Real-time",
      desc: "Delivery performance and on-time SLA metrics across Boys and Girls Hostels.",
    },
  ];

  return (
    <div className="space-y-6 select-none pb-12">
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
            Auditing & Financial Compliance
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
            {reportsList.length} Standard Audits
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={() => handleDownloadReport("LPU_LMS_Master_Executive_Audit", "executive")}
          className="shadow-purple"
        >
          Download Master Executive Audit
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft">
          <span className="text-xs font-bold text-[#6B6780]">Total Revenue Logged</span>
          <p className="text-3xl font-black text-emerald-700 mt-1">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-[#8F8A9E]">{orders.length} Verified Orders</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft">
          <span className="text-xs font-bold text-[#6633CC]">Plant Inventory Assets</span>
          <p className="text-3xl font-black text-[#211747] mt-1">
            ₹{inventoryReport.totalValuation.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-[#8F8A9E]">Chemicals & Packaging</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft">
          <span className="text-xs font-bold text-rose-800">Grievance Claims Audited</span>
          <p className="text-3xl font-black text-rose-900 mt-1">
            {complaints.length} Tickets
          </p>
          <span className="text-[11px] text-rose-700">Resolution SLA: 96.4%</span>
        </div>
      </div>

      {/* Reports Directory */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft space-y-4">
        <h4 className="font-extrabold text-[#211747] text-base">
          Official Administrative Statements & Data Exports
        </h4>
        <div className="divide-y divide-[#F0EDF8]">
          {reportsList.map((rep, idx) => (
            <div
              key={idx}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9FD] transition-colors rounded-2xl px-3"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6633CC] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-[#211747]">{rep.title}</h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-[#6B6780]">
                      {rep.period}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6780] mt-0.5">{rep.desc}</p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() => handleDownloadReport(rep.title, rep.type)}
                className="whitespace-nowrap self-end sm:self-center text-xs"
              >
                Export CSV / Statement
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
