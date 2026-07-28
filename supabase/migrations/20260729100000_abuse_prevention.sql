-- ============================================================================
-- Abuse prevention for the public, unauthenticated entry points: the inquiry
-- form (general + viewing requests), the sell-property guest wizard (which
-- also opens 3 storage buckets to anonymous uploads), and signup. None of
-- these had any throttling before this migration — Zod validation only
-- checks shape, not request volume.
-- ============================================================================

-- IP-keyed sliding-window counter. Deliberately not exposed via PostgREST
-- directly (RLS enabled, no policies) — the only way in is the
-- security-definer function below, called via rpc() from server actions.
create table public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_hits_bucket_created_idx on public.rate_limit_hits (bucket, created_at);

alter table public.rate_limit_hits enable row level security;

-- Prunes expired hits for the window on every call rather than running a
-- separate cron job — fine at this traffic level, and keeps the table from
-- growing unbounded without needing scheduled infrastructure.
create function public.check_rate_limit(p_bucket text, p_max_hits int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  delete from public.rate_limit_hits
  where bucket = p_bucket and created_at < now() - (p_window_seconds || ' seconds')::interval;

  select count(*) into v_count
  from public.rate_limit_hits
  where bucket = p_bucket and created_at > now() - (p_window_seconds || ' seconds')::interval;

  if v_count >= p_max_hits then
    return false;
  end if;

  insert into public.rate_limit_hits (bucket) values (p_bucket);
  return true;
end;
$$;

grant execute on function public.check_rate_limit(text, int, int) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Per-submission upload quota. "media: public upload of property submissions"
-- (20260721111121_init_schema.sql) lets anyone insert into property-images/
-- property-floor-plans/property-videos with no count limit — the per-file
-- 50MiB cap in supabase/config.toml doesn't bound how many files. Storage
-- triggers can't see the requester's IP, so this scopes by upload path
-- instead: PhotoUploadField.tsx always writes under
-- `owner-submissions/<submissionId>/...`, so quota per submission-id is the
-- natural boundary already present in the existing upload convention.
-- ----------------------------------------------------------------------------

create function public.enforce_property_media_quota()
returns trigger
language plpgsql
as $$
declare
  v_count int;
  v_max constant int := 30;
  v_prefix text;
begin
  if new.bucket_id in ('property-images', 'property-floor-plans', 'property-videos')
     and (storage.foldername(new.name))[1] = 'owner-submissions'
     and (storage.foldername(new.name))[2] is not null
  then
    v_prefix := 'owner-submissions/' || (storage.foldername(new.name))[2] || '/';

    select count(*) into v_count
    from storage.objects
    where bucket_id = new.bucket_id and name like v_prefix || '%';

    if v_count >= v_max then
      raise exception 'upload quota exceeded for this submission';
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_enforce_property_media_quota
  before insert on storage.objects
  for each row execute function public.enforce_property_media_quota();
