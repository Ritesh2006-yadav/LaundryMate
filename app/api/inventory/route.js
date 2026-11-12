import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { INITIAL_INVENTORY_ITEMS } from "@/hooks/useInventory";

export async function GET(request) {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createServerSupabaseClient();
      const { searchParams } = new URL(request.url);
      const category = searchParams.get("category");

      let query = supabase
        .from("inventory")
        .select(`
          *,
          inventory_transactions(*)
        `)
        .order("name", { ascending: true });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, items: data });
      }
    }

    return NextResponse.json({ success: true, items: INITIAL_INVENTORY_ITEMS });
  } catch (err) {
    return NextResponse.json({ success: true, items: INITIAL_INVENTORY_ITEMS });
  }
}
