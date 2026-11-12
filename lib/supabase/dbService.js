import { supabase, isSupabaseConfigured } from "./client";

/**
 * LPU | LMS Database Bridge Service
 * Transparently queries Supabase PostgreSQL tables and secure RPCs,
 * with real-time subscription support and graceful local-store fallback.
 */

// ==============================================================================
// 1. ORDERS / LAUNDRY REQUESTS
// ==============================================================================
export async function fetchDbOrders(studentId = null) {
  if (!isSupabaseConfigured()) return null;

  try {
    let query = supabase
      .from("orders")
      .select(`
        *,
        services(name, price_per_kg, unit),
        students(reg_no, hostel_block, room_number, profiles(full_name, phone)),
        staff(staff_id, designation, profiles(full_name, phone)),
        order_items(*),
        order_status_history(*)
      `)
      .order("created_at", { ascending: false });

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    let { data, error } = await query;
    if (error && error.code === "42P01") {
      // Fallback if legacy table exists
      const fallback = await supabase
        .from("laundry_requests")
        .select(`*, laundry_services(*), order_status_history(*)`)
        .order("created_at", { ascending: false });
      if (!fallback.error) return fallback.data;
    }
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("fetchDbOrders fallback to local store:", err?.message || err);
    return null;
  }
}

/**
 * Insert or place order via secure PostgreSQL RPC (preferred) or direct table insert
 */
export async function insertDbOrder(orderData) {
  if (!isSupabaseConfigured()) return null;

  try {
    // 1. Try secure stored procedure RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc("create_student_laundry_order", {
      p_service_id: orderData.serviceId || "wash-fold",
      p_items_count: Number(orderData.itemsCount) || 1,
      p_approx_weight_kg: Number(orderData.weightKg) || 3.0,
      p_pickup_date: orderData.pickupDate || new Date().toISOString().split("T")[0],
      p_pickup_slot: orderData.pickupSlot || "09:00 AM - 11:00 AM",
      p_special_instructions: orderData.specialInstructions || null,
      p_items: Array.isArray(orderData.items) ? orderData.items : [],
      p_pay_via_wallet: orderData.payViaWallet !== false,
    });

    if (!rpcError && rpcData?.success) {
      return rpcData;
    }

    // 2. Direct insert fallback
    const { data, error } = await supabase
      .from("orders")
      .insert({
        id: orderData.id,
        student_id: orderData.studentId,
        service_id: orderData.serviceId || "wash-fold",
        service_name_snapshot: orderData.serviceName || "Wash & Fold",
        price_per_kg_snapshot: orderData.pricePerKg || 40.00,
        status: orderData.status || "Request Placed",
        payment_status: orderData.paymentStatus || "Paid",
        items_count: orderData.itemsCount || 1,
        approx_weight_kg: orderData.weightKg || 3.0,
        hostel_id: orderData.hostel || "BH-3",
        hostel_block: orderData.hostelBlock || "Block B-32",
        room_number: orderData.roomNumber || "210",
        pickup_date: orderData.pickupDate || new Date().toISOString().split("T")[0],
        pickup_slot: orderData.pickupSlot || "09:00 AM - 11:00 AM",
        special_instructions: orderData.specialInstructions || null,
        total_amount: orderData.totalAmount || 120.00,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("insertDbOrder error, using local fallback:", err?.message || err);
    return null;
  }
}

/**
 * Update order stage and lifecycle timestamps
 */
export async function updateDbOrderStatus(orderId, status, actorName, notes = "", lifecycleData = {}) {
  if (!isSupabaseConfigured()) return null;

  try {
    const updatePayload = {
      status,
      updated_at: new Date().toISOString(),
      ...lifecycleData,
    };

    const { data, error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;

    // Append to status history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status,
      actor_name: actorName || "Staff Operations",
      notes: notes || `Order advanced to ${status}.`,
    });

    return data;
  } catch (err) {
    console.warn("updateDbOrderStatus error:", err?.message || err);
    return null;
  }
}

// ==============================================================================
// 2. COMPLAINTS & GRIEVANCES
// ==============================================================================
export async function fetchDbComplaints(studentId = null) {
  if (!isSupabaseConfigured()) return null;

  try {
    let query = supabase
      .from("complaints")
      .select(`
        *,
        students(reg_no, hostel_block, room_number, profiles(full_name, phone)),
        complaint_updates(*)
      `)
      .order("created_at", { ascending: false });

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("fetchDbComplaints fallback to local store:", err?.message || err);
    return null;
  }
}

export async function insertDbComplaint(complaintData) {
  if (!isSupabaseConfigured()) return null;

  try {
    // 1. Try secure stored procedure RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc("submit_student_complaint", {
      p_order_id: complaintData.orderId,
      p_type: complaintData.type,
      p_priority: complaintData.priority || "Medium",
      p_description: complaintData.description,
      p_evidence_url: complaintData.evidenceUrl || null,
    });

    if (!rpcError && rpcData?.success) {
      return rpcData;
    }

    // 2. Direct insert fallback
    const { data, error } = await supabase
      .from("complaints")
      .insert({
        id: complaintData.id,
        order_id: complaintData.orderId,
        student_id: complaintData.studentId,
        hostel_id: complaintData.hostel || "BH-3",
        type: complaintData.type,
        description: complaintData.description,
        evidence_url: complaintData.evidenceUrl,
        status: "Submitted",
        priority: complaintData.priority || "Medium",
        staff_response: "Ticket received. Waiting for laundry staff intake inspection.",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("insertDbComplaint error:", err?.message || err);
    return null;
  }
}

// ==============================================================================
// 3. INVENTORY MANAGEMENT
// ==============================================================================
export async function fetchDbInventory() {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from("inventory")
      .select(`*, suppliers(*), inventory_transactions(*)`)
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("fetchDbInventory fallback to local store:", err?.message || err);
    return null;
  }
}

export async function updateDbInventoryStock(itemId, quantityDelta, type, reason, actorName) {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: item } = await supabase
      .from("inventory")
      .select("current_stock")
      .eq("id", itemId)
      .single();

    if (!item) return null;

    const previousStock = Number(item.current_stock);
    const newStock = Math.max(0, previousStock + Number(quantityDelta));

    const { data: updated } = await supabase
      .from("inventory")
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single();

    await supabase.from("inventory_transactions").insert({
      item_id: itemId,
      type,
      quantity: Math.abs(quantityDelta),
      previous_stock: previousStock,
      new_stock: newStock,
      actor_name: actorName || "Staff Specialist",
      notes: reason,
    });

    return updated;
  } catch (err) {
    console.warn("updateDbInventoryStock error:", err?.message || err);
    return null;
  }
}

// ==============================================================================
// 4. REAL-TIME SUBSCRIPTION LISTENER
// ==============================================================================
export function subscribeToOrders(onUpdate) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel("realtime_orders")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
