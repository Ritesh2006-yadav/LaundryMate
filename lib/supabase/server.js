import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv, getServiceRoleKey, isSupabaseConfigured } from "./env";

export { isSupabaseConfigured };

/**
 * Creates a standard Supabase client for Server Components, Server Actions,
 * and Route Handlers using @supabase/ssr and Next.js cookies().
 */
export function createClient() {
  const cookieStore = cookies();

  if (!isSupabaseConfigured()) {
    // Fallback for build time or unconfigured environments
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-lpu-lms.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be safely ignored because middleware handles session refresh.
        }
      },
    },
  });
}

/**
 * Server-side client using Service Role key for privileged background administrative actions,
 * strictly executed inside Route Handlers and Server Actions only.
 * Guaranteed never to be bundled or accessed client-side.
 */
export function createServerSupabaseClient() {
  const serviceKey = getServiceRoleKey();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-lpu-lms.supabase.co";
  const authKey = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  return createSupabaseClient(url, authKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export default createClient;
