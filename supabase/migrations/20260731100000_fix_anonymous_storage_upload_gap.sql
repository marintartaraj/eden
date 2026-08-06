-- ============================================================================
-- Fix: "media: public upload of property submissions" (init_schema.sql) lets
-- anyone insert into property-images/property-floor-plans/property-videos,
-- gated only on bucket_id — the owner-submissions/<id>/... path convention
-- is purely a client-side naming choice (PhotoUploadField.tsx generates <id>
-- via crypto.randomUUID() with zero server involvement), so the existing
-- per-prefix 30-file quota (20260729100000_abuse_prevention.sql) doesn't
-- actually bound anything: a client just mints a fresh id for every batch of
-- 30. Net effect: anonymous, effectively unlimited (up to the 50MiB
-- per-file cap), free file hosting on public buckets, entirely bypassing
-- the Turnstile/rate-limit checks that only guard submitPropertyListing()
-- (called long after photos are already uploaded).
--
-- The same policy (no `to` clause, no path check) also currently covers
-- agent-properties/<propertyId>/... uploads (AgentPhotoManager.tsx /
-- AgentFloorPlanManager.tsx) — so those are reachable by anonymous requests
-- today too, not just authenticated agents.
--
-- Fix: split into two properly scoped policies. Owner-submission uploads
-- require the <id> segment to reference a real, rate-limited reservation
-- token minted server-side. Agent/admin uploads require the <id> segment to
-- reference a property the caller actually owns/administers — mirroring
-- the logic "media: agent/admin delete own property media" already uses.
-- ============================================================================

create table public.submission_upload_tokens (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Same reasoning as rate_limit_hits: RLS enabled, no policies — the only
-- way in is the security-definer function below.
alter table public.submission_upload_tokens enable row level security;

create function public.reserve_submission_upload_token(p_ip text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token_id uuid;
begin
  if not public.check_rate_limit('submission-upload-token:' || coalesce(p_ip, 'unknown'), 10, 3600) then
    raise exception 'rate limit exceeded';
  end if;

  -- Self-pruning, same pattern as check_rate_limit: a reservation is only
  -- ever needed for the few minutes it takes to move through the wizard's
  -- photo step, so anything older than a day is dead weight.
  delete from public.submission_upload_tokens where created_at < now() - interval '1 day';

  insert into public.submission_upload_tokens default values returning id into v_token_id;
  return v_token_id;
end;
$$;

grant execute on function public.reserve_submission_upload_token(text) to anon, authenticated;

drop policy "media: public upload of property submissions" on storage.objects;

create policy "media: public upload of property submissions" on storage.objects
  for insert
  with check (
    bucket_id in ('property-images', 'property-floor-plans', 'property-videos')
    and (storage.foldername(name))[1] = 'owner-submissions'
    and exists (
      select 1 from public.submission_upload_tokens
      where id::text = (storage.foldername(name))[2]
    )
  );

create policy "media: agent/admin upload own property media" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('property-images', 'property-floor-plans')
    and (storage.foldername(name))[1] = 'agent-properties'
    and exists (
      select 1 from public.properties p
      where p.id::text = (storage.foldername(name))[2]
        and (public.is_admin() or p.agent_id = public.current_agent_id())
    )
  );
