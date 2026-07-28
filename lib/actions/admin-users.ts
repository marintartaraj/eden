"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type UserRole = Database["public"]["Enums"]["user_role"];

export async function setUserRole(userId: string, role: UserRole) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_role", {
    target_user_id: userId,
    new_role: role,
  });
  if (error) return { success: false as const };
  return { success: true as const };
}

export async function setAccountStatus(userId: string, status: "active" | "suspended") {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_account_status", {
    target_user_id: userId,
    new_status: status,
  });
  if (error) return { success: false as const };
  return { success: true as const };
}
