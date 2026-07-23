-- ============================================================================
-- Demo content: agents, properties, media, amenities, testimonials, guides.
--
-- This is placeholder data for local/staging development so the homepage and
-- listing pages have something real to render. Images are generic Lorem
-- Picsum placeholders (not real property photography). Safe to delete this
-- migration's rows (or the whole file, before it ships to production) once
-- real content is entered through the admin panel.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Agents
-- ----------------------------------------------------------------------------

insert into public.agents (slug, title, bio_sq, bio_en, phone, whatsapp, email, photo_url, license_no, is_featured, sort_order) values
  ('elira-hoxha', 'Agjente e Lartë e Patundshmërive', 'Elira punon prej 8 vitesh me pronat rezidenciale në Tiranë, e specializuar në Bllok dhe Komunën e Parisit.', 'Elira has spent 8 years working with residential property in Tirana, specializing in Bllok and Komuna e Parisit.', '+355 69 200 1001', '+355692001001', 'elira.hoxha@eden.al', 'https://picsum.photos/seed/agent-elira-hoxha/400/400', 'AL-RE-1001', true, 10),
  ('andi-krasniqi', 'Agjent i Pronave Bregdetare', 'Andi ndihmon blerësit dhe qiramarrësit të gjejnë prona përgjatë bregdetit jugor, nga Vlora deri në Sarandë.', 'Andi helps buyers and renters find property along the southern coast, from Vlorë to Sarandë.', '+355 69 200 1002', '+355692001002', 'andi.krasniqi@eden.al', 'https://picsum.photos/seed/agent-andi-krasniqi/400/400', 'AL-RE-1002', true, 20),
  ('fjona-bregu', 'Agjente e Projekteve të Reja', 'Fjona bashkëpunon me zhvillues për projekte të reja rezidenciale dhe komerciale në Tiranë.', 'Fjona works with developers on new residential and commercial projects across Tirana.', '+355 69 200 1003', '+355692001003', 'fjona.bregu@eden.al', 'https://picsum.photos/seed/agent-fjona-bregu/400/400', 'AL-RE-1003', true, 30),
  ('gerald-meta', 'Agjent i Përgjithshëm', 'Gerald mbulon Durrësin dhe zonat përreth, nga apartamentet familjare tek investimet me qira.', 'Gerald covers Durrës and the surrounding area, from family apartments to rental investments.', '+355 69 200 1004', '+355692001004', 'gerald.meta@eden.al', 'https://picsum.photos/seed/agent-gerald-meta/400/400', 'AL-RE-1004', false, 40);

-- ----------------------------------------------------------------------------
-- Properties
-- ----------------------------------------------------------------------------

insert into public.properties (
  slug, purpose, property_type, status, source, is_featured, is_exclusive,
  title_sq, title_en, description_sq, description_en,
  price, currency, price_period,
  city_id, neighborhood_id, address_line,
  gross_area, net_area, bedrooms, bathrooms, floor, total_floors,
  furnishing, has_elevator, has_parking, construction_condition, construction_year, certificate_status,
  agent_id, published_at
)
select
  v.slug, v.purpose::public.property_purpose, v.property_type::public.property_type,
  'active'::public.property_status, 'admin'::public.property_source,
  v.is_featured, v.is_exclusive,
  v.title_sq, v.title_en, v.description_sq, v.description_en,
  v.price, 'EUR', v.price_period,
  c.id, n.id, v.address_line,
  v.gross_area, v.net_area, v.bedrooms, v.bathrooms, v.floor, v.total_floors,
  v.furnishing::public.furnishing_status, v.has_elevator, v.has_parking,
  v.construction_condition::public.construction_condition, v.construction_year,
  v.certificate_status::public.certificate_status,
  a.id, now() - (v.days_ago || ' days')::interval
