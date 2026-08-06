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
    supabase
      .from("properties")
      .select("id, city_id")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);
  if (error) throw error;

  const counts = new Map<string, number>();
  // Rows are newest-first, so the first property id seen per city is its
  // most recent active listing — used below as the "Browse by City" card's
  // photo, instead of an unrelated stock image.
  const representativePropertyId = new Map<string, string>();
  for (const row of activeProperties ?? []) {
    if (!row.city_id) continue;
    counts.set(row.city_id, (counts.get(row.city_id) ?? 0) + 1);
    if (!representativePropertyId.has(row.city_id)) {
      representativePropertyId.set(row.city_id, row.id);
    }
  }

  const topCities = cities
    .map((city) => ({ ...city, propertyCount: counts.get(city.id) ?? 0 }))
    .filter((city) => city.propertyCount > 0)
    .sort((a, b) => b.propertyCount - a.propertyCount)
    .slice(0, limit);

  const propertyIds = topCities
    .map((city) => representativePropertyId.get(city.id))
    .filter((id): id is string => Boolean(id));

  const { data: images, error: imagesError } = propertyIds.length
    ? await supabase
        .from("property_images")
        .select("property_id, url, is_cover")
        .in("property_id", propertyIds)
    : { data: [], error: null };
  if (imagesError) throw imagesError;

  const imagesByProperty = new Map<string, { url: string; is_cover: boolean }[]>();
  for (const img of images ?? []) {
    const list = imagesByProperty.get(img.property_id) ?? [];
    list.push(img);
    imagesByProperty.set(img.property_id, list);
  }

  return topCities.map((city) => {
    const propertyId = representativePropertyId.get(city.id);
    const propertyImages = propertyId ? (imagesByProperty.get(propertyId) ?? []) : [];
    const cover = propertyImages.find((i) => i.is_cover) ?? propertyImages[0];
    return { ...city, imageUrl: cover?.url ?? null };
  });
}
