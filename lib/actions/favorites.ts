"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) return { success: false as const };
    return { success: true as const, isFavorite: false };
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, property_id: propertyId });
  if (error) return { success: false as const };
  return { success: true as const, isFavorite: true };
}

export async function importLocalFavorites(propertyIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || propertyIds.length === 0) return { success: false as const, imported: 0 };

  const rows = propertyIds.map((property_id) => ({ user_id: user.id, property_id }));
  const { error } = await supabase
    .from("favorites")
    .upsert(rows, { onConflict: "user_id,property_id", ignoreDuplicates: true });
  if (error) return { success: false as const, imported: 0 };

  return { success: true as const, imported: propertyIds.length };
}
