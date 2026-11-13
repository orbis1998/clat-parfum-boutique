-- Éclat / Kinoir Parfums — schéma boutique
create extension if not exists "pgcrypto";

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  parent_id text references categories(id) on delete set null,
  sort_order int not null default 0
);

create table if not exists products (
  id text primary key,
  name text not null,
  brand text not null default '',
  family text not null default '',
  category_id text references categories(id) on delete set null,
  description text not null default '',
  notes text not null default '',
  image text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists product_variants (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  label text not null,
  price numeric(10,2) not null default 0,
  stock int not null default 0
);

create table if not exists communes (
  name text primary key
);

create table if not exists zones (
  id text primary key,
  commune_name text not null references communes(name) on delete cascade,
  name text not null,
  fee int not null default 0
);

create table if not exists staff (
  badge text primary key,
  password text not null,
  name text not null,
  role text not null check (role in ('admin','gerant','livreur')),
  active boolean not null default true,
  phone text
);

create table if not exists orders (
  id text primary key,
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_instructions text not null default '',
  commune text not null,
  zone text not null,
  fee int not null default 0,
  delivery_date date not null,
  status text not null default 'nouvelle'
    check (status in ('nouvelle','confirmée','en livraison','livrée','annulée')),
  livreur text references staff(badge) on delete set null
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  name text not null,
  variant text not null,
  price numeric(10,2) not null,
  qty int not null
);

create table if not exists expenses (
  id text primary key,
  label text not null,
  amount numeric(10,2) not null,
  date date not null
);

create table if not exists posts (
  id text primary key,
  title text not null,
  excerpt text not null default '',
  date date not null
);

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  store_name text not null,
  whatsapp text not null,
  hero_title text not null,
  hero_subtitle text not null,
  announcement text not null default ''
);

alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table communes enable row level security;
alter table zones enable row level security;
alter table staff enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table expenses enable row level security;
alter table posts enable row level security;
alter table settings enable row level security;

-- Politiques permissives (boutique + panel badge). À renforcer avec Auth plus tard.
do $$ begin
  create policy "categories_all" on categories for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "products_all" on products for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "variants_all" on product_variants for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "communes_all" on communes for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "zones_all" on zones for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "staff_all" on staff for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "orders_all" on orders for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "order_items_all" on order_items for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "expenses_all" on expenses for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "posts_all" on posts for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "settings_all" on settings for all using (true) with check (true);
exception when duplicate_object then null; end $$;
