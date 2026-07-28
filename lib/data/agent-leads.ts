import { createClient } from "@/lib/supabase/server";
import { getCurrentAgentId } from "@/lib/auth/agent";
import type { Database } from "@/types/supabase";

type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];

export type AgentLead = InquiryRow & {
  property: { slug: string; title_sq: string; title_en: string | null } | null;
};

async function attachProperties(rows: InquiryRow[]): Promise<AgentLead[]> {
  const ids = rows.map((r) => r.property_id).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return rows.map((r) => ({ ...r, property: null }));

  const supabase = await createClient();
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, slug, title_sq, title_en")
    .in("id", ids);
  if (error) throw error;

  const map = new Map((properties ?? []).map((p) => [p.id, p]));
  return rows.map((r) => ({
    ...r,
    property: r.property_id ? (map.get(r.property_id) ?? null) : null,
  }));
}

export async function getMyAssignedLeads(type: "general" | "viewing_request"): Promise<AgentLead[]> {
  const agentId = await getCurrentAgentId();
  if (!agentId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("assigned_agent_id", agentId)
    .eq("type", type)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return attachProperties(data ?? []);
}

export async function getMyAssignedFollowUps(): Promise<AgentLead[]> {
  const agentId = await getCurrentAgentId();
  if (!agentId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("assigned_agent_id", agentId)
    .not("follow_up_date", "is", null)
    .order("follow_up_date", { ascending: true });
  if (error) throw error;

  return attachProperties(data ?? []);
}
