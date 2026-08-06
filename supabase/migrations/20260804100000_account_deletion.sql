-- ============================================================================
-- Account deletion capability. The Privacy Policy promises deletion on
-- request "by contacting us" — until now nothing in the product could
-- fulfill that promise; there was no deletion path anywhere, self-service
-- or admin-assisted.
--
-- Two FKs referencing profiles were left at Postgres's default ON DELETE
-- NO ACTION (RESTRICT) rather than being given an explicit policy like
-- every other profiles-referencing FK in this schema already has:
-- inquiries.submitted_by_user_id and property_submissions.submitted_by_user_id.
-- That means deleting the auth.users row of anyone who ever submitted an
-- inquiry or a property listing while logged in — likely most real users —
-- would fail outright with a foreign key violation.
--
-- Business records (inquiries, submissions) are legitimate to retain after
-- account deletion — the Privacy Policy's own Data Retention section
-- already says as much ("resolve disputes, and meet legal obligations").
-- So this sets both to ON DELETE SET NULL, matching properties.submitted_by
-- and every other "who did this" reference in the schema: the record
-- survives, just disassociated from the now-deleted account.
-- ============================================================================

alter table public.inquiries
  drop constraint inquiries_submitted_by_user_id_fkey,
  add constraint inquiries_submitted_by_user_id_fkey
    foreign key (submitted_by_user_id) references public.profiles (id) on delete set null;

alter table public.property_submissions
  drop constraint property_submissions_submitted_by_user_id_fkey,
  add constraint property_submissions_submitted_by_user_id_fkey
    foreign key (submitted_by_user_id) references public.profiles (id) on delete set null;
