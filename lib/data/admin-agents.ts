import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type AgentRow = Database["public"]["Tables"]["agents"]["Row"];

export type AdminAgent = AgentRow & { linkedProfileName: string | null };

export async function getAllAgentsWithLinkStatus(): Promise<AdminAgent[]> {
  const supabase = await createClient();
  const { data: agents, error } = await supabase.from("agents").select("*").order("sort_order");
  if (error) throw error;

  const profileIds = (agents ?? []).map((a) => a.profile_id).filter((id): id is string => Boolean(id));
  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", profileIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  const nameByProfile = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (agents ?? []).map((a) => ({
    ...a,
    linkedProfileName: a.profile_id ? (nameByProfile.get(a.profile_id) ?? null) : null,
  }));
}

export async function getAgentByIdForAdmin(id: string): Promise<AdminAgent | null> {
  const supabase = await createClient();
  const { data: agent, error } = await supabase.from("agents").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!agent) return null;

  let linkedProfileName: string | null = null;
  if (agent.profile_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", agent.profile_id)
      .maybeSingle();
    linkedProfileName = profile?.full_name ?? null;
  }

  return { ...agent, linkedProfileName };
}
