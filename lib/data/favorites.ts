import { createClient } from "@/lib/supabase/server";

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("favorites").select("property_id").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.property_id);
}
