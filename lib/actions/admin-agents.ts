"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify, randomSuffix } from "@/lib/slug";
import { adminAgentSchema, type AdminAgentOutput } from "@/lib/validations/admin-agent";

function toAgentFields(data: AdminAgentOutput) {
  return {
    full_name: data.fullName,
    title_sq: data.titleSq || null,
    title_en: data.titleEn || null,
    bio_sq: data.bioSq || null,
    bio_en: data.bioEn || null,
    phone: data.phone || null,
    whatsapp: data.whatsapp || null,
    email: data.email || null,
    photo_url: data.photoUrl || null,
    license_no: data.licenseNo || null,
  };
}

export async function createAgent(input: AdminAgentOutput) {
  const parsed = adminAgentSchema.safeParse(input);
  if (!parsed.success) return { success: false as const };

  const slug = `${slugify(parsed.data.fullName)}-${randomSuffix()}`;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .insert({ slug, ...toAgentFields(parsed.data) })
    .select("id")
    .single();

  if (error) return { success: false as const };
  return { success: true as const, agentId: data.id };
}

export async function updateAgent(id: string, input: AdminAgentOutput) {
  const parsed = adminAgentSchema.safeParse(input);
  if (!parsed.success) return { success: false as const };

  const supabase = await createClient();
  const { error } = await supabase.from("agents").update(toAgentFields(parsed.data)).eq("id", id);

  if (error) return { success: false as const };
  return { success: true as const };
}

export async function linkAgentProfile(agentId: string, profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("agents").update({ profile_id: profileId }).eq("id", agentId);
  if (error) return { success: false as const };
  return { success: true as const };
}

export async function unlinkAgentProfile(agentId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("agents").update({ profile_id: null }).eq("id", agentId);
  if (error) return { success: false as const };
  return { success: true as const };
}
