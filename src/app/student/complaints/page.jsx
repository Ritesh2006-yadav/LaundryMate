'use client';
import { readApiResponse } from '@/lib/api-client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  PlusCircle,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

const CATEGORIES = [
  'Missing Item',
  'Damaged Item',
  'Improper Wash',
  'Late Delivery',
  'Wrong Items',
  'Pricing Issue',
  'Staff Behavior',
  'Other',
];

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [category, setCategory] = useState('Missing Item');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, ordRes] = await Promise.all([
        fetch('/api/complaints'),
        fetch('/api/orders'),
      ]);
      const compData = await readApiResponse(compRes);
      const ordData = await readApiResponse(ordRes);

      if (compData.success) setComplaints(compData.data || []);
      if (ordData.success) setOrders(ordData.data || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await readApiResponse(res);
      if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
      setImageUrl(data.url);
    } catch (err) {
      setError(err.message || 'Image upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a complaint description');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          orderId: orderId || undefined,
          description,
          imageUrl,
        }),
      });

      const data = await readApiResponse(res);
      if (!res.ok || !data.success) throw new Error(data.message || 'Submission failed');

      setSuccess('Complaint lodged successfully! Staff has been notified.');
      setDescription('');
      setImageUrl('');
      setOrderId('');
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Error submitting complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Complaints & Grievances</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Report missing, damaged, or delayed laundry garments and view staff resolutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={() => {
              setShowModal(true);
              setError('');
              setSuccess('');
            }}
            className="inline-flex items-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <PlusCircle size={16} />
            <span>Report New Issue</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Fetching complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints filed"
          description="You do not have any registered complaints or unresolved issues."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#1b4332] text-white px-4 py-2 rounded-lg text-xs font-semibold"
            >
              Report an Issue
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs text-gray-900">
                    {c.complaintId}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                    {c.category}
                  </span>
                  {c.order && (
                    <span className="text-[11px] font-mono text-gray-500">
                      Ref: {c.order.orderId}
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
                    })}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-gray-700 leading-relaxed">
                <p className="font-medium text-gray-900 mb-1">Issue Description:</p>
                <p className="bg-gray-50 p-3 rounded-lg border border-gray-100">{c.description}</p>
              </div>

              {/* Optional Photo */}
              {c.imageUrl && (
                <div>
                  <p className="text-[11px] font-medium text-gray-500 mb-1">Photo Evidence:</p>
                  <img
                    src={c.imageUrl}
                    alt="Complaint evidence"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Staff Response */}
              {c.staffResponse ? (
                <div className="bg-[#e9f7ee] border border-[#b7e4c7] rounded-xl p-3.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#1b4332] mb-1">
                    <CheckCircle2 size={16} />
                    <span>Staff Response & Resolution:</span>
                  </div>
                  <p className="text-gray-800">{c.staffResponse}</p>
                  {c.resolvedAt && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      Resolved on {new Date(c.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <Clock size={14} className="text-amber-600" />
                  <span>Awaiting review and reply from laundry operations staff.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Report a Laundry Issue</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Complaint Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Associated Order (Optional)
                </label>
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                >
                  <option value="">None / General Issue</option>
                  {orders.map((o) => (
                    <option key={o._id} value={o.orderId}>
                      {o.orderId} — {new Date(o.createdAt).toLocaleDateString()} ({o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Describe the Issue
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe which garment was affected, color, tag, or what happened..."
                  className="w-full p-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Attach Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition">
                    <Upload size={14} />
                    <span>{uploading ? 'Uploading...' : 'Choose Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {imageUrl && (
                    <span className="text-xs text-emerald-700 font-medium">✓ Photo attached</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg shadow-sm transition disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
