export const FURNISHING_STATUSES = ["unfurnished", "semi_furnished", "furnished"] as const;
export type FurnishingStatusSlug = (typeof FURNISHING_STATUSES)[number];

export const CONSTRUCTION_CONDITIONS = [
  "new",
  "under_construction",
  "renovated",
  "needs_renovation",
  "old",
] as const;
export type ConstructionConditionSlug = (typeof CONSTRUCTION_CONDITIONS)[number];

export const CERTIFICATE_STATUSES = ["yes", "no", "in_process"] as const;
export type CertificateStatusSlug = (typeof CERTIFICATE_STATUSES)[number];