from (values
  ('apartament-3-dhoma-bllok-tirane', 'sale', 'apartment', true, true,
   'Apartament modern 3-dhomësh në Bllok', 'Modern 3-bedroom apartment in Bllok',
   'Apartament i rinovuar plotësisht në zemër të Bllokut, pranë kafeneve dhe restoranteve më të njohura të Tiranës.',
   'Fully renovated apartment in the heart of Bllok, close to Tirana''s most popular cafés and restaurants.',
   185000, null, 'tirane', 'bllok', 'Rruga Ibrahim Rugova',
   145.0, 128.0, 3, 2, 4, 7, 'furnished', true, true, 'renovated', 2019, 'yes', 'elira-hoxha', 3),

  ('apartament-2-dhoma-komuna-parisit-tirane', 'rent', 'apartment', true, false,
   'Apartament 2-dhomësh me qira në Komunën e Parisit', '2-bedroom apartment for rent in Komuna e Parisit',
   'Apartament i mobiluar në një nga zonat më të kërkuara për qira afatgjatë në Tiranë.',
   'Furnished apartment in one of Tirana''s most sought-after long-term rental areas.',
   650, 'month', 'tirane', 'komuna-e-parisit', 'Rruga Vaso Pasha',
   95.0, 85.0, 2, 1, 2, 5, 'furnished', true, false, 'new', 2021, 'yes', 'elira-hoxha', 1),

  ('studio-me-qira-astir-tirane', 'rent', 'studio', false, false,
   'Studio i vogël me qira në Astir', 'Compact studio for rent in Astir',
   'Studio funksional, ideal për studentë ose të rinj profesionistë.',
   'Functional studio, ideal for students or young professionals.',
   350, 'month', 'tirane', 'astir', 'Rruga e Astirit',
   42.0, 38.0, 1, 1, 3, 8, 'semi_furnished', true, false, 'new', 2022, 'yes', 'gerald-meta', 6),

  ('apartament-pamje-nga-deti-plazh-durres', 'sale', 'apartment', true, false,
   'Apartament me pamje nga deti në Plazh, Durrës', 'Sea-view apartment in Plazh, Durrës',
   'Apartament i ndritshëm me ballkon të gjerë dhe pamje direkte nga deti.',
   'Bright apartment with a wide balcony and direct sea views.',
   95000, null, 'durres', 'plazh', 'Rruga Taulantia',
   78.0, 70.0, 2, 1, 5, 9, 'unfurnished', true, true, 'new', 2023, 'yes', 'gerald-meta', 2),

  ('vile-luksoze-lungomare-vlore', 'sale', 'villa', true, true,
   'Vilë luksoze në Lungomare, Vlorë', 'Luxury villa on the Lungomare, Vlorë',
   'Vilë private me kopsht dhe akses direkt në plazh, e përshtatshme si rezidencë apo investim.',
   'Private villa with garden and direct beach access, suited as a residence or an investment.',
   420000, null, 'vlore', 'lungomare', 'Lungomarja e Vlorës',
   310.0, 280.0, 5, 4, 0, 2, 'furnished', false, true, 'new', 2022, 'yes', 'andi-krasniqi', 4),

  ('apartament-prane-plazhit-sarande', 'sale', 'apartment', false, false,
   'Apartament pranë plazhit në Sarandë', 'Apartment near the beach in Sarandë',
   'Apartament kompakt, i përshtatshëm për pushime apo qira sezonale.',
   'Compact apartment, well suited for holidays or seasonal rental.',
   110000, null, 'sarande', 'qendra', 'Rruga Skënderbeu',
   65.0, 58.0, 2, 1, 3, 6, 'furnished', true, false, 'renovated', 2018, 'yes', 'andi-krasniqi', 8),

  ('shtepi-private-sauk-tirane', 'sale', 'house', false, false,
   'Shtëpi private në Sauk, Tiranë', 'Private house in Sauk, Tirana',
   'Shtëpi dy-katëshe me oborr privat, larg trafikut por afër qendrës.',
   'Two-storey house with a private yard, away from traffic yet close to the center.',
   260000, null, 'tirane', 'sauk', 'Rruga e Saukut',
   220.0, 195.0, 4, 3, 0, 2, 'unfurnished', false, true, 'needs_renovation', 2005, 'yes', 'fjona-bregu', 5),

  ('vile-me-qera-dhermi-himare', 'rent', 'villa', false, true,
   'Vilë me qira në Dhërmi', 'Villa for rent in Dhërmi',
   'Vilë sezonale me pishinë private dhe pamje panoramike nga mali dhe deti.',
   'Seasonal villa with a private pool and panoramic mountain and sea views.',
   1800, 'month', 'himare', 'dhermi', 'Rruga Bregdetare',
   260.0, 230.0, 4, 3, 0, 2, 'furnished', false, true, 'new', 2021, 'yes', 'andi-krasniqi', 7),

  ('zyre-me-qera-don-bosko-tirane', 'rent', 'office', false, false,
   'Zyrë me qira në Don Bosko', 'Office for rent in Don Bosko',
   'Hapësirë zyre e hapur, e përshtatshme për ekipe të vogla dhe mesatare.',
   'Open-plan office space, suitable for small to medium teams.',
   900, 'month', 'tirane', 'don-bosko', 'Rruga e Kavajës',
   120.0, null, null, 1, 2, 6, 'unfurnished', true, true, 'renovated', 2017, 'yes', 'fjona-bregu', 9),

  ('truall-per-shitje-yzberisht-tirane', 'sale', 'land', false, false,
   'Truall për shitje në Yzberisht', 'Land for sale in Yzberisht',
   'Truall me pozicion të mirë, i përshtatshëm për ndërtim rezidencial.',
   'Well-positioned plot, suitable for residential construction.',
   150000, null, 'tirane', 'yzberisht', 'Rruga Yzberisht-Kashar',
   500.0, null, null, null, null, null, null, false, false, null, null, 'in_process', 'fjona-bregu', 12),

  ('apartament-ekonomik-qendra-elbasan', 'sale', 'apartment', false, false,
   'Apartament ekonomik në qendër të Elbasanit', 'Affordable apartment in central Elbasan',
   'Zgjidhje ekonomike për çift të ri ose investim me qira.',
   'An affordable option for a young couple or a rental investment.',
   68000, null, 'elbasan', 'qendra', 'Bulevardi Nënë Tereza',
   72.0, 64.0, 2, 1, 1, 4, 'unfurnished', false, false, 'old', 1990, 'yes', 'gerald-meta', 10),

  ('pallat-i-plote-fresku-tirane', 'sale', 'building', true, false,
   'Pallat i plotë për shitje në Fresku', 'Entire building for sale in Fresku',
   'Ndërtesë e re me 6 apartamente, mundësi e mirë investimi.',
   'New building with 6 apartments, a strong investment opportunity.',
   750000, null, 'tirane', 'fresku', 'Rruga e Frëskut',
   890.0, null, null, null, null, 4, null, true, true, 'new', 2023, 'yes', 'elira-hoxha', 0)
) as v (
  slug, purpose, property_type, is_featured, is_exclusive,
  title_sq, title_en, description_sq, description_en,
  price, price_period, city_slug, neighborhood_slug, address_line,
  gross_area, net_area, bedrooms, bathrooms, floor, total_floors,
  furnishing, has_elevator, has_parking, construction_condition, construction_year, certificate_status,
  agent_slug, days_ago
)
join public.cities c on c.slug = v.city_slug
join public.neighborhoods n on n.slug = v.neighborhood_slug and n.city_id = c.id
join public.agents a on a.slug = v.agent_slug;

