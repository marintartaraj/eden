import { createClient } from "@/lib/supabase/server";
import { getCities, getNeighborhoods } from "./locations";
import { getAmenities } from "./amenities";
import type { Database } from "@/types/supabase";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];
type AgentRow = Database["public"]["Tables"]["agents"]["Row"];
type AmenityRow = Database["public"]["Tables"]["amenities"]["Row"];
type PropertyPurpose = Database["public"]["Enums"]["property_purpose"];
type PropertyType = Database["public"]["Enums"]["property_type"];
type FurnishingStatus = Database["public"]["Enums"]["furnishing_status"];
type ConstructionCondition = Database["public"]["Enums"]["construction_condition"];
type CertificateStatus = Database["public"]["Enums"]["certificate_status"];

export type PropertyListItem = PropertyRow & {
  coverImageUrl: string | null;
  city: CityRow | null;
  neighborhood: NeighborhoodRow | null;
};

async function attachRelations(rows: PropertyRow[]): Promise<PropertyListItem[]> {
  if (rows.length === 0) return [];

  const supabase = await createClient();
  const [cities, neighborhoods, images] = await Promise.all([
    getCities(),
    getNeighborhoods(),
    supabase
      .from("property_images")
      .select("property_id, url, is_cover, sort_order")
      .in(
        "property_id",
        rows.map((r) => r.id),
      )
      .order("sort_order"),
  ]);
  if (images.error) throw images.error;

  const cityMap = new Map(cities.map((c) => [c.id, c]));
  const neighborhoodMap = new Map(neighborhoods.map((n) => [n.id, n]));

  const imagesByProperty = new Map<string, typeof images.data>();
  for (const img of images.data ?? []) {
    const list = imagesByProperty.get(img.property_id) ?? [];
    list.push(img);
    imagesByProperty.set(img.property_id, list);
  }

  return rows.map((row) => {
    const propertyImages = imagesByProperty.get(row.id) ?? [];
    const cover = propertyImages.find((i) => i.is_cover) ?? propertyImages[0];
    return {
      ...row,
      coverImageUrl: cover?.url ?? null,
      city: row.city_id ? (cityMap.get(row.city_id) ?? null) : null,
      neighborhood: row.neighborhood_id
        ? (neighborhoodMap.get(row.neighborhood_id) ?? null)
        : null,
    };
  });
}

export async function getFeaturedProperties(limit = 6): Promise<PropertyListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return attachRelations(data ?? []);
}

export async function getLatestProperties(limit = 8): Promise<PropertyListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "active")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return attachRelations(data ?? []);
}

export const DEFAULT_PAGE_SIZE = 12;

export type SortOption = "newest" | "price_asc" | "price_desc" | "area_desc";

export type PropertySearchFilters = {
  purpose?: PropertyPurpose;
  citySlug?: string;
  neighborhoodSlug?: string;
  types?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  furnishing?: FurnishingStatus[];
  hasElevator?: boolean;
  hasParking?: boolean;
  condition?: ConstructionCondition[];
  certificate?: CertificateStatus[];
  featured?: boolean;
};

export type PropertySearchResult = {
  items: PropertyListItem[];
  total: number;
  pageCount: number;
};

export async function searchProperties(
  filters: PropertySearchFilters,
  options: { page?: number; pageSize?: number; sort?: SortOption } = {},
): Promise<PropertySearchResult> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, sort = "newest" } = options;
  const supabase = await createClient();

  let cityId: string | undefined;
  let neighborhoodId: string | undefined;

  if (filters.citySlug) {
    const cities = await getCities();
    const city = cities.find((c) => c.slug === filters.citySlug);
    if (!city) return { items: [], total: 0, pageCount: 1 };
    cityId = city.id;
  }

  if (filters.neighborhoodSlug) {
    const neighborhoods = await getNeighborhoods();
    const neighborhood = neighborhoods.find(
      (n) => n.slug === filters.neighborhoodSlug && (!cityId || n.city_id === cityId),
    );
    if (!neighborhood) return { items: [], total: 0, pageCount: 1 };
    neighborhoodId = neighborhood.id;
  }

  let query = supabase.from("properties").select("*", { count: "exact" }).eq("status", "active");

  if (filters.purpose) query = query.eq("purpose", filters.purpose);
  if (filters.types?.length) query = query.in("property_type", filters.types);
  if (cityId) query = query.eq("city_id", cityId);
  if (neighborhoodId) query = query.eq("neighborhood_id", neighborhoodId);
  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters.minArea != null) query = query.gte("gross_area", filters.minArea);
  if (filters.maxArea != null) query = query.lte("gross_area", filters.maxArea);
  if (filters.bedrooms != null) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.bathrooms != null) query = query.gte("bathrooms", filters.bathrooms);
  if (filters.floor != null) query = query.eq("floor", filters.floor);
  if (filters.furnishing?.length) query = query.in("furnishing", filters.furnishing);
  if (filters.hasElevator) query = query.eq("has_elevator", true);
  if (filters.hasParking) query = query.eq("has_parking", true);
  if (filters.condition?.length) query = query.in("construction_condition", filters.condition);
  if (filters.certificate?.length) query = query.in("certificate_status", filters.certificate);
  if (filters.featured) query = query.eq("is_featured", true);

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "area_desc") query = query.order("gross_area", { ascending: false, nullsFirst: false });
  else query = query.order("published_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const items = await attachRelations(data ?? []);

  return { items, total, pageCount };
}

