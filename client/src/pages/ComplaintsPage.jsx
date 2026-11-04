import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  User,
  ExternalLink,
  X,
  Send,
} from 'lucide-react';
import staffApi from '../api/staffApi';
import { ComplaintBadge } from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export const ComplaintsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get('status') || ''
  );
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active complaint modal for replying and resolving
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedStatus) params.status = selectedStatus;

      const res = await staffApi.getComplaints(params);
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStatus) {
      setSearchParams({ status: selectedStatus });
    } else {
      setSearchParams({});
    }
    fetchComplaints();
  }, [selectedStatus]);

  const handleOpenModal = (complaint) => {
    setActiveComplaint(complaint);
    setReplyText(complaint.staffResponse || '');
  };

  const handleCloseModal = () => {
    setActiveComplaint(null);
    setReplyText('');
  };

  const handleResolve = async (targetStatus = 'Resolved') => {
    if (!replyText.trim()) {
      alert('Please enter a response message for the student before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await staffApi.respondToComplaint(activeComplaint._id, {
        staffResponse: replyText.trim(),
        status: targetStatus,
      });

      if (res.success) {
        setComplaints((prev) =>
          prev.map((c) => (c._id === activeComplaint._id ? res.data : c))
        );
        handleCloseModal();
        setFeedbackMsg(`Complaint updated to "${targetStatus}"!`);
        setTimeout(() => setFeedbackMsg(''), 5000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Student Complaints
          </h1>
          <p className="text-gray-500 text-base mt-1">
            Review reported issues from students, provide replies, and mark them resolved.
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl self-start sm:self-auto">
          {['', 'Open', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`py-2 px-3.5 rounded-xl text-sm font-bold transition ${
                selectedStatus === st
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {st === '' ? 'All Cases' : st}
            </button>
          ))}
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-base shadow-sm">
          <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading student complaints..." />
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 font-semibold">
          {error}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No complaints found"
          description={
            selectedStatus
              ? `There are currently no complaints in "${selectedStatus}" status.`
              : 'There are no complaints registered in the system right now.'
          }
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((item) => (
            <div
              key={item._id}
              onClick={() => handleOpenModal(item)}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-gray-900 text-lg">
                    {item.complaintNumber}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {item.category}
                  </span>
                  <ComplaintBadge status={item.status} />
                </div>
                <span className="text-xs text-gray-500">
                  Reported {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-base text-gray-800 font-medium leading-relaxed">
                  “{item.description}”
                </p>
                <p className="text-sm text-gray-500">
                  Student: <strong className="text-gray-800">{item.student?.name}</strong> •{' '}
                  {item.student?.hostel}, {item.student?.block}, Room {item.student?.roomNumber}
                  {item.order && (
                    <span className="ml-2 font-mono text-gray-600">
                      (Order #{item.order?.orderNumber})
                    </span>
                  )}
                </p>
              </div>

              {item.staffResponse && (
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-sm space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Latest Staff Response
                  </p>
                  <p className="text-gray-700 font-medium">“{item.staffResponse}”</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                  Open complaint to reply & resolve →
                </span>
                {item.status === 'Resolved' && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={15} />
                    Resolved {item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPLAINT DETAIL & RESOLUTION MODAL */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {activeComplaint.complaintNumber}
                  </h3>
                  <ComplaintBadge status={activeComplaint.status} />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Category: <strong>{activeComplaint.category}</strong>
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Student & Order Reference */}
            <div className="p-4 bg-gray-50 rounded-2xl space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Student:</span>
                <span className="font-bold text-gray-900">
                  {activeComplaint.student?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="font-semibold text-gray-800">
                  {activeComplaint.student?.hostel}, {activeComplaint.student?.block}, Room{' '}
                  {activeComplaint.student?.roomNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact:</span>
                <span className="text-gray-800">{activeComplaint.student?.phone || 'N/A'}</span>
              </div>
              {activeComplaint.order && (
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-500">Related Order:</span>
                  <span className="font-bold text-blue-600">
                    #{activeComplaint.order?.orderNumber} ({activeComplaint.order?.status})
                  </span>
                </div>
              )}
            </div>

            {/* Student's Complaint Description */}
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">
                Student's Issue Description
              </label>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 font-medium text-base">
                “{activeComplaint.description}”
              </div>
            </div>

            {/* Staff Reply Form */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Type Staff Reply
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="e.g. We found the missing blue polo shirt and placed it in locker #4. Please collect it..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleResolve('In Progress')}
                className="w-full sm:w-1/2 py-3 px-5 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Mark as In Progress
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleResolve('Resolved')}
                className="w-full sm:w-1/2 py-3.5 px-6 text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                <span>Mark as Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;
