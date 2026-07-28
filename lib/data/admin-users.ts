import { createClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "visitor" | "owner" | "agent" | "admin" | "registered_user";
  account_status: string;
  created_at: string;
};

export async function getAllUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) throw error;
  return data ?? [];
}
