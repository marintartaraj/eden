-- ============================================================================
-- Seed data: cities, neighborhoods, amenities
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Cities
-- ----------------------------------------------------------------------------

insert into public.cities (slug, name_sq, name_en, sort_order) values
  ('tirane', 'Tiranë', 'Tirana', 10),
  ('durres', 'Durrës', 'Durrës', 20),
  ('vlore', 'Vlorë', 'Vlorë', 30),
  ('sarande', 'Sarandë', 'Sarandë', 40),
  ('ksamil', 'Ksamil', 'Ksamil', 45),
  ('shkoder', 'Shkodër', 'Shkodër', 50),
  ('fier', 'Fier', 'Fier', 60),
  ('elbasan', 'Elbasan', 'Elbasan', 70),
  ('korce', 'Korçë', 'Korçë', 80),
  ('pogradec', 'Pogradec', 'Pogradec', 90),
  ('berat', 'Berat', 'Berat', 100),
  ('lezhe', 'Lezhë', 'Lezhë', 110),
  ('shengjin', 'Shëngjin', 'Shëngjin', 115),
  ('kavaje', 'Kavajë', 'Kavajë', 120),
  ('himare', 'Himarë', 'Himarë', 130);

-- ----------------------------------------------------------------------------
-- Neighborhoods
-- ----------------------------------------------------------------------------

insert into public.neighborhoods (city_id, slug, name_sq, name_en, sort_order)
select c.id, n.slug, n.name_sq, n.name_en, n.sort_order
from public.cities c
join (values
  ('tirane', 'bllok', 'Bllok', 'Bllok', 10),
  ('tirane', 'komuna-e-parisit', 'Komuna e Parisit', 'Komuna e Parisit', 20),
  ('tirane', 'njesia-5', 'Njësia 5', 'Unit 5', 30),
  ('tirane', 'selite', 'Selitë', 'Selitë', 40),
  ('tirane', 'kombinat', 'Kombinat', 'Kombinat', 50),
  ('tirane', 'don-bosko', 'Don Bosko', 'Don Bosko', 60),
  ('tirane', 'astir', 'Astir', 'Astir', 70),
  ('tirane', 'fresku', 'Fresku', 'Fresku', 80),
  ('tirane', 'liqeni-i-thate', 'Liqeni i Thatë', 'Liqeni i Thatë', 90),
  ('tirane', 'ali-demi', 'Ali Demi', 'Ali Demi', 100),
  ('tirane', 'laprake', 'Laprakë', 'Laprakë', 110),
  ('tirane', 'sauk', 'Sauk', 'Sauk', 120),
  ('tirane', 'yzberisht', 'Yzberisht', 'Yzberisht', 130),

  ('durres', 'currila', 'Currila', 'Currila', 10),
  ('durres', 'plazh', 'Plazh', 'Beach', 20),
  ('durres', 'shkozet', 'Shkozet', 'Shkozet', 30),
  ('durres', 'qendra', 'Qendra', 'Center', 40),
  ('durres', 'kenete', 'Kënetë', 'Kënetë', 50),

  ('vlore', 'lungomare', 'Lungomare', 'Lungomare', 10),
  ('vlore', 'uji-i-ftohte', 'Uji i Ftohtë', 'Uji i Ftohtë', 20),
  ('vlore', 'skele', 'Skelë', 'Skelë', 30),
  ('vlore', 'qendra', 'Qendra', 'Center', 40),

  ('sarande', 'qendra', 'Qendra', 'Center', 10),
  ('sarande', 'lekuresi', 'Lëkurësi', 'Lëkurësi', 20),

  ('ksamil', 'qendra', 'Qendra', 'Center', 10),

  ('shkoder', 'qendra', 'Qendra', 'Center', 10),
  ('shkoder', 'njesia-21', '21 Dhjetori', '21 Dhjetori', 20),

  ('fier', 'qendra', 'Qendra', 'Center', 10),
  ('fier', 'apolonia', 'Apolonia', 'Apollonia', 20),

  ('elbasan', 'qendra', 'Qendra', 'Center', 10),
  ('elbasan', 'bradashesh', 'Bradashesh', 'Bradashesh', 20),

  ('korce', 'qendra', 'Qendra', 'Center', 10),
  ('korce', 'grama', 'Grama', 'Grama', 20),

  ('pogradec', 'qendra', 'Qendra', 'Center', 10),
  ('pogradec', 'drilon', 'Drilon', 'Drilon', 20),

  ('berat', 'mangalem', 'Mangalem', 'Mangalem', 10),
  ('berat', 'gorica', 'Gorica', 'Gorica', 20),
  ('berat', 'qendra', 'Qendra', 'Center', 30),

  ('lezhe', 'qendra', 'Qendra', 'Center', 10),

  ('shengjin', 'qendra', 'Qendra', 'Center', 10),

  ('kavaje', 'qendra', 'Qendra', 'Center', 10),
  ('kavaje', 'golem', 'Golem', 'Golem', 20),

  ('himare', 'qendra', 'Qendra', 'Center', 10),
  ('himare', 'dhermi', 'Dhërmi', 'Dhërmi', 20),
  ('himare', 'jale', 'Jalë', 'Jalë', 30)
) as n (city_slug, slug, name_sq, name_en, sort_order)
  on n.city_slug = c.slug;

-- ----------------------------------------------------------------------------
-- Amenities
-- ----------------------------------------------------------------------------

insert into public.amenities (slug, name_sq, name_en, icon) values
  ('elevator', 'Ashensor', 'Elevator', 'arrow-up-down'),
  ('parking', 'Parkim', 'Parking', 'car'),
  ('balcony', 'Ballkon', 'Balcony', 'door-open'),
  ('terrace', 'Tarracë', 'Terrace', 'sun'),
  ('garden', 'Kopsht', 'Garden', 'trees'),
  ('swimming-pool', 'Pishinë', 'Swimming Pool', 'waves'),
  ('air-conditioning', 'Ajër i Kondicionuar', 'Air Conditioning', 'snowflake'),
  ('central-heating', 'Ngrohje Qendrore', 'Central Heating', 'flame'),
  ('furnished', 'I/E Mobiluar', 'Furnished', 'armchair'),
  ('sea-view', 'Pamje nga Deti', 'Sea View', 'waves'),
  ('mountain-view', 'Pamje nga Mali', 'Mountain View', 'mountain'),
  ('city-view', 'Pamje nga Qyteti', 'City View', 'building-2'),
  ('garage', 'Garazh', 'Garage', 'warehouse'),
  ('storage-room', 'Depo', 'Storage Room', 'package'),
  ('security-system', 'Sistem Sigurie', 'Security System', 'shield'),
  ('cctv', 'Kamera Sigurie', 'CCTV', 'camera'),
  ('intercom', 'Citofon', 'Intercom', 'phone-call'),
  ('fireplace', 'Oxhak', 'Fireplace', 'flame'),
  ('solar-panels', 'Panele Diellore', 'Solar Panels', 'sun-medium'),
  ('internet-ready', 'Gati për Internet', 'Internet Ready', 'wifi');