export type PropertyDetail = PropertyRow & {
  city: CityRow | null;
  neighborhood: NeighborhoodRow | null;
  agent: AgentRow | null;
  images: { url: string; isCover: boolean; sortOrder: number }[];
  videos: { url: string; provider: string | null }[];
  floorPlans: { url: string; label: string | null }[];
  amenities: AmenityRow[];
};

export async function getPropertyBySlug(slug: string): Promise<PropertyDetail | null> {
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!property) return null;

  const [
    cities,
    neighborhoods,
    allAmenities,
    agentResult,
    imagesResult,
    videosResult,
    floorPlansResult,
    propertyAmenitiesResult,
  ] = await Promise.all([
    getCities(),
    getNeighborhoods(),
    getAmenities(),
    property.agent_id
      ? supabase.from("agents").select("*").eq("id", property.agent_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("property_images")
      .select("url, is_cover, sort_order")
      .eq("property_id", property.id)
      .order("sort_order"),
    supabase.from("property_videos").select("url, provider").eq("property_id", property.id),
    supabase.from("property_floor_plans").select("url, label").eq("property_id", property.id),
    supabase.from("property_amenities").select("amenity_id").eq("property_id", property.id),
  ]);

  if (agentResult.error) throw agentResult.error;
  if (imagesResult.error) throw imagesResult.error;
  if (videosResult.error) throw videosResult.error;
  if (floorPlansResult.error) throw floorPlansResult.error;
  if (propertyAmenitiesResult.error) throw propertyAmenitiesResult.error;

  const amenityIds = new Set((propertyAmenitiesResult.data ?? []).map((row) => row.amenity_id));

  return {
    ...property,
    city: property.city_id ? (cities.find((c) => c.id === property.city_id) ?? null) : null,
    neighborhood: property.neighborhood_id
      ? (neighborhoods.find((n) => n.id === property.neighborhood_id) ?? null)
      : null,
    agent: agentResult.data,
    images: (imagesResult.data ?? []).map((img) => ({
      url: img.url,
      isCover: img.is_cover,
      sortOrder: img.sort_order,
    })),
    videos: videosResult.data ?? [],
    floorPlans: floorPlansResult.data ?? [],
    amenities: allAmenities.filter((a) => amenityIds.has(a.id)),
  };
}

export async function getSimilarProperties(
  property: Pick<PropertyRow, "id" | "property_type" | "city_id">,
  limit = 4,
): Promise<PropertyListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", "active")
    .eq("property_type", property.property_type)
    .neq("id", property.id);
  if (property.city_id) query = query.eq("city_id", property.city_id);

  const { data, error } = await query.order("published_at", { ascending: false }).limit(limit);
  if (error) throw error;

  let items = await attachRelations(data ?? []);

  if (items.length === 0 && property.city_id) {
    const fallback = await supabase
      .from("properties")
      .select("*")
      .eq("status", "active")
      .eq("property_type", property.property_type)
      .neq("id", property.id)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (fallback.error) throw fallback.error;
    items = await attachRelations(fallback.data ?? []);
  }

  return items;
}

export async function getPropertiesByAgentId(
  agentId: string,
  limit = 12,
): Promise<PropertyListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "active")
    .eq("agent_id", agentId)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return attachRelations(data ?? []);
}

export async function getPropertiesByIds(ids: string[]): Promise<PropertyListItem[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "active")
    .in("id", ids);
  if (error) throw error;
  return attachRelations(data ?? []);
}
