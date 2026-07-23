-- ============================================================================
-- Eden — initial schema: enums, tables, indexes, triggers, RLS, storage
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

create type public.user_role as enum ('visitor', 'owner', 'agent', 'admin');

create type public.property_purpose as enum ('sale', 'rent');

create type public.property_status as enum (
  'draft', 'pending', 'active', 'reserved', 'sold', 'rented', 'archived'
);

create type public.property_source as enum ('admin', 'owner_submission');

create type public.property_type as enum (
  'apartment', 'studio', 'villa', 'house', 'land', 'office',
  'shop', 'commercial', 'warehouse', 'hotel', 'parking', 'building'
);

create type public.furnishing_status as enum ('unfurnished', 'semi_furnished', 'furnished');

create type public.construction_condition as enum (
  'new', 'under_construction', 'renovated', 'needs_renovation', 'old'
);

create type public.certificate_status as enum ('yes', 'no', 'in_process');

create type public.inquiry_type as enum ('general', 'viewing_request');

create type public.inquiry_status as enum ('new', 'contacted', 'qualified', 'closed');

-- ----------------------------------------------------------------------------
-- Helper functions (defined early, used by triggers/RLS below)
--
-- Note: only `set_updated_at` lives here. `is_admin` / `current_agent_id`
-- are LANGUAGE SQL functions, and Postgres resolves the tables they
-- reference at CREATE FUNCTION time (unlike plpgsql, which resolves lazily)
-- — so they're defined further down, after `profiles` and `agents` exist.
-- ----------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'visitor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Locations: cities -> neighborhoods -> residences
-- ----------------------------------------------------------------------------

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_sq text not null,
  name_en text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete cascade,
  slug text not null,
  name_sq text not null,
  name_en text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (city_id, slug)
);

create table public.residences (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references public.neighborhoods (id) on delete cascade,
  slug text not null,
  name_sq text not null,
  name_en text not null,
  created_at timestamptz not null default now(),
  unique (neighborhood_id, slug)
);

create index neighborhoods_city_idx on public.neighborhoods (city_id);
create index residences_neighborhood_idx on public.residences (neighborhood_id);

-- ----------------------------------------------------------------------------
-- Amenities
-- ----------------------------------------------------------------------------

create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_sq text not null,
  name_en text not null,
  icon text
);

-- ----------------------------------------------------------------------------
-- Agents
-- ----------------------------------------------------------------------------

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  slug text not null unique,
  title text,
  bio_sq text,
  bio_en text,
  phone text,
  whatsapp text,
  email text,
  photo_url text,
  license_no text,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_agents_updated_at
  before update on public.agents
  for each row execute function public.set_updated_at();

-- `profiles` and `agents` both exist from here on, so these can be defined now.

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create function public.current_agent_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.agents where profile_id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- New developments
-- ----------------------------------------------------------------------------

create table public.new_developments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_sq text not null,
  name_en text,
  developer_name text,
  city_id uuid references public.cities (id),
  neighborhood_id uuid references public.neighborhoods (id),
  description_sq text,
  description_en text,
  delivery_date date,
  cover_image text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_new_developments_updated_at
  before update on public.new_developments
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Properties
-- ----------------------------------------------------------------------------

create sequence public.property_reference_seq start with 100001;

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  reference_code text unique,
  purpose public.property_purpose not null,
  property_type public.property_type not null,
  status public.property_status not null default 'draft',
  source public.property_source not null default 'admin',
  is_featured boolean not null default false,
  is_exclusive boolean not null default false,

  title_sq text not null,
  title_en text,
  description_sq text,
  description_en text,

  price numeric(12, 2) not null,
  currency text not null default 'EUR',
  price_period text,

  city_id uuid references public.cities (id),
  neighborhood_id uuid references public.neighborhoods (id),
  residence_id uuid references public.residences (id),
  development_id uuid references public.new_developments (id),
  address_line text,
  lat double precision,
  lng double precision,

  gross_area numeric(8, 2),
  net_area numeric(8, 2),
  bedrooms int,
  bathrooms int,
  floor int,
  total_floors int,
  furnishing public.furnishing_status,
  has_elevator boolean not null default false,
  has_parking boolean not null default false,
  construction_condition public.construction_condition,
  construction_year int,
  certificate_status public.certificate_status,

  agent_id uuid references public.agents (id) on delete set null,
  owner_contact_name text,
  owner_contact_phone text,
  owner_contact_email text,
  submitted_by uuid references public.profiles (id) on delete set null,

  views_count int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

