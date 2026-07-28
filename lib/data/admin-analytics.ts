import { createClient } from "@/lib/supabase/server";

export type PlatformStats = {
  submissionsNeedingReview: number;
  totalProperties: number;
  activeProperties: number;
  totalUsers: number;
  totalAgents: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = await createClient();

  const [submissions, properties, activeProperties, users, agents] = await Promise.all([
    supabase
      .from("property_submissions")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "pending_review", "more_info_required"]),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("agents").select("id", { count: "exact", head: true }),
  ]);

  return {
    submissionsNeedingReview: submissions.count ?? 0,
    totalProperties: properties.count ?? 0,
    activeProperties: activeProperties.count ?? 0,
    totalUsers: users.count ?? 0,
    totalAgents: agents.count ?? 0,
  };
}
