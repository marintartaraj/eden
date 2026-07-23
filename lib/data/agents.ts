import { createClient } from "@/lib/supabase/server";

export async function getFeaturedAgents(limit = 4) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("is_featured", true)
    .order("sort_order")
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getAllAgents() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("agents").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getAgentBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("agents").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}
