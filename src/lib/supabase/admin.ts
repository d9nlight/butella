import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  // Detect if user pasted the dashboard URL, e.g. https://supabase.com/dashboard/project/<ref>
  const dashboardMatch = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }
  return trimmed;
}

export function isSupabaseConfigured(): boolean {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder-project") &&
      !key.includes("placeholder-service-role-key")
  );
}

/**
 * Privileged Supabase Admin Client.
 * WARNING: Uses the Service Role Key. Never import or use in client-side components.
 */
export function getAdminClient() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
