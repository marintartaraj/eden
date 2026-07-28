"use server";

import { createClient } from "@/lib/supabase/server";

export async function withdrawSubmission(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const };

  const { error } = await supabase
    .from("property_submissions")
    .update({ status: "withdrawn" })
    .eq("id", id)
    .eq("submitted_by_user_id", user.id);
  if (error) return { success: false as const };
  return { success: true as const };
}
