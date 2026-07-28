-- ============================================================================
-- Phase 3: agent dashboard — closes the open "agent could smuggle
-- is_featured/is_exclusive/agent_id/status='active' into an otherwise
-- legitimate update" gap on properties and inquiries, adds agent property
-- creation, lead_notes, and agent-scoped media delete. Also bundles a
-- one-line fix for a live regression Phase 2 introduced (see below).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- properties: agents keep full read/write on their assigned listing's
-- content, but not on featured/exclusive/reassignment/source/submission
-- linkage, and can never self-publish straight to 'active'.
-- ----------------------------------------------------------------------------

revoke update on public.properties from authenticated;
grant update (
  purpose, property_type, status, title_sq, title_en, description_sq, description_en,
  price, currency, price_period, city_id, neighborhood_id, residence_id, development_id,
  address_line, lat, lng, gross_area, net_area, bedrooms, bathrooms, floor, total_floors,
  furnishing, has_elevator, has_parking, construction_condition, construction_year,
  certificate_status, owner_contact_name, owner_contact_phone, owner_contact_email
) on public.properties to authenticated;

create function public.guard_agent_property_edit()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
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

create trigger trg_guard_agent_property_edit
  before update on public.properties
  for each row execute function public.guard_agent_property_edit();

create policy "properties: agent create assigned draft" on public.properties
  for insert with check (
    agent_id = public.current_agent_id() and status = 'draft' and source = 'agent'
  );

-- ----------------------------------------------------------------------------
-- inquiries: agents keep full read/write on their assigned leads' workflow
-- fields; reassigning a lead to a different agent becomes admin-only.
-- ----------------------------------------------------------------------------

revoke update on public.inquiries from authenticated;
grant update (status, internal_notes, follow_up_date) on public.inquiries to authenticated;

create function public.guard_agent_inquiry_edit()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.assigned_agent_id is distinct from old.assigned_agent_id then
    raise exception 'only an administrator can reassign this inquiry';
  end if;
  return new;
end;
$$;

create trigger trg_guard_agent_inquiry_edit
  before update on public.inquiries
  for each row execute function public.guard_agent_inquiry_edit();

-- ----------------------------------------------------------------------------
-- lead_notes: private running notes on a lead, distinct from the
-- single-value inquiries.internal_notes.
-- ----------------------------------------------------------------------------

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  author_agent_id uuid not null references public.agents (id),
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.lead_notes enable row level security;

create policy "lead_notes: read by assigned agent or admin" on public.lead_notes
  for select using (
    exists (select 1 from public.inquiries i where i.id = lead_notes.inquiry_id and i.assigned_agent_id = public.current_agent_id())
    or public.is_admin()
  );

create policy "lead_notes: create by assigned agent" on public.lead_notes
  for insert with check (
    author_agent_id = public.current_agent_id()
    and exists (select 1 from public.inquiries i where i.id = inquiry_id and i.assigned_agent_id = public.current_agent_id())
  );

create policy "lead_notes: author manages own note while still assigned" on public.lead_notes
  for update using (
    author_agent_id = public.current_agent_id()
    and exists (select 1 from public.inquiries i where i.id = lead_notes.inquiry_id and i.assigned_agent_id = public.current_agent_id())
  )
  with check (author_agent_id = public.current_agent_id());

create policy "lead_notes: author deletes own note while still assigned" on public.lead_notes
  for delete using (
    author_agent_id = public.current_agent_id()
    and exists (select 1 from public.inquiries i where i.id = lead_notes.inquiry_id and i.assigned_agent_id = public.current_agent_id())
  );

create policy "lead_notes: admin manage all" on public.lead_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- storage: agents/admins may delete objects they uploaded through the new
-- agent-properties/{propertyId}/... path convention. Deliberately NOT a
-- blanket "any authenticated user may delete from these buckets" policy:
-- "media: public read" has no `to` clause, so every object's exact path is
-- already visible to anon in every property page's <img src>, making a
-- blanket delete policy a site-wide vandalism vector, not just a
-- theoretical risk.
-- ----------------------------------------------------------------------------

create policy "media: agent/admin delete own property media" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('property-images', 'property-floor-plans')
    and exists (
      select 1 from public.properties p
      where p.id::text = (storage.foldername(name))[2]
        and (public.is_admin() or p.agent_id = public.current_agent_id())
    )
  );

-- ----------------------------------------------------------------------------
-- Bug fix: 20260723101616_allow_owner_submission_images.sql gated this
-- policy on p.status = 'pending', but the Phase 2 migration
-- (20260725100000_property_submissions.sql) changed the owner-submission
-- property insert to use status = 'draft' instead, without updating this
-- policy to match. Guest owner-submission photo uploads have been silently
-- failing under RLS ever since Phase 2 shipped.
-- ----------------------------------------------------------------------------

drop policy "property_images: public insert for pending owner submissions" on public.property_images;
create policy "property_images: public insert for pending owner submissions" on public.property_images
  for insert with check (
    exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
        and p.source = 'owner_submission' and p.status = 'draft'
    )
  );
