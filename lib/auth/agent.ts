import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentAgentId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("agents").select("id").eq("profile_id", user.id).maybeSingle();
  return data?.id ?? null;
}
