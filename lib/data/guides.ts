import { createClient } from "@/lib/supabase/server";

export async function getLatestGuides(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