create function public.set_property_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference_code is null then
    new.reference_code := 'ED-' || nextval('public.property_reference_seq')::text;
  end if;
  return new;
end;
$$;

create trigger trg_set_property_reference
  before insert on public.properties
  for each row execute function public.set_property_reference();

create index properties_status_idx on public.properties (status);
create index properties_purpose_idx on public.properties (purpose);
create index properties_property_type_idx on public.properties (property_type);
create index properties_city_idx on public.properties (city_id);
create index properties_neighborhood_idx on public.properties (neighborhood_id);
create index properties_price_idx on public.properties (price);
create index properties_agent_idx on public.properties (agent_id);
create index properties_featured_idx on public.properties (is_featured) where is_featured = true;

-- ----------------------------------------------------------------------------
-- Property media
-- ----------------------------------------------------------------------------

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.property_videos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  url text not null,
  provider text,
  created_at timestamptz not null default now()
);

create table public.property_floor_plans (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  url text not null,
  label text,
  created_at timestamptz not null default now()
);

create table public.property_amenities (
  property_id uuid not null references public.properties (id) on delete cascade,
  amenity_id uuid not null references public.amenities (id) on delete cascade,
  primary key (property_id, amenity_id)
);

create index property_images_property_idx on public.property_images (property_id);
create index property_videos_property_idx on public.property_videos (property_id);
create index property_floor_plans_property_idx on public.property_floor_plans (property_id);

-- ----------------------------------------------------------------------------
-- Inquiries (general + viewing requests)
-- ----------------------------------------------------------------------------

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete cascade,
  type public.inquiry_type not null default 'general',
  name text not null,
  email text,
  phone text,
  message text,
  preferred_date date,
  preferred_time text,
  status public.inquiry_status not null default 'new',
  assigned_agent_id uuid references public.agents (id) on delete set null,
  internal_notes text,
  follow_up_date date,
  created_at timestamptz not null default now()
);

create index inquiries_property_idx on public.inquiries (property_id);
create index inquiries_status_idx on public.inquiries (status);
create index inquiries_assigned_agent_idx on public.inquiries (assigned_agent_id);

-- ----------------------------------------------------------------------------
-- Favorites & saved searches
-- ----------------------------------------------------------------------------

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, property_id)
);

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  notify boolean not null default false,
  created_at timestamptz not null default now()
);

create index favorites_user_idx on public.favorites (user_id);
create index saved_searches_user_idx on public.saved_searches (user_id);

-- ----------------------------------------------------------------------------
-- Content: guides & testimonials
-- ----------------------------------------------------------------------------

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_sq text not null,
  title_en text,
  content_sq text,
  content_en text,
  cover_image text,
  author_id uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  content_sq text not null,
  content_en text,
  avatar_url text,
  rating int check (rating between 1 and 5),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.cities enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.residences enable row level security;
alter table public.amenities enable row level security;
alter table public.agents enable row level security;
alter table public.new_developments enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_videos enable row level security;
alter table public.property_floor_plans enable row level security;
alter table public.property_amenities enable row level security;
alter table public.inquiries enable row level security;
alter table public.favorites enable row level security;
alter table public.saved_searches enable row level security;
alter table public.guides enable row level security;
alter table public.testimonials enable row level security;

-- profiles ---------------------------------------------------------------

create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles: admin manage all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- public reference data (read-only to everyone, admin-writable) ----------

create policy "cities: public read" on public.cities for select using (true);
create policy "cities: admin write" on public.cities for all using (public.is_admin()) with check (public.is_admin());

create policy "neighborhoods: public read" on public.neighborhoods for select using (true);
create policy "neighborhoods: admin write" on public.neighborhoods for all using (public.is_admin()) with check (public.is_admin());

create policy "residences: public read" on public.residences for select using (true);
create policy "residences: admin write" on public.residences for all using (public.is_admin()) with check (public.is_admin());

create policy "amenities: public read" on public.amenities for select using (true);
create policy "amenities: admin write" on public.amenities for all using (public.is_admin()) with check (public.is_admin());

create policy "guides: public read published" on public.guides
  for select using (published_at is not null or public.is_admin());
create policy "guides: admin write" on public.guides for all using (public.is_admin()) with check (public.is_admin());

create policy "testimonials: public read" on public.testimonials for select using (true);
create policy "testimonials: admin write" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());

create policy "new_developments: public read" on public.new_developments for select using (true);
create policy "new_developments: admin write" on public.new_developments for all using (public.is_admin()) with check (public.is_admin());

-- agents -------------------------------------------------------------------

