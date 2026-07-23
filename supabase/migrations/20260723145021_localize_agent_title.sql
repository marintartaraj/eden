-- `agents.title` was the only localized text field in the schema without
-- the `_sq`/`_en` pair used everywhere else (bio_sq/bio_en, name_sq/name_en,
-- title_sq/title_en on properties and guides), so the English site rendered
-- agent job titles in Albanian. Bring it in line with that convention.

alter table public.agents rename column title to title_sq;
alter table public.agents add column title_en text;

update public.agents set title_en = 'Senior Real Estate Agent' where slug = 'elira-hoxha';
update public.agents set title_en = 'Coastal Property Agent' where slug = 'andi-krasniqi';
update public.agents set title_en = 'New Developments Agent' where slug = 'fjona-bregu';
update public.agents set title_en = 'General Agent' where slug = 'gerald-meta';
