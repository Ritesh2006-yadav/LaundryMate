import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = (body?.identifier || "").trim();

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Identifier is required" },
        { status: 400 }
      );
    }

    // Direct email
    if (identifier.includes("@")) {
      return NextResponse.json({
        success: true,
        email: identifier.toLowerCase(),
      });
    }

    const cleanRegNo = identifier.toUpperCase().replace(/^LPU/, "");

    if (isSupabaseConfigured()) {
      try {
        const adminClient = createServerSupabaseClient();

        // 1. First attempt: check public.profiles table if present
        try {
          const { data: profile } = await adminClient
            .from("profiles")
            .select("email")
            .or(`reg_no.eq.${cleanRegNo},reg_no.eq.LPU${cleanRegNo}`)
            .limit(1)
            .maybeSingle();

          if (profile?.email) {
            return NextResponse.json({
              success: true,
              email: profile.email.toLowerCase(),
            });
          }
        } catch {
          // profiles table might not exist yet, fallback to auth users
        }

        // 2. Second attempt: search Supabase Auth users metadata
        const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

        if (!listError && authUsers?.users) {
          const matchedUser = authUsers.users.find((u) => {
            const userReg = (u.user_metadata?.reg_no || "").trim().toUpperCase().replace(/^LPU/, "");
            return userReg === cleanRegNo;
          });

          if (matchedUser?.email) {
            return NextResponse.json({
              success: true,
              email: matchedUser.email.toLowerCase(),
            });
          }
        }
      } catch (err) {
        console.warn("[Resolve Email] Supabase lookup error:", err.message);
      }
    }

    // Fallback default
    return NextResponse.json({
      success: true,
      email: `${cleanRegNo}@lpu.in`.toLowerCase(),
      isFallback: true,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

