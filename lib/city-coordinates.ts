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

// A precisely-geocoded property (see lib/geocode.ts) stores the seller's
// exact home address as lat/lng — showing that unmodified on a public map
// would pinpoint a real person's front door to any visitor. This applies a
// small (60-150m radius) offset before display only, deterministically
// seeded from the property id so the same property always shows the same
// fuzzed point rather than jumping around per page load. The precise
// value in the database is untouched, in case a future feature (accurate
// distance sorting, directions for a confirmed viewing) needs it.
function applyPrivacyOffset(lat: number, lng: number, seed: string): { lat: number; lng: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const unsignedHash = hash >>> 0;
  const angle = ((unsignedHash % 3600) / 3600) * 2 * Math.PI;
  const distanceMeters = 60 + (Math.imul(unsignedHash ^ 0x9e3779b9, 2654435761) >>> 0) % 90;

  const earthRadius = 6378137;
  const dLat = (distanceMeters * Math.cos(angle)) / earthRadius;
  const dLng =
    (distanceMeters * Math.sin(angle)) / (earthRadius * Math.cos((lat * Math.PI) / 180));

  return {
    lat: lat + (dLat * 180) / Math.PI,
    lng: lng + (dLng * 180) / Math.PI,
  };
}

export function resolveCoordinates(
  lat: number | null,
  lng: number | null,
  citySlug: string | null | undefined,
  privacySeed?: string,
): { lat: number; lng: number; precise: boolean } | null {
  if (lat != null && lng != null) {
    return { ...(privacySeed ? applyPrivacyOffset(lat, lng, privacySeed) : { lat, lng }), precise: true };
  }
  if (citySlug && CITY_COORDINATES[citySlug]) {
    return { ...CITY_COORDINATES[citySlug], precise: false };
  }
  return null;
}
