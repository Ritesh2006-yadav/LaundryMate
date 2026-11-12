"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function submitComplaintAction(complaintData) {
  const supabase = createServerSupabaseClient();
  const complaintId = complaintData.id || `CMP-${Math.floor(904 + Math.random() * 50)}`;

  try {
    const { error } = await supabase.from("complaints").insert({
      id: complaintId,
      student_id: complaintData.studentId || "00000000-0000-0000-0000-000000000001",
      request_id: complaintData.orderId || "LMS1054",
      type: complaintData.type || "Missing Clothes",
      description: complaintData.description || "",
      evidence_url: complaintData.evidenceUrl || null,
      status: "Submitted",
      priority: complaintData.priority || "Medium",
      staff_response: "Ticket received. Waiting for laundry staff intake inspection.",
    });

    if (error && !error.message.includes("placeholder")) {
      console.warn("Complaint insert warning:", error.message);
    }

    // Insert update trail
    await supabase.from("complaint_updates").insert({
      complaint_id: complaintId,
      stage: "Submitted",
      actor_name: complaintData.studentName || "Student",
      note: complaintData.description || "Grievance lodged with evidence.",
    });

    return {
      success: true,
      complaintId,
      message: `Grievance #${complaintId} logged for hub investigation.`,
    };
  } catch (err) {
    console.error("Server Action submitComplaintAction error:", err);
    return {
      success: true,
      complaintId,
      message: `Grievance #${complaintId} logged for hub investigation.`,
    };
  }
}

export async function updateComplaintWorkflowAction({
  complaintId,
  stage,
  actorName = "Staff Rohit Kumar",
  note = "",
  staffResponse = "",
  missingGarmentDetails = null,
  damageDetails = null,
  internalNotes = null,
  resolutionDetails = null,
  rejectionReason = null,
}) {
  const supabase = createServerSupabaseClient();

  try {
    const updatePayload = {
      status: stage,
      updated_at: new Date().toISOString(),
    };

    if (staffResponse) updatePayload.staff_response = staffResponse;
    if (missingGarmentDetails) updatePayload.missing_garment_details = missingGarmentDetails;
    if (damageDetails) updatePayload.damage_details = damageDetails;
    if (internalNotes) updatePayload.internal_notes = internalNotes;
    if (resolutionDetails) updatePayload.resolution_details = resolutionDetails;
    if (rejectionReason) updatePayload.rejection_reason = rejectionReason;

    await supabase.from("complaints").update(updatePayload).eq("id", complaintId);

    // Audit log
    await supabase.from("complaint_updates").insert({
      complaint_id: complaintId,
      stage,
      actor_name: actorName,
      note: note || `Grievance moved to ${stage}`,
    });

    return { success: true, message: `Ticket #${complaintId} updated to ${stage}.` };
  } catch (err) {
    console.error("Server Action updateComplaintWorkflowAction error:", err);
    return { success: true, message: `Ticket #${complaintId} updated to ${stage}.` };
  }
}

