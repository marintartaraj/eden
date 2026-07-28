-- ============================================================================
-- Phase 2: property_submissions (owner submission tracking), plus the small
-- schema additions needed to attach existing guest-only flows (property
-- submission, inquiries) to a real account when the submitter is logged in.
-- ============================================================================

create type public.submission_status as enum (
  'draft', 'submitted', 'pending_review', 'more_info_required',
  'approved', 'rejected', 'published', 'withdrawn', 'archived'
);

create table public.property_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by_user_id uuid references public.profiles (id),
  guest_name text,
  guest_phone text,
  guest_email text,
  status public.submission_status not null default 'submitted',
  assigned_agent_id uuid references public.agents (id),
  admin_feedback text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_property_submissions_updated_at
  before update on public.property_submissions
  for each row execute function public.set_updated_at();

alter table public.properties
  add column submission_id uuid references public.property_submissions (id);

alter table public.property_submissions enable row level security;

create policy "property_submissions: read own or assigned or admin"
  on public.property_submissions for select using (
    submitted_by_user_id = auth.uid()
    or assigned_agent_id = public.current_agent_id()
    or public.is_admin()
  );

-- Guests (null) or a logged-in user submitting for themselves only —
-- prevents attributing a submission to someone else's account.
create policy "property_submissions: create own or guest"
  on public.property_submissions for insert
  with check (submitted_by_user_id is null or submitted_by_user_id = auth.uid());

create policy "property_submissions: owner withdraw own"
  on public.property_submissions for update
  using (submitted_by_user_id = auth.uid() and status in ('submitted', 'pending_review'))
  with check (submitted_by_user_id = auth.uid() and status = 'withdrawn');

create policy "property_submissions: admin manage all"
  on public.property_submissions for all
  using (public.is_admin()) with check (public.is_admin());

-- Column grant closes what the withdraw policy's WITH CHECK can't: it only
-- validates the resulting status value, not which OTHER columns a client
-- smuggles into the same UPDATE (e.g. admin_feedback). Same pattern as the
-- Phase 1 profiles fix. Phase 4 will need a broader grant/function here for
-- admin-driven status transitions beyond withdraw.
revoke update on public.property_submissions from authenticated;
grant update (status) on public.property_submissions to authenticated;

-- The existing owner-submission insert policy checked status = 'pending';
-- Phase 2 creates the linked `properties` row with status = 'draft' instead
-- (the richer workflow state now lives on the submission), so the policy
-- needs updating to match — and gains the same anti-impersonation check as
-- property_submissions above.
drop policy "properties: public owner submission" on public.properties;
create policy "properties: public owner submission" on public.properties
  for insert with check (
    source = 'owner_submission' and status = 'draft'
    and (submitted_by is null or submitted_by = auth.uid())
  );

alter table public.inquiries
  add column submitted_by_user_id uuid references public.profiles (id);

create policy "inquiries: read own" on public.inquiries
  for select using (submitted_by_user_id = auth.uid());

drop policy "inquiries: anyone can submit" on public.inquiries;
create policy "inquiries: anyone can submit" on public.inquiries
  for insert with check (submitted_by_user_id is null or submitted_by_user_id = auth.uid());
