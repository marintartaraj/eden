-- Owner-submitted properties need their photos inserted by the same
-- anonymous visitor who just created them, before any agent/admin is
-- attached — the existing "write by admin or assigned agent" policy on
-- property_images doesn't cover this case at all.
create policy "property_images: public insert for pending owner submissions" on public.property_images
  for insert with check (
    exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
        and p.source = 'owner_submission'
        and p.status = 'pending'
    )
  );
