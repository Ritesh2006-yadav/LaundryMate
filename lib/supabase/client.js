import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

export { isSupabaseConfigured };

/**
 * Creates and returns a Supabase client configured for browser execution
 * using @supabase/ssr with automatic cookie handling.
 */
export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Cached browser client singleton instance for existing imports
let clientInstance = null;

export const supabase = (() => {
  if (isSupabaseConfigured()) {
    try {
      const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
      return createBrowserClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.warn("[Supabase Client] Failed to create browser client:", e.message);
    }
  }

  // Graceful fallback dummy for unconfigured/mock development mode
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-lpu-lms.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
  );
})();

// Expose on window in browser for easy console debugging and testing
if (typeof window !== "undefined") {
  window.supabase = supabase;
}

export default createClient;
