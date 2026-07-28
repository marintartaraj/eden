-- ============================================================================
-- Fix: guard_agent_property_edit / guard_agent_inquiry_edit both check
-- is_admin(), which relies on auth.uid() — null for service-role requests
-- (no JWT). That blocks even the SQL editor / service-role client from
-- assigning agents to properties or leads, the same gap Phase 1's
-- eden.bypass_role_guard flag already solved for profiles. Reusing that
-- flag here rather than inventing a new one — same "trusted internal
-- bypass" category.
-- ============================================================================

create or replace function public.guard_agent_property_edit()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() or current_setting('eden.bypass_role_guard', true) = 'true' then
    return new;
  end if;
  if new.is_featured is distinct from old.is_featured
     or new.is_exclusive is distinct from old.is_exclusive
     or new.agent_id is distinct from old.agent_id
     or new.submission_id is distinct from old.submission_id
     or new.source is distinct from old.source
  then
    raise exception 'not authorized to change this field';
  end if;
  if new.status is distinct from old.status and new.status = 'active' then
    raise exception 'only an administrator can publish a property';
  end if;
  return new;
end;
$$;

create or replace function public.guard_agent_inquiry_edit()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() or current_setting('eden.bypass_role_guard', true) = 'true' then
    return new;
  end if;
  if new.assigned_agent_id is distinct from old.assigned_agent_id then
    raise exception 'only an administrator can reassign this inquiry';
  end if;
  return new;
end;
$$;
