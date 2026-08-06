"use server";

import { createClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/rate-limit";

/**
 * Mints a rate-limited storage-upload reservation for the sell-property
 * guest wizard (see reserve_submission_upload_token() /
 * 20260731100000_fix_anonymous_storage_upload_gap.sql). The returned id
 * becomes the owner-submissions/<id>/... path segment that the storage RLS
 * policy requires — a plain client-generated UUID no longer authorizes an
 * upload on its own.
 */
export async function reserveSubmissionUploadToken(): Promise<string | null> {
  const ip = await getClientIp();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reserve_submission_upload_token", { p_ip: ip });
  if (error) return null;
  return data;
}
