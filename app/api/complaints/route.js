import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_COMPLAINTS } from "@/lib/supabase/mockData";

export async function GET(request) {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createServerSupabaseClient();
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");

      let query = supabase
        .from("complaints")
        .select(`
          *,
          complaint_updates(*)
        `)
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, complaints: data });
      }
    }

    return NextResponse.json({ success: true, complaints: MOCK_COMPLAINTS });
  } catch (err) {
    return NextResponse.json({ success: true, complaints: MOCK_COMPLAINTS });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const complaintId = body.id || `CMP-${Math.floor(904 + Math.random() * 50)}`;

    if (isSupabaseConfigured()) {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase.from("complaints").insert({
        id: complaintId,
        student_id: body.studentId || "00000000-0000-0000-0000-000000000001",
        request_id: body.orderId || "LMS1054",
        type: body.type || "Missing Clothes",
        description: body.description || "",
        evidence_url: body.evidenceUrl || null,
        status: "Submitted",
        priority: body.priority || "Medium",
      }).select().single();

      if (!error && data) {
        return NextResponse.json({ success: true, complaint: data });
      }
    }

    return NextResponse.json({ success: true, complaint: { id: complaintId, ...body } });
  } catch (err) {
    return NextResponse.json({ success: true, complaint: { id: `CMP-${Date.now().toString().slice(-3)}` } });
  }
}
