"use server";

import { createClient } from "@/lib/supabase/server";

export async function assignLead(inquiryId: string, agentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ assigned_agent_id: agentId || null })
    .eq("id", inquiryId);
  if (error) return { success: false as const };
  return { success: true as const };
}
