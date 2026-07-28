import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { serverEnv, publicEnv } from "@/lib/env.server";

// Bypasses RLS via the service role key. Server-only — never import this
// from a Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
