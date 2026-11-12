import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  try {
    const configured = isSupabaseConfigured();
    if (!configured) {
      return NextResponse.json({
        success: false,
        message: "Supabase environment variables are not yet configured or using placeholder values.",
      });
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    // Mask URL for display
    const maskedUrl = rawUrl.replace(/^https:\/\/(.{4}).*(\.supabase\.co.*)$/, "https://$1****$2");

    return NextResponse.json({
      success: true,
      status: "CONNECTED",
      supabaseUrl: maskedUrl,
      authStatus: "Auth API responding normally",
      activeSession: data?.session ? "User Logged In" : "Guest (No Active Session)",
      message: "Supabase client is properly configured and successfully communicating with your Supabase project!",
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

