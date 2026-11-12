"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  MessageSquare,
  X,
  ExternalLink,
  ShieldAlert,
  Tag,
  Camera,
  Upload,
  FileText,
  UserCheck,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  Check,
  Filter,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ClientPortal from "@/components/common/ClientPortal";
import { useComplaints } from "@/hooks/useComplaints";
import { useAuth } from "@/context/AuthContext";
import { COMPLAINT_TYPES } from "@/lib/constants";

export default function StaffComplaintsPage() {
  const { user } = useAuth();
  const {
    complaints,
    updateComplaintStatus,
    startInvestigation,
    addInternalNote,
    sendStaffResponse,
    recordMissingClothesDetails,
    recordDamagedClothesDetails,
    resolveComplaint,
    rejectComplaint,
  } = useComplaints();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Active complaint modal
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'workflow' | 'notes' | 'resolution' | 'timeline'

  // Image preview modal
  const [previewImage, setPreviewImage] = useState(null);

  // Missing clothes form state
  const [missingForm, setMissingForm] = useState({
    garmentType: "",
    color: "",
    brand: "",
    size: "M",
    bagTagId: "",
    investigationStatus: "Checking Hub Central Lost & Found Rack B",
    notes: "",
  });

  // Damaged clothes form state
  const [damageForm, setDamageForm] = useState({
    damageType: "Tear / Collar Seam Split",
    severity: "Moderate",
    affectedGarment: "",
    staffEvidenceUrl: "",
    staffInspectionNotes: "",
  });

  // Internal note form
  const [newInternalNote, setNewInternalNote] = useState("");

  // Official student response form
  const [officialResponse, setOfficialResponse] = useState("");

  // Resolution form state
  const [resolutionData, setResolutionData] = useState({
    resolutionType: "Laundry Quota Credit & Free Rewash",
    compensationAmount: 200,
    resolutionNote: "",
  });

  // Rejection form state
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState("");

  // Summary counts
  const totalCount = complaints.length;
  const investigationCount = complaints.filter(
    (c) => c.status === "Investigation" || c.status === "Under Investigation"
  ).length;
  const missingCount = complaints.filter(
    (c) => c.type === "Missing Clothes" && c.status !== "Resolved" && c.status !== "Rejected"
  ).length;
  const damageCount = complaints.filter(
    (c) => c.type === "Damaged Clothes" && c.status !== "Resolved" && c.status !== "Rejected"
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;
  const rejectedCount = complaints.filter((c) => c.status === "Rejected").length;

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studentRegNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      c.status.toLowerCase() === filterStatus.toLowerCase();

    const matchesType =
      filterType === "all" ||
      c.type.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenModal = (cmp) => {
    setActiveComplaint(cmp);
    setActiveTab(
      cmp.type === "Missing Clothes" || cmp.type === "Damaged Clothes"
        ? "workflow"
        : "details"
    );
    setOfficialResponse(cmp.staffResponse || "");
    setShowRejectBox(false);
    setRejectionReason("");
    setSuccessFeedback("");

    // Prepopulate missing clothes form if available
    if (cmp.missingGarmentDetails) {
      setMissingForm({
        garmentType: cmp.missingGarmentDetails.garmentType || "",
        color: cmp.missingGarmentDetails.color || "",
        brand: cmp.missingGarmentDetails.brand || "",
        size: cmp.missingGarmentDetails.size || "M",
        bagTagId: cmp.missingGarmentDetails.bagTagId || `TAG-${cmp.orderId}-01`,
        investigationStatus:
          cmp.missingGarmentDetails.investigationStatus ||
          "Checking Hub Central Lost & Found Rack B",
        notes: cmp.missingGarmentDetails.notes || "",
      });
    } else {
      setMissingForm({
        garmentType: "T-Shirt",
        color: "Black",
        brand: "Nike",
        size: "M",
        bagTagId: `TAG-${cmp.orderId}-01`,
        investigationStatus: "Checking Hub Central Lost & Found Rack B",
        notes: "",
      });
    }

    // Prepopulate damage form if available
    if (cmp.damageDetails) {
      setDamageForm({
        damageType: cmp.damageDetails.damageType || "Tear / Collar Seam Split",
        severity: cmp.damageDetails.severity || "Moderate",
        affectedGarment: cmp.damageDetails.affectedGarment || "",
        staffEvidenceUrl: cmp.damageDetails.staffEvidenceUrl || "",
        staffInspectionNotes: cmp.damageDetails.staffInspectionNotes || "",
      });
    } else {
      setDamageForm({
        damageType: "Tear / Collar Seam Split",
        severity: "Moderate",
        affectedGarment: "Shirt / Garment from Order #" + cmp.orderId,
        staffEvidenceUrl: cmp.evidenceUrl || "",
        staffInspectionNotes: "Inspection completed at Hub Quality Desk #2.",
      });
    }

    setResolutionData({
      resolutionType: "Laundry Quota Credit & Free Rewash",
      compensationAmount: 150,
      resolutionNote:
        cmp.resolutionDetails?.resolutionNote ||
        `Grievance addressed. Replacement garment quota of ₹150 credited to student account.`,
    });
  };

  const handleStartInvestigation = () => {
    if (!activeComplaint) return;
    const actor = user?.name || "Staff Rohit Kumar";
    startInvestigation(
      activeComplaint.id,
      actor,
      `Investigation commenced by Hub Inspector ${actor}. Physical rack sorting and CCTV audit underway.`
    );
    setSuccessFeedback("Investigation status started & student notified.");
    setTimeout(() => {
      // refresh active
      const refreshed = complaints.find((c) => c.id === activeComplaint.id);
      if (refreshed) setActiveComplaint(refreshed);
    }, 100);
  };

  const handleSaveMissingClothes = (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    const actor = user?.name || "Staff Rohit Kumar";
    recordMissingClothesDetails(
      activeComplaint.id,
      missingForm,
      `Garment Identified: ${missingForm.garmentType} (${missingForm.color}, ${missingForm.brand}) - ${missingForm.investigationStatus}`,
      actor
    );
    setSuccessFeedback("Missing garment details saved & student notified.");
  };

  const handleSaveDamageDetails = (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    const actor = user?.name || "Staff Rohit Kumar";
    recordDamagedClothesDetails(activeComplaint.id, damageForm, actor);
    setSuccessFeedback("Damage inspection details recorded & student notified.");
  };

  const handleAddInternalNote = (e) => {
    e.preventDefault();
    if (!activeComplaint || !newInternalNote.trim()) return;
    const author = user?.name || "Staff Rohit Kumar";
    addInternalNote(activeComplaint.id, author, newInternalNote.trim());
    setNewInternalNote("");
    setSuccessFeedback("Internal note logged securely.");
  };

  const handleSendResponse = (e) => {
    e.preventDefault();
    if (!activeComplaint || !officialResponse.trim()) return;
    const actor = user?.name || "Staff Rohit Kumar";
    sendStaffResponse(activeComplaint.id, officialResponse.trim(), actor);
    setSuccessFeedback("Official response dispatched to student.");
  };

  const handleResolve = (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    const actor = user?.name || "Staff Rohit Kumar";
    resolveComplaint(activeComplaint.id, resolutionData, actor);
    setSuccessFeedback("Complaint marked as RESOLVED & student notified.");
    setTimeout(() => setActiveComplaint(null), 1200);
  };

  const handleReject = (e) => {
    e.preventDefault();
    if (!activeComplaint || !rejectionReason.trim()) return;
    const actor = user?.name || "Staff Rohit Kumar";
    rejectComplaint(activeComplaint.id, rejectionReason.trim(), actor);
    setSuccessFeedback("Complaint marked as REJECTED & student notified.");
    setTimeout(() => setActiveComplaint(null), 1200);
  };

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Description & Operations Bar (No Duplicate Heading) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6633CC] flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Grievance Resolution Desk
              </span>
              <span className="text-xs text-[#8F8A9E]">• SLA: 24h Response</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A4560] mt-0.5">
              Audit missing garments, assess wash damage evidence, log CCTV findings and issue university quota credits
            </p>
          </div>
        </div>

        <Link href="/staff/dashboard" className="self-end sm:self-center flex-shrink-0">
          <Button variant="secondary" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* 6 Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft">
          <span className="text-xs font-semibold text-[#6B6780]">Total Filed</span>
          <p className="text-2xl font-black text-[#211747] mt-1">{totalCount}</p>
          <span className="text-[10px] text-[#8F8A9E]">All-time records</span>
        </div>

        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 shadow-soft">
          <span className="text-xs font-semibold text-amber-800">In Investigation</span>
          <p className="text-2xl font-black text-amber-900 mt-1">{investigationCount}</p>
          <span className="text-[10px] text-amber-700">Hub floor audit</span>
        </div>

        <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-200/80 shadow-soft">
          <span className="text-xs font-semibold text-[#6633CC]">Missing Clothes</span>
          <p className="text-2xl font-black text-[#211747] mt-1">{missingCount}</p>
          <span className="text-[10px] text-purple-700">Lost & found checks</span>
        </div>

        <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200/80 shadow-soft">
          <span className="text-xs font-semibold text-rose-800">Damage Claims</span>
          <p className="text-2xl font-black text-rose-900 mt-1">{damageCount}</p>
          <span className="text-[10px] text-rose-700">Tears / Press marks</span>
        </div>

        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 shadow-soft">
          <span className="text-xs font-semibold text-emerald-800">Resolved Cases</span>
          <p className="text-2xl font-black text-emerald-900 mt-1">{resolvedCount}</p>
          <span className="text-[10px] text-emerald-700">Credited / Settled</span>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 shadow-soft">
          <span className="text-xs font-semibold text-gray-700">Declined / Closed</span>
          <p className="text-2xl font-black text-gray-800 mt-1">{rejectedCount}</p>
          <span className="text-[10px] text-gray-500">With verified reason</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#E5E3F0] shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by Complaint ID (e.g. CMP-901), Student Name, Reg No, or Order #..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56">
            <Select
              options={["all", ...COMPLAINT_TYPES]}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "all", label: "All Statuses" },
            { id: "submitted", label: "Submitted" },
            { id: "under review", label: "Under Review" },
            { id: "investigation", label: "Investigation" },
            { id: "resolved", label: "Resolved" },
            { id: "rejected", label: "Rejected" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filterStatus === st.id
                  ? "bg-[#6633CC] text-white shadow-sm"
                  : "bg-[#F5F4FA] text-[#6B6780] hover:bg-gray-200/70"
              }`}
            >
              {st.label}
            </button>
          ))}
          {(searchTerm || filterStatus !== "all" || filterType !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setFilterType("all");
              }}
              className="text-[11px] text-[#6633CC] hover:underline font-bold ml-2 whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints Table & Records */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="p-5 border-b border-[#F0EDF8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-[#211747]">
              Active Grievance Inquiries
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
              {filtered.length} found
            </span>
          </div>
          <p className="text-xs text-[#8F8A9E] hidden sm:block">
            Click any row to open the full investigation workbench
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center text-[#6B6780] space-y-3">
            <ShieldAlert className="w-12 h-12 text-[#8F8A9E] mx-auto opacity-40" />
            <h4 className="font-bold text-base text-[#211747]">
              No complaints found
            </h4>
            <p className="text-xs max-w-sm mx-auto text-[#8F8A9E]">
              There are no student complaints matching your filter criteria. Try clearing filters or searching another keyword.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EDF8]">
            {filtered.map((cmp) => {
              const isMissing = cmp.type === "Missing Clothes";
              const isDamage = cmp.type === "Damaged Clothes";

              return (
                <div
                  key={cmp.id}
                  className="p-5 sm:p-6 hover:bg-[#FAF9FD] transition-all flex flex-col lg:flex-row items-start justify-between gap-5"
                >
                  {/* Left Column: Complaint Details */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-[#6633CC] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        #{cmp.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-[#211747] border border-[#E5E3F0]">
                        {cmp.type}
                      </span>
                      <Badge status={cmp.status} showDot />
                      <Link
                        href={`/student/track-order/${cmp.orderId}`}
                        className="text-xs font-bold text-[#F58220] hover:underline flex items-center gap-1"
                      >
                        Order #{cmp.orderId}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className="text-xs text-[#8F8A9E]">
                        • Filed {cmp.date} ({cmp.time || "11:30 AM"})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <h4 className="font-extrabold text-[#211747]">
                        {cmp.studentName}
                      </h4>
                      <span className="text-xs text-[#6B6780] font-mono bg-gray-100 px-2 py-0.5 rounded-md">
                        {cmp.studentRegNo || "LPU Student"}
                      </span>
                      <span className="text-xs text-[#8F8A9E]">
                        • {cmp.hostel || "Hostel"} ({cmp.roomBlock || "Room"})
                      </span>
                      {cmp.phone && (
                        <span className="text-xs text-[#6B6780]">
                          • {cmp.phone}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[#37324B] leading-relaxed bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F5]">
                      "{cmp.description}"
                    </p>

                    {/* Quick highlights for missing or damaged */}
                    {isMissing && cmp.missingGarmentDetails && (
                      <div className="flex flex-wrap items-center gap-2 text-xs bg-purple-50/70 border border-purple-200/80 p-2.5 rounded-xl">
                        <span className="font-bold text-[#6633CC]">
                          Garment Tag:
                        </span>
                        <span>
                          {cmp.missingGarmentDetails.garmentType} (
                          {cmp.missingGarmentDetails.color},{" "}
                          {cmp.missingGarmentDetails.brand})
                        </span>
                        <span className="text-[#8F8A9E]">|</span>
                        <span className="text-purple-800 font-semibold">
                          Status: {cmp.missingGarmentDetails.investigationStatus}
                        </span>
                      </div>
                    )}

                    {isDamage && cmp.damageDetails && (
                      <div className="flex flex-wrap items-center gap-2 text-xs bg-rose-50/70 border border-rose-200/80 p-2.5 rounded-xl">
                        <span className="font-bold text-rose-800">
                          Damage Finding:
                        </span>
                        <span>
                          {cmp.damageDetails.damageType} (Severity:{" "}
                          {cmp.damageDetails.severity})
                        </span>
                        <span className="text-[#8F8A9E]">|</span>
                        <span className="text-rose-700">
                          {cmp.damageDetails.affectedGarment}
                        </span>
                      </div>
                    )}

                    {cmp.staffResponse && (
                      <div className="text-xs text-[#211747] flex items-start gap-1.5 pt-1">
                        <span className="font-bold text-[#6633CC] whitespace-nowrap">
                          Latest Response:
                        </span>
                        <span className="text-[#4A4560] line-clamp-1">
                          {cmp.staffResponse}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Evidence & Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F0EDF8]">
                    {/* Evidence thumbnail */}
                    {cmp.evidenceUrl ? (
                      <div
                        onClick={() => setPreviewImage(cmp.evidenceUrl)}
                        className="group relative w-20 h-20 rounded-2xl border border-[#E5E3F0] overflow-hidden bg-gray-50 cursor-pointer shadow-soft hover:shadow-card transition-all flex-shrink-0"
                      >
                        <img
                          src={cmp.evidenceUrl}
                          alt="Student Evidence"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-[#211747]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-[10px] text-[#8F8A9E] text-center p-1 flex-shrink-0">
                        <Camera className="w-5 h-5 opacity-40 mb-1" />
                        No Photo
                      </div>
                    )}

                    {/* Action button */}
                    <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenModal(cmp)}
                        className="whitespace-nowrap shadow-purple"
                      >
                        Investigate & Resolve
                      </Button>
                      <button
                        onClick={() => handleOpenModal(cmp)}
                        className="text-[11px] font-bold text-[#6633CC] hover:underline text-center"
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 my-auto">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <span className="font-bold text-sm text-[#211747]">
                  Student Uploaded Evidence
                </span>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded-xl hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/5 rounded-2xl">
                <img
                  src={previewImage}
                  alt="Enlarged Evidence"
                  className="max-h-[65vh] w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* Full Investigation & Resolution Drawer/Modal */}
      {activeComplaint && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in">
            <div
              className="fixed inset-0"
              onClick={() => setActiveComplaint(null)}
            />

            <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#F0EDF8] bg-white sticky top-0 z-20 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Staff Investigation Desk
                  </span>
                  <Badge status={activeComplaint.status} showDot />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#211747]">
                  Ticket #{activeComplaint.id} • {activeComplaint.type}
                </h3>
                <p className="text-xs text-[#6B6780] mt-0.5">
                  Student:{" "}
                  <strong className="text-[#211747]">
                    {activeComplaint.studentName}
                  </strong>{" "}
                  ({activeComplaint.studentRegNo || "LPU Student"}) • Order #
                  {activeComplaint.orderId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveComplaint(null)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Success toast notification inside modal */}
            {successFeedback && (
              <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successFeedback}</span>
              </div>
            )}

            {/* Modal Tabs */}
            <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#F0EDF8] bg-[#FAF9FD] overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2.5 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "details"
                    ? "border-[#6633CC] text-[#6633CC]"
                    : "border-transparent text-[#6B6780] hover:text-[#211747]"
                }`}
              >
                1. Case Summary
              </button>

              <button
                onClick={() => setActiveTab("workflow")}
                className={`py-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "workflow"
                    ? "border-[#6633CC] text-[#6633CC]"
                    : "border-transparent text-[#6B6780] hover:text-[#211747]"
                }`}
              >
                <span>2. Specialized Audit</span>
                {activeComplaint.type === "Missing Clothes" && (
                  <span className="text-[10px] bg-purple-100 text-[#6633CC] px-1.5 py-0.2 rounded-full">
                    Missing
                  </span>
                )}
                {activeComplaint.type === "Damaged Clothes" && (
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full">
                    Damage
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`py-2.5 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "notes"
                    ? "border-[#6633CC] text-[#6633CC]"
                    : "border-transparent text-[#6B6780] hover:text-[#211747]"
                }`}
              >
                3. Internal Notes (
                {(activeComplaint.internalNotes || []).length})
              </button>

              <button
                onClick={() => setActiveTab("resolution")}
                className={`py-2.5 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "resolution"
                    ? "border-[#6633CC] text-[#6633CC]"
                    : "border-transparent text-[#6B6780] hover:text-[#211747]"
                }`}
              >
                4. Resolve & Respond
              </button>

              <button
                onClick={() => setActiveTab("timeline")}
                className={`py-2.5 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "timeline"
                    ? "border-[#6633CC] text-[#6633CC]"
                    : "border-transparent text-[#6B6780] hover:text-[#211747]"
                }`}
              >
                5. Audit History
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* TAB 1: CASE SUMMARY */}
              {activeTab === "details" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] text-xs space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                        Student Profile
                      </span>
                      <p className="font-extrabold text-sm text-[#211747]">
                        {activeComplaint.studentName}
                      </p>
                      <p className="text-[#6B6780]">
                        Reg No:{" "}
                        <span className="font-mono font-semibold text-[#211747]">
                          {activeComplaint.studentRegNo || "LPU12345678"}
                        </span>
                      </p>
                      <p className="text-[#6B6780]">
                        Hostel:{" "}
                        <span className="font-semibold text-[#211747]">
                          {activeComplaint.hostel || "BH-3 (Boys Hostel 3)"}
                        </span>
                      </p>
                      <p className="text-[#6B6780]">
                        Room:{" "}
                        <span className="font-semibold text-[#211747]">
                          {activeComplaint.roomBlock || "B-32 / 210"}
                        </span>
                      </p>
                      <p className="text-[#6B6780]">
                        Contact:{" "}
                        <span className="font-semibold text-[#211747]">
                          {activeComplaint.phone || "+91 98765 43210"}
                        </span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] text-xs space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#F58220]">
                        Laundry Order Reference
                      </span>
                      <p className="font-extrabold text-sm text-[#211747]">
                        Order #{activeComplaint.orderId}
                      </p>
                      <p className="text-[#6B6780]">
                        Complaint Type:{" "}
                        <span className="font-bold text-[#6633CC]">
                          {activeComplaint.type}
                        </span>
                      </p>
                      <p className="text-[#6B6780]">
                        Date Filed:{" "}
                        <span className="font-semibold text-[#211747]">
                          {activeComplaint.date} ({activeComplaint.time || "11:30 AM"})
                        </span>
                      </p>
                      <p className="text-[#6B6780]">
                        Current State:{" "}
                        <span className="font-bold text-[#211747]">
                          {activeComplaint.status}
                        </span>
                      </p>
                      <div className="pt-1">
                        <Link
                          href={`/student/track-order/${activeComplaint.orderId}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#6633CC] hover:underline"
                        >
                          View Order Timeline & Clothes List
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Student Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4A4560]">
                      Student Statement & Description
                    </label>
                    <div className="p-4 rounded-2xl bg-white border border-[#E5E3F0] text-sm text-[#211747] leading-relaxed shadow-soft">
                      "{activeComplaint.description}"
                    </div>
                  </div>

                  {/* Evidence Viewer */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4A4560]">
                      Attached Evidence
                    </label>
                    {activeComplaint.evidenceUrl ? (
                      <div className="p-4 rounded-2xl border border-[#E5E3F0] bg-gray-50 flex items-center gap-4">
                        <div
                          onClick={() => setPreviewImage(activeComplaint.evidenceUrl)}
                          className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 cursor-pointer shadow-soft hover:shadow-card transition-all"
                        >
                          <img
                            src={activeComplaint.evidenceUrl}
                            alt="Evidence"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-[#211747]">
                            Student Photographic Proof
                          </p>
                          <p className="text-[#8F8A9E]">
                            High resolution uploaded from student intake/delivery check.
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPreviewImage(activeComplaint.evidenceUrl)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Expand High-Res Photo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl border border-dashed border-gray-300 text-center text-xs text-[#8F8A9E]">
                        No image evidence was attached by the student.
                      </div>
                    )}
                  </div>

                  {/* Quick Status Bar */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-[#211747]">
                        Current Resolution Stage: {activeComplaint.status}
                      </p>
                      <p className="text-[#6B6780]">
                        {activeComplaint.status === "Submitted"
                          ? "Move to Investigation to commence CCTV and hub lost & found search."
                          : "Audit in progress. Fill out the specialized forms or record resolution."}
                      </p>
                    </div>
                    {activeComplaint.status === "Submitted" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleStartInvestigation}
                      >
                        Start Investigation
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SPECIALIZED WORKFLOW */}
              {activeTab === "workflow" && (
                <div className="space-y-6">
                  {/* WORKFLOW 1: MISSING CLOTHES */}
                  {activeComplaint.type === "Missing Clothes" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-[#6633CC]">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[#211747] text-base">
                              Missing Garment Identification & Investigation
                            </h4>
                            <p className="text-xs text-[#8F8A9E]">
                              Record garment characteristics to match with hub lost-and-found bins
                            </p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleSaveMissingClothes} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              Garment Type *
                            </label>
                            <input
                              type="text"
                              value={missingForm.garmentType}
                              onChange={(e) =>
                                setMissingForm({
                                  ...missingForm,
                                  garmentType: e.target.value,
                                })
                              }
                              placeholder="e.g. Round Neck T-Shirt, Kurti, Jeans"
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              Color & Pattern *
                            </label>
                            <input
                              type="text"
                              value={missingForm.color}
                              onChange={(e) =>
                                setMissingForm({
                                  ...missingForm,
                                  color: e.target.value,
                                })
                              }
                              placeholder="e.g. Jet Black, Striped Blue, Maroon"
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              Brand / Label
                            </label>
                            <input
                              type="text"
                              value={missingForm.brand}
                              onChange={(e) =>
                                setMissingForm({
                                  ...missingForm,
                                  brand: e.target.value,
                                })
                              }
                              placeholder="e.g. Nike, Levi's, Peter England"
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              Estimated Garment Size
                            </label>
                            <select
                              value={missingForm.size}
                              onChange={(e) =>
                                setMissingForm({
                                  ...missingForm,
                                  size: e.target.value,
                                })
                              }
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] bg-white"
                            >
                              <option value="XS">XS (Extra Small)</option>
                              <option value="S">S (Small)</option>
                              <option value="M">M (Medium)</option>
                              <option value="L">L (Large)</option>
                              <option value="XL">XL (Extra Large)</option>
                              <option value="XXL">XXL</option>
                              <option value="Free Size">Free Size / Other</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              LPU Laundry Tag Barcode
                            </label>
                            <input
                              type="text"
                              value={missingForm.bagTagId}
                              onChange={(e) =>
                                setMissingForm({
                                  ...missingForm,
                                  bagTagId: e.target.value,
                                })
                              }
                              placeholder="e.g. TAG-1054-03"
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm font-mono text-[#211747] focus:outline-none focus:border-[#6633CC]"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              Investigation Status *
                            </label>
                            <select
                              value={missingForm.investigationStatus}
                              onChange={(e) =>
                                setMissingForm({
                                  ...missingForm,
                                  investigationStatus: e.target.value,
                                })
                              }
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] bg-white font-medium"
                            >
                              <option value="Checking Hub Central Lost & Found Rack B">
                                Checking Hub Central Lost & Found Rack B
                              </option>
                              <option value="Found in Lost & Found Rack (Ready for Student Claim)">
                                Found in Lost & Found Rack (Ready for Claim)
                              </option>
                              <option value="CCTV Verified: Traced to Next Shift Basket">
                                CCTV Verified: Traced to Next Shift Basket
                              </option>
                              <option value="Untraced after 3 Hub Sweeps (Eligible for Compensation)">
                                Untraced after 3 Sweeps (Eligible for Compensation)
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button type="submit" variant="primary" size="sm">
                            Save Garment Identification & Notify Student
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* WORKFLOW 2: DAMAGED CLOTHES */}
                  {activeComplaint.type === "Damaged Clothes" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[#211747] text-base">
                              Damage Inspection & Staff Evidence Upload
                            </h4>
                            <p className="text-xs text-[#8F8A9E]">
                              Document physical wear, tear, or wash damage with staff photo proof
                            </p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleSaveDamageDetails} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              Damage Classification *
                            </label>
                            <select
                              value={damageForm.damageType}
                              onChange={(e) =>
                                setDamageForm({
                                  ...damageForm,
                                  damageType: e.target.value,
                                })
                              }
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] bg-white font-medium"
                            >
                              <option value="Tear / Collar Seam Split">
                                Tear / Collar Seam Split
                              </option>
                              <option value="Thermal / Press Burn Mark">
                                Thermal / Press Burn Mark
                              </option>
                              <option value="Color Bleed / Chemical Stain">
                                Color Bleed / Chemical Stain
                              </option>
                              <option value="Button / Zipper Loss or Breakage">
                                Button / Zipper Loss or Breakage
                              </option>
                              <option value="Fabric Shrinkage / Distortion">
                                Fabric Shrinkage / Distortion
                              </option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              Damage Severity *
                            </label>
                            <select
                              value={damageForm.severity}
                              onChange={(e) =>
                                setDamageForm({
                                  ...damageForm,
                                  severity: e.target.value,
                                })
                              }
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] bg-white font-medium"
                            >
                              <option value="Minor (Repairable in-house)">
                                Minor (Repairable in-house)
                              </option>
                              <option value="Moderate (Requires Tailoring Stitch)">
                                Moderate (Requires Tailoring Stitch)
                              </option>
                              <option value="Severe (Fabric Ruined)">
                                Severe (Fabric Ruined)
                              </option>
                              <option value="Pre-existing Wear (Normal usage)">
                                Pre-existing Wear (Normal usage)
                              </option>
                            </select>
                          </div>

                          <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              Affected Garment Description *
                            </label>
                            <input
                              type="text"
                              value={damageForm.affectedGarment}
                              onChange={(e) =>
                                setDamageForm({
                                  ...damageForm,
                                  affectedGarment: e.target.value,
                                })
                              }
                              placeholder="e.g. Formal Sky Blue Shirt (Peter England) or Denim Jeans"
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                              required
                            />
                          </div>

                          <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              Staff Inspection Photo Evidence URL / Camera Capture
                            </label>
                            <input
                              type="text"
                              value={damageForm.staffEvidenceUrl}
                              onChange={(e) =>
                                setDamageForm({
                                  ...damageForm,
                                  staffEvidenceUrl: e.target.value,
                                })
                              }
                              placeholder="https://... or upload local inspection snapshot"
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                            />
                          </div>

                          <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4A4560]">
                              Hub Quality Inspector Notes *
                            </label>
                            <textarea
                              rows={2}
                              value={damageForm.staffInspectionNotes}
                              onChange={(e) =>
                                setDamageForm({
                                  ...damageForm,
                                  staffInspectionNotes: e.target.value,
                                })
                              }
                              placeholder="Explain inspection finding e.g. Collar threading unraveled under roller tension; eligible for university tailoring repair."
                              className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] resize-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button type="submit" variant="primary" size="sm">
                            Save Damage Assessment & Update Student
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* General complaints fallback */}
                  {activeComplaint.type !== "Missing Clothes" &&
                    activeComplaint.type !== "Damaged Clothes" && (
                      <div className="p-8 text-center text-[#6B6780] space-y-3">
                        <FileText className="w-10 h-10 text-[#8F8A9E] mx-auto" />
                        <h4 className="font-bold text-[#211747]">
                          Standard Inquiry Workflow
                        </h4>
                        <p className="text-xs max-w-md mx-auto text-[#8F8A9E]">
                          This complaint is filed under "{activeComplaint.type}". You can add internal notes or proceed directly to Tab 4 (Resolve & Respond).
                        </p>
                      </div>
                    )}
                </div>
              )}

              {/* TAB 3: INTERNAL STAFF NOTES */}
              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
                    <div>
                      <h4 className="font-extrabold text-[#211747] text-base">
                        Staff Confidential Notes
                      </h4>
                      <p className="text-xs text-[#8F8A9E]">
                        Internal notes are for hub supervisors only and never displayed to the student.
                      </p>
                    </div>
                  </div>

                  {/* Existing internal notes */}
                  <div className="space-y-2">
                    {(activeComplaint.internalNotes || []).length === 0 ? (
                      <p className="text-xs text-[#8F8A9E] italic p-4 text-center border border-dashed rounded-2xl">
                        No internal notes recorded yet.
                      </p>
                    ) : (
                      activeComplaint.internalNotes.map((note) => (
                        <div
                          key={note.id || note.time}
                          className="p-3.5 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#211747]">
                              {note.author}
                            </span>
                            <span className="text-[#8F8A9E] text-[10px]">
                              {note.time}
                            </span>
                          </div>
                          <p className="text-[#4A4560] leading-relaxed">
                            {note.note}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add new internal note */}
                  <form onSubmit={handleAddInternalNote} className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-[#4A4560]">
                      Add Supervisor / Operator Note
                    </label>
                    <textarea
                      rows={2}
                      value={newInternalNote}
                      onChange={(e) => setNewInternalNote(e.target.value)}
                      placeholder="e.g. CCTV shift log examined: Washer #4 intake operator confirmed 6 items inside the mesh bag."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        disabled={!newInternalNote.trim()}
                      >
                        Save Internal Note
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: RESOLVE & RESPOND */}
              {activeTab === "resolution" && (
                <div className="space-y-6">
                  {/* Send response section */}
                  <form onSubmit={handleSendResponse} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#4A4560]">
                        Official Message to Student (Push Notification)
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={officialResponse}
                      onChange={(e) => setOfficialResponse(e.target.value)}
                      placeholder="e.g. Your missing shirt was located in Lost & Found Rack B. Please collect with your LPU ID."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        disabled={!officialResponse.trim()}
                      >
                        Send Update to Student
                      </Button>
                    </div>
                  </form>

                  {/* Final Decision Section: Resolve OR Reject */}
                  <div className="pt-4 border-t border-[#F0EDF8] space-y-4">
                    <h4 className="font-extrabold text-[#211747] text-base">
                      Final Ticket Disposition
                    </h4>

                    {!showRejectBox ? (
                      <form onSubmit={handleResolve} className="space-y-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Mark as Resolved
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowRejectBox(true)}
                            className="text-xs text-rose-700 hover:underline font-bold"
                          >
                            Need to Decline Instead?
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="flex flex-col gap-1">
                            <label className="font-semibold text-emerald-900">
                              Resolution Remedy / Method
                            </label>
                            <select
                              value={resolutionData.resolutionType}
                              onChange={(e) =>
                                setResolutionData({
                                  ...resolutionData,
                                  resolutionType: e.target.value,
                                })
                              }
                              className="px-3 py-2 rounded-xl border border-emerald-300 text-xs bg-white text-[#211747]"
                            >
                              <option value="Garment Recovered & Handed Over">
                                Garment Recovered & Handed Over
                              </option>
                              <option value="Laundry Quota Credit & Free Rewash">
                                Laundry Quota Credit & Free Rewash
                              </option>
                              <option value="In-house Tailoring & Steam Re-press">
                                In-house Tailoring & Steam Re-press
                              </option>
                              <option value="Full Financial Reimbursement">
                                Full Financial Reimbursement
                              </option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="font-semibold text-emerald-900">
                              Compensation Amount (₹)
                            </label>
                            <input
                              type="number"
                              value={resolutionData.compensationAmount}
                              onChange={(e) =>
                                setResolutionData({
                                  ...resolutionData,
                                  compensationAmount: Number(e.target.value),
                                })
                              }
                              className="px-3 py-2 rounded-xl border border-emerald-300 text-xs bg-white text-[#211747] font-bold"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 text-xs">
                          <label className="font-semibold text-emerald-900">
                            Resolution Summary Note *
                          </label>
                          <textarea
                            rows={2}
                            value={resolutionData.resolutionNote}
                            onChange={(e) =>
                              setResolutionData({
                                ...resolutionData,
                                resolutionNote: e.target.value,
                              })
                            }
                            placeholder="State exact resolution terms e.g. Garment restored and ₹150 laundry balance credited."
                            className="px-3 py-2 rounded-xl border border-emerald-300 text-xs bg-white text-[#211747] resize-none"
                            required
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Confirm & Close Ticket as Resolved
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleReject} className="space-y-4 p-5 rounded-2xl bg-rose-50/50 border border-rose-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            Decline / Reject Complaint
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowRejectBox(false)}
                            className="text-xs text-emerald-700 hover:underline font-bold"
                          >
                            Back to Resolve
                          </button>
                        </div>

                        <div className="flex flex-col gap-1 text-xs">
                          <label className="font-semibold text-rose-900">
                            Mandatory Rejection Justification *
                          </label>
                          <textarea
                            rows={3}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. CCTV verified 6 items received and 6 items returned; garment in question was not in the intake manifest."
                            className="px-3 py-2 rounded-xl border border-rose-300 text-xs bg-white text-[#211747] resize-none"
                            required
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            variant="danger"
                            size="sm"
                            disabled={!rejectionReason.trim()}
                          >
                            Confirm Rejection & Notify Student
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: AUDIT HISTORY */}
              {activeTab === "timeline" && (
                <div className="space-y-4">
                  <div className="border-b border-[#F0EDF8] pb-3">
                    <h4 className="font-extrabold text-[#211747] text-base">
                      Resolution Audit Trail
                    </h4>
                    <p className="text-xs text-[#8F8A9E]">
                      Immutable chronological log of all interactions and status transitions
                    </p>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E3F0]">
                    {(activeComplaint.resolutionHistory || []).map((step, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-[#6633CC] shadow-sm flex items-center justify-center" />
                        <div className="p-3.5 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#6633CC]">
                              {step.stage}
                            </span>
                            <span className="text-[#8F8A9E] text-[10px]">
                              {step.time}
                            </span>
                          </div>
                          <p className="font-semibold text-[#211747]">
                            Action by: {step.actor}
                          </p>
                          <p className="text-[#4A4560] leading-relaxed">
                            {step.note}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#F0EDF8] bg-[#FAF9FD] flex items-center justify-between">
              <span className="text-xs text-[#8F8A9E]">
                Logged in as: <strong>{user?.name || "Staff Rohit Kumar"}</strong>
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveComplaint(null)}
              >
                Close Panel
              </Button>
            </div>
          </div>
        </div>
      </ClientPortal>
      )}
    </div>
  );
}
