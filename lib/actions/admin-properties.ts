"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveLocation } from "@/lib/actions/agent-properties";
import { toPropertyFields } from "@/lib/property-fields";
import { adminPropertySchema, type AdminPropertyOutput } from "@/lib/validations/admin-property";

export async function updateAdminProperty(id: string, input: AdminPropertyOutput) {
  const parsed = adminPropertySchema.safeParse(input);
  if (!parsed.success) return { success: false as const };

  const location = await resolveLocation(parsed.data);
  if (!location) return { success: false as const };

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      status: parsed.data.status,
      is_featured: parsed.data.isFeatured ?? false,
      is_exclusive: parsed.data.isExclusive ?? false,
      agent_id: parsed.data.agentId || null,
      ...toPropertyFields(parsed.data, location.city, location.neighborhood?.id ?? null),
    })
    .eq("id", id);

  if (error) return { success: false as const };
  return { success: true as const };
}
