import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// auth.users.email isn't reachable from a plain client regardless of RLS
// (the auth schema isn't exposed via the API) — same constraint noted on
// admin_list_users() in 20260728100000_admin_dashboard.sql. This uses the
// service-role admin client instead, since it's called from trusted server
// actions (new submission/inquiry notifications), not from user input.
export async function getAdminEmails(): Promise<string[]> {
  const supabase = createAdminClient();

  const { data: admins, error } = await supabase.from("profiles").select("id").eq("role", "admin");
  if (error || !admins?.length) return [];

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) return [];

  const adminIds = new Set(admins.map((a) => a.id));
  return usersData.users
    .filter((u) => adminIds.has(u.id) && u.email)
    .map((u) => u.email as string);
}

export async function getUserEmailById(userId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) return null;
  return data.user?.email ?? null;
}
