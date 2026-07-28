import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];

export type AdminLead = InquiryRow & {
  property: { slug: string; title_sq: string; title_en: string | null } | null;
};

async function attachProperties(rows: InquiryRow[]): Promise<AdminLead[]> {
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

export async function getAllLeads(type: "general" | "viewing_request"): Promise<AdminLead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return attachProperties(data ?? []);
}
