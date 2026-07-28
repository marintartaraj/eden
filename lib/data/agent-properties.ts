import { createClient } from "@/lib/supabase/server";
import { getCurrentAgentId } from "@/lib/auth/agent";
import type { Database } from "@/types/supabase";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

export type AgentPropertyListItem = PropertyRow & { coverImageUrl: string | null };

async function attachCovers(rows: PropertyRow[]): Promise<AgentPropertyListItem[]> {
  if (rows.length === 0) return [];
  const supabase = await createClient();
  const { data: images } = await supabase
    .from("property_images")
    .select("property_id, url, is_cover, sort_order")
    .in(
      "property_id",
      rows.map((r) => r.id),
    )
    .order("sort_order");

  const coverByProperty = new Map<string, string>();
  for (const img of images ?? []) {
    if (img.is_cover || !coverByProperty.has(img.property_id)) {
      coverByProperty.set(img.property_id, img.url);
    }
  }

  return rows.map((row) => ({ ...row, coverImageUrl: coverByProperty.get(row.id) ?? null }));
}

export async function getMyAssignedProperties(): Promise<AgentPropertyListItem[]> {
  const agentId = await getCurrentAgentId();
  if (!agentId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("agent_id", agentId)
    .order("updated_at", { ascending: false });
  if (error) throw error;

  return attachCovers(data ?? []);
}

export async function getMyAssignedPropertyById(id: string): Promise<PropertyRow | null> {
  const agentId = await getCurrentAgentId();
  if (!agentId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("agent_id", agentId)
    .maybeSingle();
  if (error) throw error;

  return data;
}
