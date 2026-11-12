import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "./env";

/**
 * High-Performance Session Refresh Middleware
 * - Bypasses external network calls on prefetch requests
 * - Bypasses external network calls when no Supabase auth token cookies are present
 * - Refreshes auth tokens cleanly only when an active token exists
 */
export async function updateSession(request) {
  const res = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return res;
  }

  // 1. Performance Fast-Path: Skip network auth verification on prefetch requests
  const isPrefetch =
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("x-middleware-prefetch") === "1";

  if (isPrefetch) {
    return res;
  }

  // 2. Performance Fast-Path: Check if any Supabase session cookies exist
  // Supabase stores tokens in cookies prefixed with 'sb-'
  const allCookies = request.cookies.getAll();
  const hasAuthTokenCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") && (c.name.endsWith("-auth-token") || c.name.includes("auth-token"))
  );

  // If user has no auth session cookie, skip the slow Supabase remote roundtrip
  if (!hasAuthTokenCookie) {
    return res;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseResponse = res;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Validates/refreshes user token safely
    await supabase.auth.getUser();
  } catch (err) {
    // Gracefully handle network delays or offline environments
  }

  return supabaseResponse;
}
