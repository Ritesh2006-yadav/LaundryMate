import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// Simple in-memory rate limiting map: ip -> timestamps[]
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// In-memory inquiries storage (no fake mock records)
let localInquiries = [];

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

// Sanitize string input helper
function sanitize(val, maxLen = 500) {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLen);
}

/**
 * GET /api/inquiries
 * Retrieves all inquiries (Admin route)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const categoryFilter = searchParams.get("category");
    const searchQuery = searchParams.get("search")?.toLowerCase();

    if (isSupabaseConfigured()) {
      const supabase = createServerSupabaseClient();
      let query = supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;
      if (!error && data) {
        let results = data.map((item) => ({
          id: item.id,
          fullName: item.full_name,
          emailOrReg: item.email_or_reg,
          hostelResidence: item.hostel_residence,
          category: item.category,
          subject: item.subject,
          message: item.message,
          status: item.status,
          adminNotes: item.admin_notes,
          adminResponse: item.admin_response,
          createdAt: item.created_at,
          formattedDate: new Date(item.created_at).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        if (searchQuery) {
          results = results.filter(
            (i) =>
              i.id.toLowerCase().includes(searchQuery) ||
              i.fullName.toLowerCase().includes(searchQuery) ||
              i.emailOrReg.toLowerCase().includes(searchQuery) ||
              i.message.toLowerCase().includes(searchQuery)
          );
        }

        return NextResponse.json({ success: true, inquiries: results });
      }
    }

    // Fallback to local storage / mock data
    let results = [...localInquiries];
    if (statusFilter && statusFilter !== "all") {
      results = results.filter((i) => i.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (categoryFilter && categoryFilter !== "all") {
      results = results.filter((i) => i.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (searchQuery) {
      results = results.filter(
        (i) =>
          i.id.toLowerCase().includes(searchQuery) ||
          i.fullName.toLowerCase().includes(searchQuery) ||
          i.emailOrReg.toLowerCase().includes(searchQuery) ||
          i.message.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({ success: true, inquiries: results });
  } catch (err) {
    console.error("GET /api/inquiries error:", err);
    return NextResponse.json({ success: true, inquiries: localInquiries });
  }
}

/**
 * POST /api/inquiries
 * Public submission of contact inquiries
 */
export async function POST(request) {
  try {
    // 1. Basic rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many inquiries submitted from this network. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 2. Input validation & sanitization
    const fullName = sanitize(body.fullName || body.name, 100);
    const emailOrReg = sanitize(body.emailOrReg || body.email || body.regNo, 100);
    const hostelResidence = sanitize(body.hostelResidence || body.hostel, 100);
    const category = sanitize(body.category || "General Inquiry", 80);
    const subject = sanitize(body.subject || "", 150);
    const message = sanitize(body.message, 2000);

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ success: false, error: "Please provide your valid full name (minimum 2 characters)." }, { status: 400 });
    }
    if (!emailOrReg || emailOrReg.length < 3) {
      return NextResponse.json({ success: false, error: "Please enter your university Registration Number or official Email." }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json({ success: false, error: "Message must contain at least 10 characters describing your inquiry." }, { status: 400 });
    }

    // 3. Generate unique readable inquiry ID: INQ-2026-XXXX
    const generatedId = `INQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newInquiry = {
      id: generatedId,
      fullName,
      emailOrReg,
      hostelResidence: hostelResidence || "BH-3 (Boys Hostel 3)",
      category: category || "General Inquiry",
      subject: subject || `${category} - ${hostelResidence}`,
      message,
      status: "New",
      adminNotes: null,
      adminResponse: null,
      createdAt: nowIso,
      formattedDate,
    };

    // 4. Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerSupabaseClient();
        const { data, error } = await supabase
          .from("contact_inquiries")
          .insert({
            id: generatedId,
            full_name: fullName,
            email_or_reg: emailOrReg,
            hostel_residence: hostelResidence || "BH-3 (Boys Hostel 3)",
            category: category || "General Inquiry",
            subject: subject || null,
            message: message,
            status: "New",
          })
          .select()
          .single();

        if (error) {
          console.warn("Supabase insert inquiry error, falling back to local store:", error.message);
        }
      } catch (dbErr) {
        console.warn("Supabase client error:", dbErr.message);
      }
    }

    // Prepend to local in-memory store
    localInquiries = [newInquiry, ...localInquiries];

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been successfully lodged in the LPU LMS Central Administration Desk.",
      inquiry: newInquiry,
      referenceId: generatedId,
    });
  } catch (err) {
    console.error("POST /api/inquiries error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while submitting your inquiry. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/inquiries
 * Updates inquiry status and admin notes (Admin route)
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, adminNotes, adminResponse } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Inquiry ID is required" }, { status: 400 });
    }

    const nowIso = new Date().toISOString();

    // Update in Supabase if configured
    if (isSupabaseConfigured()) {
      const supabase = createServerSupabaseClient();
      const updatePayload = {
        updated_at: nowIso,
      };
      if (status) updatePayload.status = status;
      if (adminNotes !== undefined) updatePayload.admin_notes = adminNotes;
      if (adminResponse !== undefined) {
        updatePayload.admin_response = adminResponse;
        updatePayload.responded_at = nowIso;
      }

      const { data, error } = await supabase
        .from("contact_inquiries")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, inquiry: data });
      }
    }

    // Update in local store
    localInquiries = localInquiries.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: status || item.status,
          adminNotes: adminNotes !== undefined ? adminNotes : item.adminNotes,
          adminResponse: adminResponse !== undefined ? adminResponse : item.adminResponse,
          updatedAt: nowIso,
        };
      }
      return item;
    });

    const updated = localInquiries.find((i) => i.id === id);

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err) {
    console.error("PATCH /api/inquiries error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

