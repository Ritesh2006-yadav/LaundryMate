/**
 * LPU | LMS - Supabase Environment Variable Validator
 * Validates Supabase configuration and provides clear, actionable error messages.
 */

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      "[Supabase Config Error] Missing NEXT_PUBLIC_SUPABASE_URL in environment variables (.env.local).\n" +
      "Please set NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co"
    );
  }

  if (!url.startsWith("https://") && !url.startsWith("http://localhost")) {
    throw new Error(
      `[Supabase Config Error] Invalid NEXT_PUBLIC_SUPABASE_URL: "${url}". It must be a valid URL starting with https:// (or http://localhost for local development).`
    );
  }

  if (!anonKey) {
    throw new Error(
      "[Supabase Config Error] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables (.env.local).\n" +
      "Please set NEXT_PUBLIC_SUPABASE_ANON_KEY to your Supabase project's anon/public key."
    );
  }

  return { supabaseUrl: url, supabaseAnonKey: anonKey };
}

/**
 * Returns true if real (non-placeholder) Supabase environment variables are configured.
 */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
    url !== "https://placeholder-lpu-lms.supabase.co" &&
    !url.includes("your-project.supabase.co") &&
    anonKey &&
    anonKey !== "placeholder-anon-key" &&
    !anonKey.includes("your-anon-key")
  );
}

/**
 * Retrieves the service role key strictly on the server-side.
 * Throws if attempted to be accessed or bundled into client-side code.
 */
export function getServiceRoleKey() {
  if (typeof window !== "undefined") {
    throw new Error(
      "[Security Violation] SUPABASE_SERVICE_ROLE_KEY cannot be accessed from client-side code."
    );
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return serviceKey || null;
}

