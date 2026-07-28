// City-center fallback coordinates, keyed by public.cities.slug. Used when a
// property has no precise lat/lng (currently true for every property, since
// no form or seed data has ever populated those columns — see
// lib/geocode.ts for the fix going forward). Approximate, city-level
// precision only.
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  tirane: { lat: 41.3275, lng: 19.8187 },
  durres: { lat: 41.3246, lng: 19.4565 },
  vlore: { lat: 40.4686, lng: 19.4914 },
  sarande: { lat: 39.8756, lng: 20.0053 },
  ksamil: { lat: 39.7681, lng: 20.0089 },
  shkoder: { lat: 42.0683, lng: 19.5126 },
  fier: { lat: 40.7239, lng: 19.5556 },
  elbasan: { lat: 41.1125, lng: 20.0822 },
  korce: { lat: 40.6186, lng: 20.7808 },
  pogradec: { lat: 40.9025, lng: 20.6525 },
  berat: { lat: 40.7058, lng: 19.9522 },
  lezhe: { lat: 41.7836, lng: 19.6436 },
  shengjin: { lat: 41.8172, lng: 19.5836 },
  kavaje: { lat: 41.1856, lng: 19.5578 },
  himare: { lat: 40.1017, lng: 19.7439 },
};

export function resolveCoordinates(
  lat: number | null,
  lng: number | null,
  citySlug: string | null | undefined,
): { lat: number; lng: number; precise: boolean } | null {
  if (lat != null && lng != null) return { lat, lng, precise: true };
  if (citySlug && CITY_COORDINATES[citySlug]) {
    return { ...CITY_COORDINATES[citySlug], precise: false };
  }
  return null;
}
