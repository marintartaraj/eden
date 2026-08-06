"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
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

// Fulfills the Privacy Policy's "request deletion at any time by contacting
// us" promise. Deleting from auth.users isn't reachable through a plain RLS
// RPC the way set_user_role/set_account_status are — it only exists via
// Supabase's Auth Admin API, which requires the service-role client (see
// lib/supabase/admin.ts). That client bypasses RLS entirely, so the
// is_admin() check that a Postgres function would normally enforce has to
// happen here instead, before it's ever reached.
export async function deleteUserAccount(userId: string) {
  const current = await getCurrentUser();
  if (!current || current.profile.role !== "admin") return { success: false as const };
  if (current.user.id === userId) return { success: false as const };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { success: false as const };
  return { success: true as const };
}
