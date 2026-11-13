-- Seed initial
truncate order_items, orders, product_variants, products, zones, communes, expenses, posts, staff, categories, settings restart identity cascade;

insert into categories (id, name, slug, parent_id, sort_order) values
  ('nouvelle', 'Nouvelle collection', 'nouvelle-collection', null, 1),
  ('femme', 'Femme', 'femme', null, 2),
  ('homme', 'Homme', 'homme', null, 3),
  ('oriental', 'Oriental', 'oriental', null, 4),
  ('floral', 'Floral', 'floral', null, 5),
  ('boise', 'Boisé', 'boise', null, 6),
  ('ambre', 'Ambré', 'ambre', null, 7),
  ('coffrets', 'Coffrets', 'coffrets', null, 8),
  ('marques', 'Marques', 'marques', null, 9),
  ('journal', 'Le journal', 'journal', null, 10);

insert into products (id, name, brand, family, category_id, description, notes, image, featured) values
  ('ambre', 'Ambre Nocturne', 'Maison Kinoir', 'Oriental', 'oriental',
   'Un ambre chaud et enveloppant, sublimé de vanille bourbon et de bois précieux.',
   'Ambre · Vanille · Santal',
   'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80', true),
  ('oud-imperial', 'Oud Impérial', 'Maison Kinoir', 'Boisé', 'boise',
   'Le oud dans sa forme la plus noble : fumé, profond, magnétique.',
   'Oud · Cuir · Encens',
   'https://images.unsplash.com/photo-1594035910387-fea477702874?auto=format&fit=crop&w=900&q=80', true),
  ('adore', 'Adore Rose', 'Atelier Lumière', 'Floral', 'floral',
   'Une rose de mai lumineuse, posée sur un fond de musc poudré.',
   'Rose · Pivoine · Musc',
   'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80', true),
  ('oud-sahra', 'Oud Al Sahra', 'Atelier Lumière', 'Ambré', 'ambre',
   'Le souffle du désert : safran, oud doré et ambre gris.',
   'Safran · Oud · Ambre gris',
   'https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?auto=format&fit=crop&w=900&q=80', true);

insert into product_variants (id, product_id, label, price, stock) values
  ('v-ambre-50', 'ambre', '50 ml', 85, 12),
  ('v-ambre-100', 'ambre', '100 ml', 135, 8),
  ('v-oud-50', 'oud-imperial', '50 ml', 110, 6),
  ('v-oud-100', 'oud-imperial', '100 ml', 175, 4),
  ('v-adore-30', 'adore', '30 ml', 55, 20),
  ('v-adore-75', 'adore', '75 ml', 95, 10),
  ('v-sahra-100', 'oud-sahra', '100 ml', 150, 7);

insert into communes (name)
select unnest(array[
  'Bandalungwa','Barumbu','Bumbu','Gombe','Kalamu','Kasa-Vubu','Kimbanseke','Kinshasa',
  'Kintambo','Kisenso','Lemba','Limete','Lingwala','Makala','Maluku','Masina',
  'Matete','Mont-Ngafula','Ndjili','Ngaba','Ngaliema','Ngiri-Ngiri','Nsele','Selembao'
]);

insert into zones (id, commune_name, name, fee)
select
  'z-' || lower(replace(name,' ','-')),
  name,
  'Zone centre',
  case name
    when 'Gombe' then 5000
    when 'Maluku' then 20000
    when 'Nsele' then 15000
    when 'Kimbanseke' then 12000
    when 'Mont-Ngafula' then 12000
    else 8000
  end
from communes;

insert into staff (badge, password, name, role, active, phone) values
  ('ADM-001', 'admin123', 'Administrateur', 'admin', true, null),
  ('GER-001', 'gerant123', 'Grace Mbuyi', 'gerant', true, null),
  ('LIV-001', 'livreur123', 'Patrick Lukusa', 'livreur', true, '+243 81 000 0000');

insert into expenses (id, label, amount, date) values
  ('exp-1', 'Achat stock initial', 400, '2026-10-01');

insert into posts (id, title, excerpt, date) values
  ('post-1', 'L''art de porter le oud', 'Trois gestes pour faire durer un parfum boisé toute la journée.', '2026-10-10'),
  ('post-2', 'Nouvelle collection Lumière', 'Des floraux solaires pensés pour le climat de Kinshasa.', '2026-10-18');

insert into settings (id, store_name, whatsapp, hero_title, hero_subtitle, announcement) values
  (1, 'Chez the sisters store', '243810000000',
   'L''essence du luxe, livrée chez vous',
   'Parfums sélectionnés, commandes à partir de 5 pièces.',
   'Livraison dans toutes les communes de Kinshasa · Commande via WhatsApp');
