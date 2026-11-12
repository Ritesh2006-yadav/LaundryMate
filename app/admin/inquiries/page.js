"use client";

import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ArrowUpDown,
  Mail,
  User,
  Building2,
  Calendar,
  MessageSquare,
  FileText,
  X,
  Send,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ClientPortal from "@/components/common/ClientPortal";
import { useInquiries } from "@/hooks/useInquiries";

export default function AdminInquiriesPage() {
  const { inquiries, loading, updateInquiryStatus, metrics, fetchInquiries } = useInquiries();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal State
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [modalStatus, setModalStatus] = useState("New");
  const [modalAdminNotes, setModalAdminNotes] = useState("");
  const [modalAdminResponse, setModalAdminResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleOpenModal = (inquiry) => {
    setActiveInquiry(inquiry);
    setModalStatus(inquiry.status);
    setModalAdminNotes(inquiry.adminNotes || "");
    setModalAdminResponse(inquiry.adminResponse || "");
  };

  const handleCloseModal = () => {
    setActiveInquiry(null);
  };

  const handleSaveModal = async () => {
    if (!activeInquiry) return;
    setSaving(true);
    try {
      const res = await updateInquiryStatus(
        activeInquiry.id,
        modalStatus,
        modalAdminNotes,
        modalAdminResponse
      );
      if (res.success) {
        showToast(`Inquiry ${activeInquiry.id} updated to "${modalStatus}"`);
        handleCloseModal();
      } else {
        showToast(res.error || "Failed to update inquiry");
      }
    } catch (e) {
      showToast("Error updating inquiry");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter and Sort inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries
      .filter((item) => {
        const matchesStatus =
          statusFilter === "all" ||
          item.status.toLowerCase() === statusFilter.toLowerCase();

        const matchesCategory =
          categoryFilter === "all" ||
          item.category.toLowerCase() === categoryFilter.toLowerCase();

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.id.toLowerCase().includes(q) ||
          item.fullName.toLowerCase().includes(q) ||
          item.emailOrReg.toLowerCase().includes(q) ||
          item.hostelResidence.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q) ||
          (item.subject && item.subject.toLowerCase().includes(q));

        return matchesStatus && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [inquiries, searchQuery, statusFilter, categoryFilter, sortOrder]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return <Badge variant="warning" size="sm">New Inquiry</Badge>;
      case "In Progress":
        return <Badge variant="info" size="sm">Under Review</Badge>;
      case "Resolved":
        return <Badge variant="success" size="sm">Resolved</Badge>;
      case "Closed":
        return <Badge variant="neutral" size="sm">Closed</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#211747] text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6633CC] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#211747]">
            {metrics.total}
          </div>
          <p className="text-[11px] text-[#8F8A9E] mt-1">All registered campus inquiries</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              New / Unreviewed
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900">
            {metrics.new}
          </div>
          <p className="text-[11px] text-amber-700/80 mt-1">Awaiting administrative triage</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#211747]">
            {metrics.inProgress}
          </div>
          <p className="text-[11px] text-[#8F8A9E] mt-1">Under hub supervisory check</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
              Resolved & Closed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {metrics.resolved + metrics.closed}
          </div>
          <p className="text-[11px] text-[#8F8A9E] mt-1">Answered and completed</p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID (#INQ-...), sender name, registration, hostel, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E3F0] text-xs sm:text-sm text-[#211747] placeholder-gray-400 focus:outline-none focus:border-[#6633CC] transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] transition-colors cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Pickup & Delivery Schedule">Pickup & Delivery</option>
              <option value="Laundry Quota / Pricing">Quota & Pricing</option>
              <option value="Special Fabric Care">Special Care</option>
              <option value="System / Account Help">System / Account</option>
              <option value="Feedback / Suggestion">Feedback</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="px-3 py-2.5 rounded-xl border border-[#E5E3F0] text-xs font-semibold text-[#211747] hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#6633CC]" />
              <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
            </button>

            <button
              onClick={() => fetchInquiries()}
              className="p-2.5 rounded-xl border border-[#E5E3F0] text-gray-500 hover:text-[#6633CC] hover:bg-purple-50 transition-colors cursor-pointer"
              title="Refresh Inquiries"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#6633CC]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-gray-100 pt-2.5">
          {[
            { id: "all", label: `All (${metrics.total})` },
            { id: "New", label: `New (${metrics.new})` },
            { id: "In Progress", label: `In Progress (${metrics.inProgress})` },
            { id: "Resolved", label: `Resolved (${metrics.resolved})` },
            { id: "Closed", label: `Closed (${metrics.closed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter.toLowerCase() === tab.id.toLowerCase()
                  ? "bg-[#6633CC] text-white shadow-xs"
                  : "bg-gray-50 text-[#4A4560] hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries List Table */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#6633CC] flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#211747] text-base">No Inquiries Found</h4>
            <p className="text-xs text-[#8F8A9E] max-w-sm mx-auto">
              No inquiries match your current search and filter criteria. Try clearing filters or search terms.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                onClick={() => handleOpenModal(inquiry)}
                className="p-4 sm:p-5 hover:bg-[#F9F8FD] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left: Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#6633CC] bg-[#6633CC]/10 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <span>{inquiry.id}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(inquiry.id, e)}
                        className="hover:text-purple-900 transition-colors"
                        title="Copy ID"
                      >
                        {copiedId === inquiry.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-purple-400" />
                        )}
                      </button>
                    </span>

                    {getStatusBadge(inquiry.status)}

                    <span className="text-[11px] font-semibold text-[#8F8A9E] bg-gray-100 px-2 py-0.5 rounded-md">
                      {inquiry.category}
                    </span>

                    <span className="text-[11px] text-[#8F8A9E] ml-auto sm:ml-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{inquiry.formattedDate}</span>
                    </span>
                  </div>

                  {/* Title / Subject */}
                  <div>
                    <h4 className="text-sm font-bold text-[#211747] group-hover:text-[#6633CC] transition-colors truncate">
                      {inquiry.subject || inquiry.category}
                    </h4>
                    <p className="text-xs text-[#6B6780] line-clamp-2 mt-0.5 leading-relaxed">
                      {inquiry.message}
                    </p>
                  </div>

                  {/* Sender Metadata */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-[#4A4560] pt-0.5">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{inquiry.fullName}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-gray-500">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{inquiry.emailOrReg}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-gray-500">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{inquiry.hostelResidence}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Review Action */}
                <div className="flex items-center gap-3 sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                  >
                    Review Inquiry
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review & Triage Modal (Viewport Centered via ClientPortal) */}
      {activeInquiry && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17112F]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E5E3F0] overflow-hidden my-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-[#E5E3F0] bg-gradient-to-r from-purple-50/50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6633CC]/10 text-[#6633CC] flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#6633CC]">
                        {activeInquiry.id}
                      </span>
                      {getStatusBadge(modalStatus)}
                    </div>
                    <h3 className="text-base font-bold text-[#211747] mt-0.5">
                      Review Contact Inquiry
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Sender Dossier Card */}
                <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 font-medium">Sender Name:</span>
                    <p className="font-bold text-[#211747] text-sm mt-0.5">{activeInquiry.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Reg No / Email:</span>
                    <p className="font-semibold text-[#211747] mt-0.5">{activeInquiry.emailOrReg}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Hostel Residence:</span>
                    <p className="font-semibold text-[#211747] mt-0.5">{activeInquiry.hostelResidence}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 font-medium">Inquiry Category:</span>
                    <p className="font-semibold text-[#6633CC] mt-0.5">{activeInquiry.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Submitted At:</span>
                    <p className="font-medium text-gray-700 mt-0.5">{activeInquiry.formattedDate}</p>
                  </div>
                </div>

                {/* Inquiry Message Box */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#211747] uppercase tracking-wider">
                    Inquiry Details & Message
                  </span>
                  {activeInquiry.subject && (
                    <p className="text-xs font-bold text-[#211747]">
                      Subject: <span className="font-normal text-gray-700">{activeInquiry.subject}</span>
                    </p>
                  )}
                  <div className="p-4 rounded-2xl bg-white border border-[#E5E3F0] shadow-2xs text-xs sm:text-sm text-[#211747] leading-relaxed whitespace-pre-wrap">
                    {activeInquiry.message}
                  </div>
                </div>

                {/* Status Triage Controls */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#211747] uppercase tracking-wider">
                    Update Inquiry Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { val: "New", label: "New / Open", color: "hover:border-amber-400" },
                      { val: "In Progress", label: "In Progress", color: "hover:border-blue-400" },
                      { val: "Resolved", label: "Mark Resolved", color: "hover:border-emerald-400" },
                      { val: "Closed", label: "Close Ticket", color: "hover:border-gray-400" },
                    ].map((st) => (
                      <button
                        key={st.val}
                        type="button"
                        onClick={() => setModalStatus(st.val)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          modalStatus === st.val
                            ? "bg-[#6633CC] text-white border-[#6633CC] shadow-xs"
                            : `bg-white text-[#4A4560] border-[#E5E3F0] ${st.color}`
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Internal Admin Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#211747] uppercase tracking-wider">
                    Internal Supervisory Notes <span className="text-gray-400 font-normal normal-case">(For operations staff audit trail)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={modalAdminNotes}
                    onChange={(e) => setModalAdminNotes(e.target.value)}
                    placeholder="Add internal notes on runner assignment, warden coordination, or route checks..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-xs text-[#211747] focus:outline-none focus:border-[#6633CC] transition-colors resize-none"
                  />
                </div>

                {/* Official Response */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#211747] uppercase tracking-wider">
                    Official Admin Resolution / Response <span className="text-gray-400 font-normal normal-case">(Recorded in ticket history)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={modalAdminResponse}
                    onChange={(e) => setModalAdminResponse(e.target.value)}
                    placeholder="Provide official resolution details or reply to the student..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-xs text-[#211747] focus:outline-none focus:border-[#6633CC] transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-[#E5E3F0] bg-gray-50 flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveModal}
                  disabled={saving}
                  leftIcon={saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                >
                  {saving ? "Saving Changes..." : "Save Status & Notes"}
                </Button>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}

