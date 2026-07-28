import "server-only";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * IP-keyed sliding-window check backed by public.check_rate_limit() (see
 * 20260729100000_abuse_prevention.sql). Fails open on infra errors — an
 * outage in this check shouldn't take down the underlying form.
 */
export async function checkRateLimit(
  action: string,
  maxHits: number,
  windowSeconds: number,
): Promise<boolean> {
  const ip = await getClientIp();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_bucket: `${action}:${ip}`,
    p_max_hits: maxHits,
    p_window_seconds: windowSeconds,
  });
  if (error) return true;
  return data === true;
}
