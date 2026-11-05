import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";
import { normalizeSupabaseUrl } from "./admin";

export function createClient() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
