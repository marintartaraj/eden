-- ============================================================================
-- Profiles: real accounts, account_status, and a guarded role-change path
--
-- New signups now default to 'registered_user' (previously 'visitor', which
-- was a placeholder from before real authentication existed). 'visitor' and
-- 'owner' remain defined on the enum but are intentionally never stored:
-- a visitor has no profile row at all, and "owner" is derived by checking
-- for property submissions rather than being a persisted role.
-- ============================================================================

alter table public.profiles
  alter column role set default 'registered_user';

alter table public.profiles
  add column account_status text not null default 'active'
    check (account_status in ('active', 'suspended'));

-- ----------------------------------------------------------------------------
-- Column-level grants: RLS only filters rows, not columns. Without this, the
-- existing "profiles: update own" policy (id = auth.uid()) lets any
-- authenticated user PATCH their own role/account_status directly.
-- ----------------------------------------------------------------------------

revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

-- ----------------------------------------------------------------------------
-- set_user_role: the sole sanctioned path for changing role/account_status.
-- Uses a transaction-local GUC flag (not auth.uid()/is_admin()) so the guard
-- trigger below recognizes it the same way whether it's called from an
-- admin's own session or from the service-role client.
-- ----------------------------------------------------------------------------

create function public.set_user_role(target_user_id uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  perform set_config('eden.bypass_role_guard', 'true', true);
  update public.profiles set role = new_role where id = target_user_id;
end;
$$;

create function public.prevent_role_self_elevation()
returns trigger
language plpgsql
as $$
begin
  if (new.role is distinct from old.role or new.account_status is distinct from old.account_status)
     and not (public.is_admin() or current_setting('eden.bypass_role_guard', true) = 'true') then
    raise exception 'role/account_status may only be changed via set_user_role()';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_self_elevation
  before update on public.profiles
  for each row execute function public.prevent_role_self_elevation();