-- ----------------------------------------------------------------------------
-- Property images (4 placeholder photos per demo property)
-- ----------------------------------------------------------------------------

insert into public.property_images (property_id, url, sort_order, is_cover)
select
  p.id,
  'https://picsum.photos/seed/' || p.slug || '-' || gs.n || '/1200/800',
  gs.n - 1,
  gs.n = 1
from public.properties p
cross join generate_series(1, 4) as gs(n)
where p.source = 'admin';

-- ----------------------------------------------------------------------------
-- Property amenities
-- ----------------------------------------------------------------------------

insert into public.property_amenities (property_id, amenity_id)
select p.id, am.id
from public.properties p
join (values
  ('apartament-3-dhoma-bllok-tirane', 'balcony'),
  ('apartament-3-dhoma-bllok-tirane', 'air-conditioning'),
  ('apartament-2-dhoma-komuna-parisit-tirane', 'elevator'),
  ('apartament-2-dhoma-komuna-parisit-tirane', 'internet-ready'),
  ('studio-me-qira-astir-tirane', 'air-conditioning'),
  ('studio-me-qira-astir-tirane', 'internet-ready'),
  ('apartament-pamje-nga-deti-plazh-durres', 'sea-view'),
  ('apartament-pamje-nga-deti-plazh-durres', 'balcony'),
  ('vile-luksoze-lungomare-vlore', 'swimming-pool'),
  ('vile-luksoze-lungomare-vlore', 'sea-view'),
  ('vile-luksoze-lungomare-vlore', 'garden'),
  ('apartament-prane-plazhit-sarande', 'sea-view'),
  ('apartament-prane-plazhit-sarande', 'air-conditioning'),
  ('shtepi-private-sauk-tirane', 'garden'),
  ('shtepi-private-sauk-tirane', 'garage'),
  ('vile-me-qera-dhermi-himare', 'swimming-pool'),
  ('vile-me-qera-dhermi-himare', 'mountain-view'),
  ('vile-me-qera-dhermi-himare', 'sea-view'),
  ('zyre-me-qera-don-bosko-tirane', 'internet-ready'),
  ('zyre-me-qera-don-bosko-tirane', 'security-system'),
  ('apartament-ekonomik-qendra-elbasan', 'balcony'),
  ('pallat-i-plote-fresku-tirane', 'elevator'),
  ('pallat-i-plote-fresku-tirane', 'security-system'),
  ('pallat-i-plote-fresku-tirane', 'cctv')
) as pa (property_slug, amenity_slug) on pa.property_slug = p.slug
join public.amenities am on am.slug = pa.amenity_slug;

