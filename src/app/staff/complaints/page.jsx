'use client';
import { readApiResponse } from '@/lib/api-client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  Send,
  Image as ImageIcon,
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

export default function StaffComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Response modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [newStatus, setNewStatus] = useState('Resolved');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/complaints');
      const data = await readApiResponse(res);
      if (data.success) {
        setComplaints(data.data || []);
      }
    } catch (err) {
      console.error('Fetch complaints error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openRespondModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.staffResponse || '');
    setNewStatus(complaint.status === 'Open' ? 'In Progress' : complaint.status);
    setMessage('');
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) {
      setMessage('Please write a response message for the student.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint._id}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffResponse: responseText,
          status: newStatus,
        }),
      });

      const data = await readApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit response');
      }

      setMessage(`Response saved! Complaint marked as "${newStatus}".`);
      fetchComplaints();
      setTimeout(() => {
        setSelectedComplaint(null);
      }, 700);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filtered = complaints.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const matchId = c.complaintId.toLowerCase().includes(s);
      const matchOrder = c.order?.orderId?.toLowerCase().includes(s);
      const matchName = c.student?.name?.toLowerCase().includes(s);
      const matchReg = c.student?.registrationNumber?.toLowerCase().includes(s);
      return matchId || matchOrder || matchName || matchReg;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Complaint & Grievance Resolution Desk
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Investigate student complaints regarding missing items, wash quality, or late delivery and reply directly.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Complaint ID, Order ID, Student..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-gray-600">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
          >
            <option value="all">All Complaints</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <LoadingSpinner message="Loading student complaints..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No complaints matching"
          description="There are no student complaints currently matching this filter."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4 hover:border-gray-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-gray-900">
                    {c.complaintId}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                    {c.category}
                  </span>
                  {c.order && (
                    <span className="text-[11px] font-mono text-[#1b4332] font-semibold bg-[#e9f7ee] px-2 py-0.5 rounded">
                      Order: {c.order.orderId}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : c.status === 'In Progress'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Student details & Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                  <p className="font-bold text-gray-900">{c.student?.name}</p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Reg: {c.student?.registrationNumber}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Hostel: {c.student?.hostel} ({c.student?.block} - Rm {c.student?.roomNumber})
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Phone: {c.student?.phone || 'N/A'} · {c.student?.email}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-800">
                    <p className="font-bold text-gray-700 text-[11px] uppercase tracking-wide mb-1">
                      Student Issue Description:
                    </p>
                    <p>{c.description}</p>
                  </div>

                  {c.imageUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <ImageIcon size={14} className="text-gray-400" />
                      <a
                        href={c.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#1b4332] font-semibold hover:underline"
                      >
                        View Photo Evidence
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Reply & Actions */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {c.staffResponse ? (
                  <div className="flex-1 bg-[#e9f7ee] border border-[#b7e4c7] p-2.5 rounded-lg text-gray-800">
                    <span className="font-bold text-[#1b4332]">Staff Reply:</span>{' '}
                    {c.staffResponse}
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 font-medium">
                    ⚠️ No response sent to student yet.
                  </p>
                )}

                <button
                  onClick={() => openRespondModal(c)}
                  className="self-end sm:self-auto px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg font-semibold shadow-sm transition"
                >
                  {c.staffResponse ? 'Update Response' : 'Write Response & Resolve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Respond to Complaint ({selectedComplaint.complaintId})
                </h3>
                <p className="text-xs text-gray-500">
                  Student: {selectedComplaint.student?.name} · {selectedComplaint.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {message && (
              <p className="text-xs p-2 bg-[#e9f7ee] text-[#1b4332] rounded font-medium">
                {message}
              </p>
            )}

            <form onSubmit={handleRespond} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Update Complaint Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332] font-semibold"
                >
                  <option value="Open">Open (Pending Investigation)</option>
                  <option value="In Progress">In Progress (Staff investigating)</option>
                  <option value="Resolved">Resolved (Resolution provided)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Staff Official Response (Visible to Student)
                </label>
                <textarea
                  required
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Explain the findings, resolution, garment location, or credit applied..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg font-semibold transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Send Response to Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
