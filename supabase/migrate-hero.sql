alter table settings add column if not exists hero_images jsonb not null default '[]'::jsonb;

update settings
set hero_images = '["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1600&q=80","https://images.unsplash.com/photo-1594035910387-fea477702874?auto=format&fit=crop&w=1600&q=80","https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=80"]'::jsonb
where id = 1
  and (hero_images = '[]'::jsonb or hero_images is null);
