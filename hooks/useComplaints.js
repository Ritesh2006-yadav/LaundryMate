"use client";

import { useState, useEffect, useCallback } from "react";
import { MOCK_COMPLAINTS } from "@/lib/supabase/mockData";

let cachedComplaints = null;

export function useComplaints() {
  const [complaints, setComplaints] = useState(() => cachedComplaints || MOCK_COMPLAINTS);
  const [loading, setLoading] = useState(false);

  const loadStoredComplaints = useCallback((force = false) => {
    if (!force && cachedComplaints) {
      setComplaints(cachedComplaints);
      return;
    }
    try {
      const stored = localStorage.getItem("lpu_lms_complaints");
      if (stored) {
        const parsed = JSON.parse(stored);
        cachedComplaints = parsed;
        setComplaints(parsed);
      } else {
        const enriched = MOCK_COMPLAINTS.map((c) => ({
          ...c,
          status: c.status === "Under Investigation" ? "Investigation" : c.status || "Submitted",
          staffResponse: c.staffResponse || "Under review with Hub Inspector. CCTV footage sorting in progress.",
          internalNotes: c.internalNotes || [],
          resolutionHistory: c.resolutionHistory || [
            {
              stage: "Submitted",
              time: "06 Nov 2026, 11:30 AM",
              actor: c.studentName || "Student",
              note: c.description || "Complaint submitted with image evidence.",
            },
          ],
        }));
        cachedComplaints = enriched;
        setComplaints(enriched);
        localStorage.setItem("lpu_lms_complaints", JSON.stringify(enriched));
      }
    } catch (e) {
      console.error("Failed to load complaints from storage", e);
      cachedComplaints = MOCK_COMPLAINTS;
      setComplaints(MOCK_COMPLAINTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredComplaints();

    const handleStorage = (e) => {
      if (e.key === "lpu_lms_complaints") {
        loadStoredComplaints(true);
      }
    };
    const handleCustom = () => loadStoredComplaints(true);

    window.addEventListener("storage", handleStorage);
    window.addEventListener("lpu_complaints_updated", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("lpu_complaints_updated", handleCustom);
    };
  }, [loadStoredComplaints]);

  const saveComplaints = (newComplaints) => {
    cachedComplaints = newComplaints;
    setComplaints(newComplaints);
    try {
      localStorage.setItem("lpu_lms_complaints", JSON.stringify(newComplaints));
      window.dispatchEvent(new CustomEvent("lpu_complaints_updated"));
    } catch (e) {
      console.error("Failed to save complaints", e);
    }
  };

  const notifyStudent = (title, desc) => {
    try {
      const stored = localStorage.getItem("lpu_lms_notifications");
      const list = stored ? JSON.parse(stored) : [];
      const newNotif = {
        id: `notif-${Date.now()}`,
        title,
        desc,
        time: "Just now",
        type: "complaint",
        unread: true,
        link: "/student/complaints",
      };
      localStorage.setItem("lpu_lms_notifications", JSON.stringify([newNotif, ...list]));
      window.dispatchEvent(new CustomEvent("lpu_notifications_updated"));
    } catch (e) {
      console.error("Failed to push notification", e);
    }
  };

  const getTodayTimeStrings = () => {
    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { todayStr, timeStr };
  };

  const createComplaint = (complaintData) => {
    const highestNum = complaints.reduce((max, c) => {
      const num = parseInt(c.id.replace(/\D/g, ""), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 900);

    const newId = `CMP-${highestNum + 1}`;
    const { todayStr, timeStr } = getTodayTimeStrings();

    const newComplaint = {
      id: newId,
      date: todayStr,
      time: timeStr,
      status: "Submitted",
      staffResponse: "Ticket received. Waiting for laundry staff intake inspection.",
      internalNotes: [],
      resolutionHistory: [
        {
          stage: "Submitted",
          time: `${todayStr}, ${timeStr}`,
          actor: complaintData.studentName || "Student",
          note: complaintData.description || "Complaint filed.",
        },
      ],
      ...complaintData,
    };

    const updated = [newComplaint, ...complaints];
    saveComplaints(updated);

    // Notify student
    notifyStudent(
      `Complaint #${newId} Registered`,
      `Your complaint regarding Order #${newComplaint.orderId} has been logged for staff review.`
    );

    return newComplaint;
  };

  const updateComplaintStatus = (complaintId, newStatus, staffResponse = "", actorName = "Staff Rohit Kumar") => {
    const { todayStr, timeStr } = getTodayTimeStrings();

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const historyEntry = {
          stage: newStatus,
          time: `${todayStr}, ${timeStr}`,
          actor: actorName,
          note: staffResponse || `Status transitioned to ${newStatus}`,
        };

        return {
          ...c,
          status: newStatus,
          staffResponse: staffResponse || c.staffResponse,
          lastUpdated: new Date().toISOString(),
          resolutionHistory: [...(c.resolutionHistory || []), historyEntry],
        };
      }
      return c;
    });

    saveComplaints(updated);

    notifyStudent(
      `Complaint #${complaintId} Updated: ${newStatus}`,
      staffResponse ? `Staff response: "${staffResponse}"` : `Status updated to ${newStatus}.`
    );
  };

  const startInvestigation = (complaintId, actorName = "Hub Inspector Rohit Kumar", note = "Physical audit and CCTV cross-check started.") => {
    const { todayStr, timeStr } = getTodayTimeStrings();

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const historyEntry = {
          stage: "Investigation",
          time: `${todayStr}, ${timeStr}`,
          actor: actorName,
          note: note,
        };
        return {
          ...c,
          status: "Investigation",
          staffResponse: note,
          lastUpdated: new Date().toISOString(),
          resolutionHistory: [...(c.resolutionHistory || []), historyEntry],
        };
      }
      return c;
    });

    saveComplaints(updated);
    notifyStudent(
      `Investigation Underway: #${complaintId}`,
      `Our laundry hub team has commenced a detailed investigation: "${note}"`
    );
  };

  const addInternalNote = (complaintId, author = "Staff Rohit Kumar", noteText = "") => {
    if (!noteText.trim()) return;
    const { todayStr, timeStr } = getTodayTimeStrings();

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const newNote = {
          id: `note-${Date.now()}`,
          author,
          time: `${todayStr}, ${timeStr}`,
          note: noteText.trim(),
        };
        return {
          ...c,
          internalNotes: [...(c.internalNotes || []), newNote],
          lastUpdated: new Date().toISOString(),
        };
      }
      return c;
    });

    saveComplaints(updated);
  };

  const sendStaffResponse = (complaintId, responseText, actorName = "Staff Rohit Kumar") => {
    if (!responseText.trim()) return;
    const { todayStr, timeStr } = getTodayTimeStrings();

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const historyEntry = {
          stage: c.status,
          time: `${todayStr}, ${timeStr}`,
          actor: actorName,
          note: `Staff Note: ${responseText.trim()}`,
        };
        return {
          ...c,
          staffResponse: responseText.trim(),
          lastUpdated: new Date().toISOString(),
          resolutionHistory: [...(c.resolutionHistory || []), historyEntry],
        };
      }
      return c;
    });

    saveComplaints(updated);
    notifyStudent(
      `New Message on Complaint #${complaintId}`,
      responseText.trim()
    );
  };

  const recordMissingClothesDetails = (complaintId, garmentData, investigationNotes = "", actorName = "Staff Rohit Kumar") => {
    const { todayStr, timeStr } = getTodayTimeStrings();

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const historyEntry = {
          stage: "Investigation",
          time: `${todayStr}, ${timeStr}`,
          actor: actorName,
          note: `Garment Identified: ${garmentData.garmentType || "Item"} (${garmentData.color || ""}, ${garmentData.brand || ""}) - Status: ${garmentData.investigationStatus || "In Review"}`,
        };
        return {
          ...c,
          missingGarmentDetails: {
            ...(c.missingGarmentDetails || {}),
            ...garmentData,
          },
          staffResponse: investigationNotes || c.staffResponse,
          lastUpdated: new Date().toISOString(),
          resolutionHistory: [...(c.resolutionHistory || []), historyEntry],
        };
      }
      return c;
    });

    saveComplaints(updated);
    notifyStudent(
      `Garment Audit Logged: #${complaintId}`,
      `Details updated for your missing ${garmentData.garmentType || "garment"}: ${garmentData.investigationStatus || "audit recorded"}.`
    );
  };

  const recordDamagedClothesDetails = (complaintId, damageData, actorName = "Staff Rohit Kumar") => {
    const { todayStr, timeStr } = getTodayTimeStrings();

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const historyEntry = {
          stage: "Investigation",
          time: `${todayStr}, ${timeStr}`,
          actor: actorName,
          note: `Damage Inspection Recorded: ${damageData.damageType || "Defect"} (${damageData.severity || "Inspected"}).`,
        };
        return {
          ...c,
          damageDetails: {
            ...(c.damageDetails || {}),
            ...damageData,
          },
          lastUpdated: new Date().toISOString(),
          resolutionHistory: [...(c.resolutionHistory || []), historyEntry],
        };
      }
      return c;
    });

    saveComplaints(updated);
    notifyStudent(
      `Damage Inspection Recorded: #${complaintId}`,
      `Staff inspected reported damage: ${damageData.damageType || "Item assessed"} (${damageData.severity || "Inspected"}).`
    );
  };

  const resolveComplaint = (complaintId, resolutionData, actorName = "Staff Rohit Kumar") => {
    const { todayStr, timeStr } = getTodayTimeStrings();

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const historyEntry = {
          stage: "Resolved",
          time: `${todayStr}, ${timeStr}`,
          actor: actorName,
          note: resolutionData.resolutionNote || "Grievance resolved successfully.",
        };
        return {
          ...c,
          status: "Resolved",
          staffResponse: resolutionData.resolutionNote || "Your issue has been resolved by our laundry support team.",
          resolutionDetails: {
            resolvedBy: actorName,
            dateResolved: `${todayStr}, ${timeStr}`,
            ...resolutionData,
          },
          lastUpdated: new Date().toISOString(),
          resolutionHistory: [...(c.resolutionHistory || []), historyEntry],
        };
      }
      return c;
    });

    saveComplaints(updated);
    notifyStudent(
      `Complaint #${complaintId} Resolved`,
      `Resolution: ${resolutionData.resolutionNote || "Your grievance has been closed with resolution."}`
    );
  };

  const rejectComplaint = (complaintId, rejectionReason, actorName = "Staff Rohit Kumar") => {
    const { todayStr, timeStr } = getTodayTimeStrings();

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const historyEntry = {
          stage: "Rejected",
          time: `${todayStr}, ${timeStr}`,
          actor: actorName,
          note: `Rejected: ${rejectionReason}`,
        };
        return {
          ...c,
          status: "Rejected",
          staffResponse: `Rejected: ${rejectionReason}`,
          rejectionReason,
          lastUpdated: new Date().toISOString(),
          resolutionHistory: [...(c.resolutionHistory || []), historyEntry],
        };
      }
      return c;
    });

    saveComplaints(updated);
    notifyStudent(
      `Complaint #${complaintId} Declined`,
      `Reason: ${rejectionReason}`
    );
  };

  const getComplaintById = (complaintId) => {
    return complaints.find(
      (c) => c.id.toLowerCase() === (complaintId || "").toLowerCase()
    );
  };

  const getUserComplaints = useCallback(
    (currentUser) => {
      if (!currentUser) return [];
      const regNo = currentUser.regNo?.trim().toUpperCase().replace(/^LPU/, "");
      const email = currentUser.email?.trim().toLowerCase();
      const id = currentUser.id;
      const name = currentUser.name?.trim().toLowerCase();

      return complaints.filter((c) => {
        const cReg = c.studentRegNo?.trim().toUpperCase().replace(/^LPU/, "");
        const cEmail = c.studentEmail?.trim().toLowerCase();
        const cId = c.studentId;
        const cName = c.studentName?.trim().toLowerCase();

        return (
          (regNo && cReg === regNo) ||
          (email && cEmail === email) ||
          (id && cId === id) ||
          (!regNo && name && cName === name)
        );
      });
    },
    [complaints]
  );

  return {
    complaints,
    loading,
    createComplaint,
    updateComplaintStatus,
    startInvestigation,
    addInternalNote,
    sendStaffResponse,
    recordMissingClothesDetails,
    recordDamagedClothesDetails,
    resolveComplaint,
    rejectComplaint,
    getComplaintById,
    getUserComplaints,
  };
}
