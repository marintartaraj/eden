"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveSearch(name: string, filters: { basePath: string; queryString: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const };

  const { error } = await supabase.from("saved_searches").insert({
    user_id: user.id,
    name,
    filters,
  });
  if (error) return { success: false as const };
  return { success: true as const };
}

export async function deleteSavedSearch(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const };

  const { error } = await supabase.from("saved_searches").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false as const };
  return { success: true as const };
}
