import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export type CurrentUser = {
  user: { id: string; email: string | null };
  profile: Database["public"]["Tables"]["profiles"]["Row"];
};

/**
 * Single source of truth for "who is this and what's their role/status".
 * Uses getUser() (not getSession()) so the JWT is revalidated server-side.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return null;

  return { user: { id: user.id, email: user.email ?? null }, profile };
}
