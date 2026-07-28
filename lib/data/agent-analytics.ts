import { createClient } from "@/lib/supabase/server";
import { getCurrentAgentId } from "@/lib/auth/agent";
import type { Database } from "@/types/supabase";

type PropertyStatus = Database["public"]["Enums"]["property_status"];
type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];

export type AgentStats = {
  propertiesByStatus: Record<PropertyStatus, number>;
  leadsByStatus: Record<InquiryStatus, number>;
  totalProperties: number;
  totalLeads: number;
};

const PROPERTY_STATUSES: PropertyStatus[] = [
  "draft",
  "pending",
  "active",
  "reserved",
  "sold",
  "rented",
  "archived",
];
const INQUIRY_STATUSES: InquiryStatus[] = ["new", "contacted", "qualified", "closed"];

export async function getMyAgentStats(): Promise<AgentStats> {
  const propertiesByStatus = Object.fromEntries(PROPERTY_STATUSES.map((s) => [s, 0])) as Record<
    PropertyStatus,
    number
  >;
  const leadsByStatus = Object.fromEntries(INQUIRY_STATUSES.map((s) => [s, 0])) as Record<
    InquiryStatus,
    number
  >;

  const agentId = await getCurrentAgentId();
  if (!agentId) {
    return { propertiesByStatus, leadsByStatus, totalProperties: 0, totalLeads: 0 };
  }

  const supabase = await createClient();
  const [{ data: properties }, { data: leads }] = await Promise.all([
    supabase.from("properties").select("status").eq("agent_id", agentId),
    supabase.from("inquiries").select("status").eq("assigned_agent_id", agentId),
  ]);

  for (const p of properties ?? []) propertiesByStatus[p.status] += 1;
  for (const l of leads ?? []) leadsByStatus[l.status] += 1;

  return {
    propertiesByStatus,
    leadsByStatus,
    totalProperties: properties?.length ?? 0,
    totalLeads: leads?.length ?? 0,
  };
}
