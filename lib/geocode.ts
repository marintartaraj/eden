import "server-only";

/**
 * Best-effort forward geocoding via Nominatim (OpenStreetMap's free geocoder
 * — no API key/account needed, unlike Google/Mapbox geocoding). This is the
 * fix for the underlying gap the map feature exposed: properties.lat/lng
 * have existed since the initial schema but nothing has ever populated
 * them, so every property fell back to city-level map precision. Called
 * from the property-submission/creation actions so new listings get real
 * coordinates going forward.
 *
 * Nominatim's usage policy (https://operations.osmfoundation.org/policies/nominatim/)
 * requires a descriptive User-Agent and caps free usage at ~1 request/second
 * — fine for this site's submission volume. Failures return null rather
 * than throwing, since a listing shouldn't fail to save over a geocoding
 * hiccup.
 */
export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  if (!query.trim()) return null;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: { "User-Agent": "Eden-RealEstate/1.0 (property listing geocoding)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;

    const results = (await response.json()) as { lat: string; lon: string }[];
    const first = results[0];
    if (!first) return null;

    const lat = Number.parseFloat(first.lat);
    const lng = Number.parseFloat(first.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}
