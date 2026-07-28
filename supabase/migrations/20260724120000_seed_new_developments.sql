-- ============================================================================
-- Seed data: new developments (demo content for the /new-developments page)
-- ============================================================================

insert into public.new_developments (
  slug, name_sq, name_en, developer_name, city_id, neighborhood_id,
  description_sq, description_en, delivery_date, cover_image, status
)
select
  v.slug, v.name_sq, v.name_en, v.developer_name, c.id, n.id,
  v.description_sq, v.description_en, v.delivery_date::date, v.cover_image, 'active'
from (values
  ('kompleksi-bllok-residence', 'Bllok Residence', 'Bllok Residence', 'Alba Construction',
   'tirane', 'bllok',
   'Kompleks rezidencial modern në zemër të Bllokut, me apartamente të projektuara për jetesë urbane premium.',
   'A modern residential complex in the heart of Bllok, with apartments designed for premium urban living.',
   '2026-12-01', 'https://picsum.photos/seed/bllok-residence/1600/900'),
  ('durres-marina-towers', 'Durrës Marina Towers', 'Durrës Marina Towers', 'Adriatik Group',
   'durres', 'plazh',
   'Dy kulla rezidenciale me pamje nga deti, pishinë dhe parking privat, në një hap nga plazhi i Durrësit.',
   'Two residential towers with sea views, a pool, and private parking, steps from Durrës beach.',
   '2027-06-01', 'https://picsum.photos/seed/durres-marina-towers/1600/900')
) as v(slug, name_sq, name_en, developer_name, city_slug, neighborhood_slug, description_sq, description_en, delivery_date, cover_image)
join public.cities c on c.slug = v.city_slug
join public.neighborhoods n on n.slug = v.neighborhood_slug and n.city_id = c.id;

-- Link a couple of existing demo properties to their development.
update public.properties p
set development_id = d.id
from public.new_developments d
where d.slug = 'kompleksi-bllok-residence'
  and p.slug = 'apartament-3-dhoma-bllok-tirane';

update public.properties p
set development_id = d.id
from public.new_developments d
where d.slug = 'durres-marina-towers'
  and p.slug = 'apartament-pamje-nga-deti-plazh-durres';
