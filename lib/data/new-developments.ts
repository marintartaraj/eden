import { createClient } from "@/lib/supabase/server";
import { getCities, getNeighborhoods } from "./locations";
import type { Database } from "@/types/supabase";

type NewDevelopmentRow = Database["public"]["Tables"]["new_developments"]["Row"];
type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];

export type NewDevelopmentListItem = NewDevelopmentRow & {
  city: CityRow | null;
  neighborhood: NeighborhoodRow | null;
};

async function attachRelations(rows: NewDevelopmentRow[]): Promise<NewDevelopmentListItem[]> {
  if (rows.length === 0) return [];

  const [cities, neighborhoods] = await Promise.all([getCities(), getNeighborhoods()]);
  const cityMap = new Map(cities.map((c) => [c.id, c]));
  const neighborhoodMap = new Map(neighborhoods.map((n) => [n.id, n]));

  return rows.map((row) => ({
    ...row,
    city: row.city_id ? (cityMap.get(row.city_id) ?? null) : null,
    neighborhood: row.neighborhood_id ? (neighborhoodMap.get(row.neighborhood_id) ?? null) : null,
  }));
}

export async function getAllNewDevelopments(): Promise<NewDevelopmentListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("new_developments")
    .select("*")
    .eq("status", "active")
    .order("delivery_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return attachRelations(data ?? []);
}

export async function getNewDevelopmentBySlug(
  slug: string,
): Promise<NewDevelopmentListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("new_developments")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [item] = await attachRelations([data]);
  return item;
}
