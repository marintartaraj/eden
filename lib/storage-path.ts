/**
 * Derives the storage object path from a Supabase public URL, since
 * property_images/property_floor_plans only store the public `url`, not the
 * path separately. Relies on Supabase's fixed public-URL shape.
 */
export function pathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}
