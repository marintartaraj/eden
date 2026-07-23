-- Demo data: a video and floor plans on a couple of properties so the
-- video/floor-plan sections on the property detail page have something to
-- render. The video is a freely embeddable, Creative Commons–licensed
-- sample (Big Buck Bunny), not real property footage.

insert into public.property_videos (property_id, url, provider)
select p.id, 'https://www.youtube.com/embed/aqz-KE-bpKQ', 'youtube'
from public.properties p
where p.slug = 'apartament-3-dhoma-bllok-tirane';

insert into public.property_floor_plans (property_id, url, label)
select p.id, v.url, v.label
from public.properties p
join (values
  ('apartament-3-dhoma-bllok-tirane', 'https://picsum.photos/seed/floorplan-bllok-1/900/700', 'Kati 4'),
  ('vile-luksoze-lungomare-vlore', 'https://picsum.photos/seed/floorplan-vlore-1/900/700', 'Kati Përdhes'),
  ('vile-luksoze-lungomare-vlore', 'https://picsum.photos/seed/floorplan-vlore-2/900/700', 'Kati 1')
) as v (property_slug, url, label) on v.property_slug = p.slug;
