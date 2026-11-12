"use client";

import { useState, useEffect, useCallback } from "react";
import { MOCK_INQUIRIES } from "@/lib/supabase/mockData";

let cachedInquiries = null;

export function useInquiries() {
  const [inquiries, setInquiries] = useState(() => cachedInquiries || MOCK_INQUIRIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInquiries = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.category && filters.category !== "all") params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);

      const res = await fetch(`/api/inquiries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.inquiries)) {
          cachedInquiries = data.inquiries;
          setInquiries(data.inquiries);
          try {
            localStorage.setItem("lpu_lms_inquiries", JSON.stringify(data.inquiries));
          } catch (e) {}
          return data.inquiries;
        }
      }
      // Fallback from localStorage or mock
      const local = localStorage.getItem("lpu_lms_inquiries");
      if (local) {
        const parsed = JSON.parse(local);
        setInquiries(parsed);
        cachedInquiries = parsed;
      }
    } catch (err) {
      console.warn("Could not fetch remote inquiries, using local store:", err);
      const local = localStorage.getItem("lpu_lms_inquiries");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setInquiries(parsed);
          cachedInquiries = parsed;
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Submit new inquiry (client or public)
  const submitInquiry = async (formData) => {
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.inquiry) {
        setInquiries((prev) => {
          const updated = [data.inquiry, ...prev];
          cachedInquiries = updated;
          try {
            localStorage.setItem("lpu_lms_inquiries", JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
        return { success: true, referenceId: data.referenceId, inquiry: data.inquiry };
      }
      return { success: false, error: data.error || "Submission failed" };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Update inquiry status and admin notes (Admin)
  const updateInquiryStatus = async (id, status, adminNotes = null, adminResponse = null) => {
    try {
      const res = await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, adminNotes, adminResponse }),
      });
      const data = await res.json();

      setInquiries((prev) => {
        const updated = prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              status: status || item.status,
              adminNotes: adminNotes !== null ? adminNotes : item.adminNotes,
              adminResponse: adminResponse !== null ? adminResponse : item.adminResponse,
            };
          }
          return item;
        });
        cachedInquiries = updated;
        try {
          localStorage.setItem("lpu_lms_inquiries", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === "New").length;
  const inProgressCount = inquiries.filter((i) => i.status === "In Progress").length;
  const resolvedCount = inquiries.filter((i) => i.status === "Resolved").length;
  const closedCount = inquiries.filter((i) => i.status === "Closed").length;

  return {
    inquiries,
    loading,
    error,
    fetchInquiries,
    submitInquiry,
    updateInquiryStatus,
    metrics: {
      total: totalCount,
      new: newCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      closed: closedCount,
    },
  };
}