-- ----------------------------------------------------------------------------
-- Testimonials
-- ----------------------------------------------------------------------------

insert into public.testimonials (author_name, author_role, content_sq, content_en, avatar_url, rating, is_featured) values
  ('Elton Dema', 'Blerës Apartamenti', 'Procesi ishte i shpejtë dhe shumë transparent nga fillimi deri në fund.', 'The process was fast and very transparent from start to finish.', 'https://picsum.photos/seed/testimonial-elton-dema/200/200', 5, true),
  ('Sara Kola', 'Qiramarrëse', 'Gjeta apartamentin ideal brenda pak ditësh falë filtrave të mirë të kërkimit.', 'I found the ideal apartment within a few days thanks to the great search filters.', 'https://picsum.photos/seed/testimonial-sara-kola/200/200', 5, true),
  ('Besnik Alia', 'Shitës Prone', 'Ekipi më udhëzoi hap pas hapi dhe prona u shit më shpejt sesa prisja.', 'The team guided me step by step and the property sold faster than I expected.', 'https://picsum.photos/seed/testimonial-besnik-alia/200/200', 4, true),
  ('Migena Prifti', 'Investitore', 'Informacioni i detajuar për çdo pronë më ndihmoi të marr vendime më të mira.', 'The detailed information on every listing helped me make better decisions.', 'https://picsum.photos/seed/testimonial-migena-prifti/200/200', 5, false);

-- ----------------------------------------------------------------------------
-- Guides
-- ----------------------------------------------------------------------------

insert into public.guides (slug, title_sq, title_en, content_sq, content_en, cover_image, published_at) values
  ('si-te-zgjidhni-apartamentin-e-pare', 'Si të zgjidhni apartamentin tuaj të parë', 'How to choose your first apartment',
   'Përpara se të vendosni, krahasoni lagjet, largësinë nga puna dhe koston reale mujore, jo vetëm çmimin e shitjes.',
   'Before deciding, compare neighborhoods, distance from work, and the real monthly cost — not just the asking price.',
   'https://picsum.photos/seed/guide-first-apartment/800/500', now() - interval '10 days'),
  ('cfare-duhet-te-dini-per-certifikaten-e-pronesise', 'Çfarë duhet të dini për certifikatën e pronësisë', 'What you should know about the ownership certificate',
   'Certifikata e pronësisë vërteton titullin ligjor mbi pronën dhe është hapi i parë që duhet verifikuar përpara çdo transaksioni.',
   'The ownership certificate proves legal title to a property and is the first thing to verify before any transaction.',
   'https://picsum.photos/seed/guide-ownership-certificate/800/500', now() - interval '18 days'),
  ('udhezues-per-qiramarrjen-ne-shqiperi', 'Udhëzues për qiramarrjen në Shqipëri', 'A guide to renting in Albania',
   'Nga depozita e sigurisë tek kontrata me shkrim, ja çfarë duhet të dijë çdo qiramarrës përpara se të firmosë.',
   'From the security deposit to the written contract, here''s what every tenant should know before signing.',
   'https://picsum.photos/seed/guide-renting-albania/800/500', now() - interval '25 days');
