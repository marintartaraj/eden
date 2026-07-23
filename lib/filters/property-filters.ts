import { PROPERTY_TYPES, type PropertyTypeSlug } from "@/lib/property-types";
import {
  FURNISHING_STATUSES,
  CONSTRUCTION_CONDITIONS,
  CERTIFICATE_STATUSES,
  type FurnishingStatusSlug,
  type ConstructionConditionSlug,
  type CertificateStatusSlug,
} from "@/lib/property-enums";
import type { PropertySearchFilters, SortOption } from "@/lib/data/properties";

export type PropertyPurposeSlug = "sale" | "rent";
export type ViewMode = "grid" | "list" | "map";

export type PropertiesQuery = {
  purpose?: PropertyPurposeSlug;
  city?: string;
  neighborhood?: string;
  type: PropertyTypeSlug[];
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  bedrooms?: string;
  bathrooms?: string;
  floor?: string;
  furnishing: FurnishingStatusSlug[];
  elevator?: boolean;
  parking?: boolean;
  condition: ConstructionConditionSlug[];
  certificate: CertificateStatusSlug[];
  featured?: boolean;
  advanced?: boolean;
  view: ViewMode;
  sort: SortOption;
  page: number;
};

export function defaultPropertiesQuery(): PropertiesQuery {
  return {
    type: [],
    furnishing: [],
    condition: [],
    certificate: [],
    view: "grid",
    sort: "newest",
    page: 1,
  };
}

type RawSearchParams = Record<string, string | string[] | undefined>;

function toSingle(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function filterValid<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return values.filter((v): v is T => (allowed as readonly string[]).includes(v));
}

export function parsePropertiesSearchParams(raw: RawSearchParams): PropertiesQuery {
  const purpose = toSingle(raw.purpose);
  const view = toSingle(raw.view);
  const sort = toSingle(raw.sort);
  const pageRaw = toSingle(raw.page);
  const page = pageRaw ? Math.max(1, parseInt(pageRaw, 10) || 1) : 1;

  return {
    purpose: purpose === "sale" || purpose === "rent" ? purpose : undefined,
    city: toSingle(raw.city),
    neighborhood: toSingle(raw.neighborhood),
    type: filterValid(toArray(raw.type), PROPERTY_TYPES),
    minPrice: toSingle(raw.minPrice),
    maxPrice: toSingle(raw.maxPrice),
    minArea: toSingle(raw.minArea),
    maxArea: toSingle(raw.maxArea),
    bedrooms: toSingle(raw.bedrooms),
    bathrooms: toSingle(raw.bathrooms),
    floor: toSingle(raw.floor),
    furnishing: filterValid(toArray(raw.furnishing), FURNISHING_STATUSES),
    elevator: toSingle(raw.elevator) === "1",
    parking: toSingle(raw.parking) === "1",
    condition: filterValid(toArray(raw.condition), CONSTRUCTION_CONDITIONS),
    certificate: filterValid(toArray(raw.certificate), CERTIFICATE_STATUSES),
    featured: toSingle(raw.featured) === "1",
    advanced: toSingle(raw.advanced) === "1",
    view: view === "list" || view === "map" ? view : "grid",
    sort:
      sort === "price_asc" || sort === "price_desc" || sort === "area_desc" ? sort : "newest",
    page,
  };
}

export function toSearchParams(query: Partial<PropertiesQuery>): URLSearchParams {
  const params = new URLSearchParams();

  if (query.purpose) params.set("purpose", query.purpose);
  if (query.city) params.set("city", query.city);
  if (query.neighborhood) params.set("neighborhood", query.neighborhood);
  for (const t of query.type ?? []) params.append("type", t);
  if (query.minPrice) params.set("minPrice", query.minPrice);
  if (query.maxPrice) params.set("maxPrice", query.maxPrice);
  if (query.minArea) params.set("minArea", query.minArea);
  if (query.maxArea) params.set("maxArea", query.maxArea);
  if (query.bedrooms) params.set("bedrooms", query.bedrooms);
  if (query.bathrooms) params.set("bathrooms", query.bathrooms);
  if (query.floor) params.set("floor", query.floor);
  for (const f of query.furnishing ?? []) params.append("furnishing", f);
  if (query.elevator) params.set("elevator", "1");
  if (query.parking) params.set("parking", "1");
  for (const c of query.condition ?? []) params.append("condition", c);
  for (const c of query.certificate ?? []) params.append("certificate", c);
  if (query.featured) params.set("featured", "1");
  if (query.advanced) params.set("advanced", "1");
  if (query.view && query.view !== "grid") params.set("view", query.view);
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));

  return params;
}

export function buildHref(
  basePath: string,
  current: PropertiesQuery,
  patch: Partial<PropertiesQuery>,
): string {
  const merged: PropertiesQuery = { ...current, ...patch };
  const qs = toSearchParams(merged).toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function toFilters(query: PropertiesQuery): PropertySearchFilters {
  return {
    purpose: query.purpose,
    citySlug: query.city,
    neighborhoodSlug: query.neighborhood,
    types: query.type.length ? query.type : undefined,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    minArea: query.minArea ? Number(query.minArea) : undefined,
    maxArea: query.maxArea ? Number(query.maxArea) : undefined,
    bedrooms: query.bedrooms ? Number(query.bedrooms) : undefined,
    bathrooms: query.bathrooms ? Number(query.bathrooms) : undefined,
    floor: query.floor ? Number(query.floor) : undefined,
    furnishing: query.furnishing.length ? query.furnishing : undefined,
    hasElevator: query.elevator || undefined,
    hasParking: query.parking || undefined,
    condition: query.condition.length ? query.condition : undefined,
    certificate: query.certificate.length ? query.certificate : undefined,
    featured: query.featured || undefined,
  };
}
