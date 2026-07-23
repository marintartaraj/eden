export const PROPERTY_TYPES = [
  "apartment",
  "studio",
  "villa",
  "house",
  "land",
  "office",
  "shop",
  "commercial",
  "warehouse",
  "hotel",
  "parking",
  "building",
] as const;

export type PropertyTypeSlug = (typeof PROPERTY_TYPES)[number];
