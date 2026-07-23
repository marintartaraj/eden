import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getAmenities = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("amenities").select("*").order("slug");
  if (error) throw error;
  return data;
});
