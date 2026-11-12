/**
 * LPU | LMS - Supabase Module Entrypoint
 * Provides unified access to browser and server clients, environment validation, and utilities.
 */

export { createClient as createBrowserClient, supabase } from "./client";
export { createClient as createServerClient, createServerSupabaseClient } from "./server";
export { getSupabaseEnv, isSupabaseConfigured, getServiceRoleKey } from "./env";

