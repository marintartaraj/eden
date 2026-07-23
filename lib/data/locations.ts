import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getCities = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
});

export const getNeighborhoods = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
});

export async function getCitiesWithPropertyCounts(limit = 8) {
  const supabase = await createClient();
  const [cities, { data: activeProperties, error }] = await Promise.all([
    getCities(),
    supabase.from("properties").select("city_id").eq("status", "active"),
  ]);
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of activeProperties ?? []) {
    if (!row.city_id) continue;
    counts.set(row.city_id, (counts.get(row.city_id) ?? 0) + 1);
  }

  return cities
    .map((city) => ({ ...city, propertyCount: counts.get(city.id) ?? 0 }))
    .filter((city) => city.propertyCount > 0)
    .sort((a, b) => b.propertyCount - a.propertyCount)
    .slice(0, limit);
}
