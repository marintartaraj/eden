-- ============================================================================
-- Fix: the storage.objects INSERT policy added in
-- 20260731100000_fix_anonymous_storage_upload_gap.sql checks
-- `exists (select 1 from public.submission_upload_tokens where ...)` — that
-- subquery runs as the requesting role (anon/authenticated), not as the
-- security-definer reserve_submission_upload_token() function that inserted
-- the row. submission_upload_tokens has RLS enabled with zero policies, so
-- the subquery sees no rows at all under any role, rejecting every upload
-- — including ones with a real, freshly reserved token, not just forged
-- ones. Verified live: both a real token and a fake UUID got the same 403.
--
-- A token's whole purpose is to be presented back as proof of reservation
-- (a bearer capability, not a secret) — the table holds nothing but random
-- ids and timestamps, so a public SELECT policy costs nothing and is what
-- the exists() check actually needs to work.
-- ============================================================================

create policy "submission_upload_tokens: public read" on public.submission_upload_tokens
  for select using (true);
