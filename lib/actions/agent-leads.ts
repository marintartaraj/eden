"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentAgentId } from "@/lib/auth/agent";
import type { Database } from "@/types/supabase";

type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];

export async function updateLeadStatus(id: string, status: InquiryStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) return { success: false as const };
  return { success: true as const };
}

export async function updateFollowUpDate(id: string, date: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").update({ follow_up_date: date }).eq("id", id);
  if (error) return { success: false as const };
  return { success: true as const };
}

export async function addLeadNote(inquiryId: string, note: string) {
  if (!note.trim()) return { success: false as const };

  const agentId = await getCurrentAgentId();
  if (!agentId) return { success: false as const };

  const supabase = await createClient();
  const { error } = await supabase.from("lead_notes").insert({
    inquiry_id: inquiryId,
    author_agent_id: agentId,
    note: note.trim(),
  });
  if (error) return { success: false as const };
  return { success: true as const };
}
