import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_ORDERS } from "@/lib/supabase/mockData";

export async function GET(request) {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createServerSupabaseClient();
      const { searchParams } = new URL(request.url);
      const studentId = searchParams.get("student_id");

      let query = supabase
        .from("laundry_requests")
        .select(`
          *,
          laundry_services(name, price_per_kg, unit),
          laundry_request_items(*),
          order_status_history(*)
        `)
        .order("created_at", { ascending: false });

      if (studentId) {
        query = query.eq("student_id", studentId);
      }

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, orders: data });
      }
    }

    return NextResponse.json({ success: true, orders: MOCK_ORDERS });
  } catch (err) {
    return NextResponse.json({ success: true, orders: MOCK_ORDERS });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const orderId = body.id || `LMS${Math.floor(1055 + Math.random() * 50)}`;

    if (isSupabaseConfigured()) {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase.from("laundry_requests").insert({
        id: orderId,
        student_id: body.studentId || "00000000-0000-0000-0000-000000000001",
        service_id: body.serviceId || "wash-fold",
        items_count: body.itemsCount || 5,
        approx_weight_kg: body.weightKg || 5,
        hostel_id: body.hostel || "BH-3",
        hostel_block: body.hostelBlock || "Block B-32",
        room_number: body.roomNumber || "210",
        pickup_date: body.pickupDate || new Date().toISOString().split("T")[0],
        pickup_slot: body.pickupSlot || "09:00 AM - 11:00 AM",
        special_instructions: body.specialInstructions || null,
        total_amount: body.totalAmount || 200,
      }).select().single();

      if (!error && data) {
        return NextResponse.json({ success: true, order: data });
      }
    }

    return NextResponse.json({ success: true, order: { id: orderId, ...body } });
  } catch (err) {
    return NextResponse.json({ success: true, order: { id: `LMS${Date.now().toString().slice(-4)}` } });
  }
}
