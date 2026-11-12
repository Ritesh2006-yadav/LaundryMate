"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  X,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import ClientPortal from "@/components/common/ClientPortal";
import { useComplaints } from "@/hooks/useComplaints";
import { useAuth } from "@/context/AuthContext";

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" ||
      c.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#6B6780]">
            Track investigations, staff response notes and claim resolutions
          </span>
        </div>

        <Link href="/student/raise-complaint" className="self-start sm:self-auto">
          <Button variant="orange" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Raise New Complaint
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by Complaint ID, Category, or Request ID..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Grievances" },
            { id: "submitted", label: "Submitted" },
            { id: "under review", label: "Under Review" },
            { id: "investigation", label: "Investigation" },
            { id: "resolved", label: "Resolved" },
            { id: "rejected", label: "Rejected" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st.id
                  ? "bg-[#6633CC] text-white shadow-purple font-bold"
                  : "bg-white border border-[#E5E3F0] text-[#6B6780] hover:bg-gray-50"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
              <tr>
                <th className="py-3.5 px-6">Complaint ID</th>
                <th className="py-3.5 px-6">Complaint Type</th>
                <th className="py-3.5 px-6">Request ID</th>
                <th className="py-3.5 px-6">Submission Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Staff Response</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B6780] text-sm">
                    No complaints found matching this criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9FD]/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#6633CC]">
                      #{item.id}
                    </td>

                    <td className="py-4 px-6 font-semibold text-[#211747]">
                      {item.type}
                    </td>

                    <td className="py-4 px-6 text-[#6B6780]">
                      <Link
                        href={`/student/track-order/${item.orderId}`}
                        className="font-bold text-[#211747] hover:text-[#6633CC] flex items-center gap-1 group"
                      >
                        <span>#{item.orderId}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>

                    <td className="py-4 px-6 text-[#6B6780]">
                      <div>{item.date}</div>
                      {item.time && (
                        <div className="text-[10px] text-[#8F8A9E]">{item.time}</div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <Badge status={item.status} showDot />
                    </td>

                    <td className="py-4 px-6 text-xs text-[#4A4560] max-w-[220px]">
                      <p className="truncate font-medium">
                        {item.staffResponse || "Under review by Hub Inspector."}
                      </p>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedComplaint(item)}
                        className="px-4 py-1.5 rounded-xl border border-[#D3CEE8] text-xs font-semibold text-[#6633CC] hover:bg-[#6633CC] hover:text-white transition-all shadow-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Details & Resolution History Modal */}
      {selectedComplaint && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setSelectedComplaint(null)}
            />

            <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto my-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    Grievance Record
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Complaint #{selectedComplaint.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Overview Grid */}
              <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#6B6780]">Category:</span>
                  <p className="font-bold text-[#211747] text-sm mt-0.5">
                    {selectedComplaint.type}
                  </p>
                </div>

                <div>
                  <span className="text-[#6B6780]">Related Order:</span>
                  <p className="font-bold text-[#6633CC] text-sm mt-0.5">
                    #{selectedComplaint.orderId}
                  </p>
                </div>

                <div>
                  <span className="text-[#6B6780]">Lodged On:</span>
                  <p className="font-semibold text-[#211747] mt-0.5">
                    {selectedComplaint.date} ({selectedComplaint.time || "11:30 AM"})
                  </p>
                </div>

                <div>
                  <span className="text-[#6B6780]">Current Status:</span>
                  <div className="mt-0.5">
                    <Badge status={selectedComplaint.status} showDot />
                  </div>
                </div>
              </div>

              {/* Student Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                  Student Statement
                </span>
                <div className="p-3.5 rounded-xl bg-white border border-[#E5E3F0] text-xs text-[#211747] leading-relaxed">
                  "{selectedComplaint.description}"
                </div>
              </div>

              {/* Uploaded Evidence Image */}
              {selectedComplaint.evidenceUrl && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Uploaded Evidence Photo
                  </span>
                  <div className="relative w-32 h-32 rounded-2xl border border-[#E5E3F0] overflow-hidden bg-gray-50 shadow-sm">
                    <img
                      src={selectedComplaint.evidenceUrl}
                      alt="Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Staff Response Note */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1.5">
                <span className="text-xs font-bold text-[#6633CC] flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#6633CC]" />
                  Official Staff Response
                </span>
                <p className="text-xs text-[#211747] leading-relaxed font-medium">
                  {selectedComplaint.staffResponse ||
                    "Under review with Hub Inspector. CCTV footage sorting in progress."}
                </p>
              </div>

              {/* Resolution History Timeline */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                  Resolution Audit Timeline
                </span>
                <div className="space-y-3 pl-2">
                  {(selectedComplaint.resolutionHistory || [
                    {
                      stage: "Submitted",
                      time: `${selectedComplaint.date}, 11:30 AM`,
                      actor: "Student",
                      note: "Complaint submitted with image evidence.",
                    },
                  ]).map((hist, i) => (
                    <div key={i} className="relative flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#6633CC] mt-1.5 flex-shrink-0" />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#211747]">{hist.stage}</span>
                          <span className="text-[10px] text-[#8F8A9E]">{hist.time}</span>
                        </div>
                        <p className="text-[11px] text-[#6B6780] mt-0.5">
                          <span className="font-semibold text-[#4A4560]">{hist.actor}:</span>{" "}
                          {hist.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F0EDF8]">
                <Link href={`/student/track-order/${selectedComplaint.orderId}`}>
                  <Button variant="secondary" size="sm">
                    View Laundry Order
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Close Docket
                </Button>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
