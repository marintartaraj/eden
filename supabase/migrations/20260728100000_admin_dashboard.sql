-- ============================================================================
-- Phase 4: admin dashboard — submission review/publish pipeline, agent
-- assignment (properties, leads, and the agents directory itself), and
-- user/role management. Replaces every manual-SQL step used for testing
-- Phases 1-3 with real admin tooling.
-- ============================================================================

-- properties.published_at has existed since the initial schema but nothing
-- has ever set it. Set it the first time a property transitions to active.
create function public.set_property_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'active' and old.status is distinct from 'active' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger trg_set_property_published_at
  before update on public.properties
  for each row execute function public.set_property_published_at();

-- guard_agent_property_edit()/guard_agent_inquiry_edit() (Phase 3) already
-- unconditionally block non-admins from changing these columns' values —
-- the column grant just hasn't caught up, so even an admin's own
-- authenticated session can't reach them yet. Widening the grant is safe:
-- the guard triggers fire and can raise before RLS WITH CHECK is ever
-- evaluated, so this doesn't open anything the triggers don't already
-- close for non-admins.
grant update (is_featured, is_exclusive, agent_id) on public.properties to authenticated;
grant update (assigned_agent_id) on public.inquiries to authenticated;

-- ----------------------------------------------------------------------------
-- Close a pre-existing gap found while designing this phase: `agents` has
-- never had a column-level grant restriction, and unlike properties/
-- inquiries, nothing value-gates "agents: update own". Any user linked as
-- an agent could PATCH every column on their own row today — is_featured,
-- sort_order, slug, license_no, email, full_name, title — since WITH CHECK
-- only re-validates profile_id = auth.uid(). No UI exposes this yet, but
-- it's a live hole and this phase is already touching agents for admin
-- directory/linking tooling, so it's fixed here rather than filed
-- separately (same call as bundling the Phase 2 photo-policy fix into
-- Phase 3's migration).
-- ----------------------------------------------------------------------------

revoke update on public.agents from authenticated;
grant update (bio_sq, bio_en, phone, whatsapp, photo_url) on public.agents to authenticated;

create function public.guard_agent_self_edit()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() or current_setting('eden.bypass_role_guard', true) = 'true' then
    return new;
  end if;
  if new.is_featured is distinct from old.is_featured
     or new.sort_order is distinct from old.sort_order
     or new.slug is distinct from old.slug
     or new.license_no is distinct from old.license_no
     or new.profile_id is distinct from old.profile_id
     or new.email is distinct from old.email
     or new.full_name is distinct from old.full_name
     or new.title_sq is distinct from old.title_sq
     or new.title_en is distinct from old.title_en
  then
    raise exception 'not authorized to change this field';
  end if;
  return new;
end;
$$;

create trigger trg_guard_agent_self_edit
  before update on public.agents
  for each row execute function public.guard_agent_self_edit();

-- ----------------------------------------------------------------------------
-- Submission review pipeline. Bundles the submission-status transition and
-- its side effect on the linked property into one transaction (the split-
-- REST-call pitfall already hit once this session with the lead-
-- reassignment trigger fix, where set_config() and the following UPDATE
-- needed to share a transaction). Sources the published property's
-- agent_id from the submission's own assigned_agent_id, not the property's
-- stale prior value, so a previously-assigned agent isn't silently dropped
-- if an admin publishes without re-passing it.
-- ----------------------------------------------------------------------------

create function public.admin_review_submission(
  p_submission_id uuid,
  p_new_status public.submission_status,
  p_feedback text default null,
  p_agent_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status public.submission_status;
  v_agent_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if p_new_status not in ('pending_review', 'more_info_required', 'published', 'rejected') then
    raise exception 'invalid target status';
  end if;

  select status into v_current_status from public.property_submissions where id = p_submission_id;
  if v_current_status is null then
    raise exception 'submission not found';
  end if;
  if v_current_status not in ('submitted', 'pending_review', 'more_info_required') then
    raise exception 'submission is no longer under review (status: %)', v_current_status;
  end if;

  update public.property_submissions
  set status = p_new_status,
      admin_feedback = coalesce(p_feedback, admin_feedback),
      assigned_agent_id = coalesce(p_agent_id, assigned_agent_id)
  where id = p_submission_id
  returning assigned_agent_id into v_agent_id;

  if p_new_status = 'published' then
    update public.properties
    set status = 'active', agent_id = coalesce(v_agent_id, agent_id)
    where submission_id = p_submission_id;
  elsif p_new_status = 'rejected' then
    update public.properties set status = 'archived' where submission_id = p_submission_id;
  end if;
end;
$$;

-- Sibling to Phase 1's set_user_role, same shape, for suspend/reactivate.
create function public.set_account_status(target_user_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if new_status not in ('active', 'suspended') then
    raise exception 'invalid status';
  end if;
  perform set_config('eden.bypass_role_guard', 'true', true);
  update public.profiles set account_status = new_status where id = target_user_id;
end;
$$;

-- Schema-bridge, not a permissions workaround: auth.users.email isn't
-- reachable from a plain authenticated PostgREST client at all, regardless
-- of RLS/grants, since the auth schema isn't exposed via the API.
create function public.admin_list_users()
returns table (
  id uuid, email text, full_name text, role public.user_role,
  account_status text, created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  return query
    select p.id, u.email::text, p.full_name, p.role, p.account_status, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;