create policy "agents: public read" on public.agents for select using (true);
create policy "agents: update own" on public.agents
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "agents: admin manage all" on public.agents
  for all using (public.is_admin()) with check (public.is_admin());

-- properties -----------------------------------------------------------------

create policy "properties: read active or own" on public.properties
  for select using (
    status = 'active'
    or public.is_admin()
    or agent_id = public.current_agent_id()
    or submitted_by = auth.uid()
  );

create policy "properties: public owner submission" on public.properties
  for insert with check (source = 'owner_submission' and status = 'pending');

create policy "properties: agent update assigned" on public.properties
  for update using (agent_id = public.current_agent_id())
  with check (agent_id = public.current_agent_id());

create policy "properties: admin manage all" on public.properties
  for all using (public.is_admin()) with check (public.is_admin());

-- property media (visibility follows the parent property) ------------------

create policy "property_images: read if property visible" on public.property_images
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
        and (p.status = 'active' or public.is_admin() or p.agent_id = public.current_agent_id() or p.submitted_by = auth.uid())
    )
  );
create policy "property_images: write by admin or assigned agent" on public.property_images
  for all using (
    public.is_admin()
    or exists (select 1 from public.properties p where p.id = property_images.property_id and p.agent_id = public.current_agent_id())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.properties p where p.id = property_images.property_id and p.agent_id = public.current_agent_id())
  );

create policy "property_videos: read if property visible" on public.property_videos
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = property_videos.property_id
        and (p.status = 'active' or public.is_admin() or p.agent_id = public.current_agent_id() or p.submitted_by = auth.uid())
    )
  );
create policy "property_videos: write by admin or assigned agent" on public.property_videos
  for all using (
    public.is_admin()
    or exists (select 1 from public.properties p where p.id = property_videos.property_id and p.agent_id = public.current_agent_id())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.properties p where p.id = property_videos.property_id and p.agent_id = public.current_agent_id())
  );

create policy "property_floor_plans: read if property visible" on public.property_floor_plans
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = property_floor_plans.property_id
        and (p.status = 'active' or public.is_admin() or p.agent_id = public.current_agent_id() or p.submitted_by = auth.uid())
    )
  );
create policy "property_floor_plans: write by admin or assigned agent" on public.property_floor_plans
  for all using (
    public.is_admin()
    or exists (select 1 from public.properties p where p.id = property_floor_plans.property_id and p.agent_id = public.current_agent_id())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.properties p where p.id = property_floor_plans.property_id and p.agent_id = public.current_agent_id())
  );

create policy "property_amenities: read if property visible" on public.property_amenities
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = property_amenities.property_id
        and (p.status = 'active' or public.is_admin() or p.agent_id = public.current_agent_id() or p.submitted_by = auth.uid())
    )
  );
create policy "property_amenities: write by admin or assigned agent" on public.property_amenities
  for all using (
    public.is_admin()
    or exists (select 1 from public.properties p where p.id = property_amenities.property_id and p.agent_id = public.current_agent_id())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.properties p where p.id = property_amenities.property_id and p.agent_id = public.current_agent_id())
  );

-- inquiries ------------------------------------------------------------------

create policy "inquiries: anyone can submit" on public.inquiries
  for insert with check (true);

create policy "inquiries: agent read assigned" on public.inquiries
  for select using (assigned_agent_id = public.current_agent_id());
create policy "inquiries: agent update assigned" on public.inquiries
  for update using (assigned_agent_id = public.current_agent_id())
  with check (assigned_agent_id = public.current_agent_id());

create policy "inquiries: admin manage all" on public.inquiries
  for all using (public.is_admin()) with check (public.is_admin());

-- favorites & saved searches ---------------------------------------------

create policy "favorites: manage own" on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "saved_searches: manage own" on public.saved_searches
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- Storage buckets
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('property-images', 'property-images', true),
  ('property-floor-plans', 'property-floor-plans', true),
  ('property-videos', 'property-videos', true),
  ('agent-photos', 'agent-photos', true)
on conflict (id) do nothing;

create policy "media: public read" on storage.objects
  for select using (
    bucket_id in ('property-images', 'property-floor-plans', 'property-videos', 'agent-photos')
  );

create policy "media: public upload of property submissions" on storage.objects
  for insert with check (
    bucket_id in ('property-images', 'property-floor-plans', 'property-videos')
  );

create policy "media: authenticated upload agent photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'agent-photos');

create policy "media: admin manage all" on storage.objects
  for all using (public.is_admin()) with check (public.is_admin());
