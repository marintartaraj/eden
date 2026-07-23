-- Agents need a display name independent of `profiles`: an agent can be
-- listed on the site before (or without ever) having a login account, so
-- `profile_id` alone isn't a reliable source of their name.

alter table public.agents add column full_name text not null default '';

update public.agents set full_name = 'Elira Hoxha' where slug = 'elira-hoxha';
update public.agents set full_name = 'Andi Krasniqi' where slug = 'andi-krasniqi';
update public.agents set full_name = 'Fjona Bregu' where slug = 'fjona-bregu';
update public.agents set full_name = 'Gerald Meta' where slug = 'gerald-meta';

alter table public.agents alter column full_name drop default;
