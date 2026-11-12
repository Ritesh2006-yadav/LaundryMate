"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, Search, ShieldCheck, Check, X, ExternalLink, Download } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ClientPortal from "@/components/common/ClientPortal";
import { useComplaints } from "@/hooks/useComplaints";

export default function AdminComplaintsPage() {
  const { complaints, updateComplaintStatus } = useComplaints();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [auditStatus, setAuditStatus] = useState("Resolved");
  const [auditNote, setAuditNote] = useState("Administrative review completed. Resolution approved.");

  const filtered = complaints.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      c.id.toLowerCase().includes(q) ||
      c.studentName?.toLowerCase().includes(q) ||
      c.type?.toLowerCase().includes(q) ||
      c.orderId?.toLowerCase().includes(q);

    const matchCategory =
      categoryFilter === "all" || (c.type && c.type.toLowerCase().includes(categoryFilter.toLowerCase()));

    const matchStatus =
      statusFilter === "all" || (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());

    return matchSearch && matchCategory && matchStatus;
  });

  const handleExportCSV = () => {
    const headers = ["Ticket ID", "Student Name", "Category", "Order ID", "Status", "Resolution Note"];
    const rows = filtered.map((c) => [
      c.id,
      `"${c.studentName}"`,
      `"${c.type}"`,
      c.orderId,
      c.status,
      `"${c.staffResponse || "Under review"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lpu_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAudit = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    updateComplaintStatus(
      selectedTicket.id,
      auditStatus,
      auditNote,
      "Dean / Operations Admin"
    );
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
            Grievance & Resolution Desk
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
            {filtered.length} {filtered.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E5E3F0] text-xs font-bold text-[#211747] hover:bg-gray-50 hover:border-[#6633CC]/30 transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#6633CC]" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="sm:col-span-6">
          <Input
            placeholder="Search tickets by ID, Student Name, Category, or Order ID..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] transition-colors"
          >
            <option value="all">All Issue Categories</option>
            <option value="Missing">Missing Clothes</option>
            <option value="Damage">Cloth Damage</option>
            <option value="Delay">Delayed Delivery</option>
            <option value="Quality">Washing Quality</option>
          </select>
        </div>
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] transition-colors"
          >
            <option value="all">All Ticket Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Investigation">In Investigation</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
              <tr>
                <th className="py-3.5 px-6 font-bold">Ticket ID</th>
                <th className="py-3.5 px-6 font-bold">Student</th>
                <th className="py-3.5 px-6 font-bold">Category</th>
                <th className="py-3.5 px-6 font-bold">Order ID</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold">Staff Response</th>
                <th className="py-3.5 px-6 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B6780] text-sm">
                    No grievance records found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF9FD]/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#6633CC]">#{c.id}</td>
                    <td className="py-4 px-6 font-semibold text-[#211747]">{c.studentName}</td>
                    <td className="py-4 px-6 text-xs text-[#4A4560] font-medium">{c.type}</td>
                    <td className="py-4 px-6 font-mono text-xs text-[#6633CC]">#{c.orderId}</td>
                    <td className="py-4 px-6">
                      <Badge status={c.status} showDot />
                    </td>
                    <td className="py-4 px-6 text-xs text-[#4A4560] max-w-[200px] truncate">
                      {c.staffResponse || "Under review by Hub staff."}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(c);
                          setAuditStatus(c.status || "Investigation");
                          setAuditNote(c.staffResponse || "Administrative review completed.");
                        }}
                      >
                        Audit Ticket
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Modal */}
      {selectedTicket && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setSelectedTicket(null)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    Administrative SLA Audit
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Ticket #{selectedTicket.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Resident:</span>
                  <span className="font-bold text-[#211747]">
                    {selectedTicket.studentName} ({selectedTicket.studentRegNo || "LPU Resident"})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Related Order:</span>
                  <span className="font-semibold text-[#6633CC]">
                    #{selectedTicket.orderId}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E5E3F0] text-[#4A4560] leading-relaxed">
                  "{selectedTicket.description}"
                </div>
                {selectedTicket.evidenceUrl && (
                  <div className="pt-2">
                    <span className="text-[10px] text-[#6B6780] block mb-1 font-semibold uppercase">
                      Evidence Attached:
                    </span>
                    <img
                      src={selectedTicket.evidenceUrl}
                      alt="Evidence"
                      className="w-20 h-20 rounded-xl object-cover border border-[#E5E3F0]"
                    />
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveAudit} className="space-y-4">
                <Select
                  label="Adjudicate Status"
                  options={["Submitted", "Under Review", "Investigation", "Resolved", "Rejected"]}
                  value={auditStatus}
                  onChange={(e) => setAuditStatus(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Administrative Decision & Resolution Note
                  </label>
                  <textarea
                    rows={3}
                    value={auditNote}
                    onChange={(e) => setAuditNote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] focus:ring-4 focus:ring-[#6633CC]/10 transition-all resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedTicket(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Adjudication
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
