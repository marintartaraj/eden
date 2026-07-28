import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyStatus = Database["public"]["Enums"]["property_status"];

export type AdminPropertyListItem = PropertyRow & { coverImageUrl: string | null };

async function attachCovers(rows: PropertyRow[]): Promise<AdminPropertyListItem[]> {
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

export async function getAllProperties(statusFilter?: string): Promise<AdminPropertyListItem[]> {
  const supabase = await createClient();
  let query = supabase.from("properties").select("*").order("updated_at", { ascending: false });
  if (statusFilter) {
    query = query.eq("status", statusFilter as PropertyStatus);
  }
  const { data, error } = await query;
  if (error) throw error;

  return attachCovers(data ?? []);
}

export async function getPropertyByIdForAdmin(id: string): Promise<PropertyRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
