import { useCallback, useRef, useSyncExternalStore } from "react";
import { hasSupabase, supabase } from "@/lib/supabase";

export type Role = "admin" | "gerant" | "livreur";
export type Variant = { id: string; label: string; price: number; stock: number };
export type Product = {
  id: string;
  name: string;
  brand: string;
  family: string;
  categoryId?: string | null;
  description: string;
  notes: string;
  image: string;
  featured: boolean;
  variants: Variant[];
};
export type Category = { id: string; name: string; slug: string; parentId?: string | null; sortOrder: number };
export type Zone = { id: string; name: string; fee: number };
export type Commune = { name: string; zones: Zone[] };
export type Staff = { badge: string; password: string; name: string; role: Role; active: boolean; phone?: string };
export type CartItem = { productId: string; variantId: string; qty: number };
export type OrderStatus = "nouvelle" | "confirmée" | "en livraison" | "livrée" | "annulée";
export type OrderItem = { name: string; variant: string; price: number; qty: number };
export type Order = {
  id: string;
  createdAt: string;
  items: OrderItem[];
  customer: { name: string; phone: string; address: string; instructions: string };
  commune: string;
  zone: string;
  fee: number;
  deliveryDate: string;
  status: OrderStatus;
  livreur?: string;
};
export type Expense = { id: string; label: string; amount: number; date: string };
export type Post = { id: string; title: string; excerpt: string; date: string };
export type Settings = {
  storeName: string;
  whatsapp: string;
  heroTitle: string;
  heroSubtitle: string;
  announcement: string;
  heroImages: string[];
};

export type State = {
  products: Product[];
  categories: Category[];
  communes: Commune[];
  staff: Staff[];
  orders: Order[];
  expenses: Expense[];
  posts: Post[];
  settings: Settings;
  cart: CartItem[];
  session: string | null;
  ready: boolean;
};

export const COMMUNES = [
  "Bandalungwa", "Barumbu", "Bumbu", "Gombe", "Kalamu", "Kasa-Vubu", "Kimbanseke", "Kinshasa",
  "Kintambo", "Kisenso", "Lemba", "Limete", "Lingwala", "Makala", "Maluku", "Masina",
  "Matete", "Mont-Ngafula", "Ndjili", "Ngaba", "Ngaliema", "Ngiri-Ngiri", "Nsele", "Selembao",
];

export const STORE_NAME = "Chez the sisters store";
export const MIN_ORDER_QTY = 5;
export const STORE_SEO_DESCRIPTION =
  "Boutique de parfums à Kinshasa. Découvrez notre sélection et commandez à partir de 5 pièces.";

export const uid = () => Math.random().toString(36).slice(2, 9);

const LOCAL_KEY = "kinoir-local-v1";

const DEFAULT_HERO = [
  "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1594035910387-fea477702874?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=80",
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "ambre",
    name: "Ambre Nocturne",
    brand: "Maison Kinoir",
    family: "Oriental",
    categoryId: "oriental",
    description: "Un ambre chaud et enveloppant, sublimé de vanille bourbon et de bois précieux.",
    notes: "Ambre · Vanille · Santal",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
    featured: true,
    variants: [
      { id: "v-ambre-50", label: "50 ml", price: 85, stock: 12 },
      { id: "v-ambre-100", label: "100 ml", price: 135, stock: 8 },
    ],
  },
  {
    id: "oud-imperial",
    name: "Oud Impérial",
    brand: "Maison Kinoir",
    family: "Boisé",
    categoryId: "boise",
    description: "Le oud dans sa forme la plus noble : fumé, profond, magnétique.",
    notes: "Oud · Cuir · Encens",
    image: "https://images.unsplash.com/photo-1594035910387-fea477702874?auto=format&fit=crop&w=900&q=80",
    featured: true,
    variants: [
      { id: "v-oud-50", label: "50 ml", price: 110, stock: 6 },
      { id: "v-oud-100", label: "100 ml", price: 175, stock: 4 },
    ],
  },
  {
    id: "adore",
    name: "Adore Rose",
    brand: "Atelier Lumière",
    family: "Floral",
    categoryId: "floral",
    description: "Une rose de mai lumineuse, posée sur un fond de musc poudré.",
    notes: "Rose · Pivoine · Musc",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80",
    featured: true,
    variants: [
      { id: "v-adore-30", label: "30 ml", price: 55, stock: 20 },
      { id: "v-adore-75", label: "75 ml", price: 95, stock: 10 },
    ],
  },
  {
    id: "oud-sahra",
    name: "Oud Al Sahra",
    brand: "Atelier Lumière",
    family: "Ambré",
    categoryId: "ambre",
    description: "Le souffle du désert : safran, oud doré et ambre gris.",
    notes: "Safran · Oud · Ambre gris",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?auto=format&fit=crop&w=900&q=80",
    featured: true,
    variants: [{ id: "v-sahra-100", label: "100 ml", price: 150, stock: 7 }],
  },
];

const FALLBACK_STAFF: Staff[] = [
  { badge: "ADM-001", password: "admin123", name: "Administrateur", role: "admin", active: true },
  { badge: "GER-001", password: "gerant123", name: "Grace Mbuyi", role: "gerant", active: true },
  { badge: "LIV-001", password: "livreur123", name: "Patrick Lukusa", role: "livreur", active: true },
];

const FALLBACK_COMMUNES: Commune[] = COMMUNES.map((name) => ({
  name,
  zones: [
    {
      id: `z-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name: "Zone centre",
      fee: name === "Gombe" ? 5000 : name === "Maluku" ? 20000 : name === "Nsele" ? 15000 : ["Kimbanseke", "Mont-Ngafula"].includes(name) ? 12000 : 8000,
    },
  ],
}));

const FALLBACK_POSTS: Post[] = [
  {
    id: "post-1",
    title: "L'art de porter le oud",
    excerpt: "Trois gestes pour faire durer un parfum boisé toute la journée.",
    date: "2026-10-10",
  },
  {
    id: "post-2",
    title: "Nouvelle collection Lumière",
    excerpt: "Des floraux solaires pensés pour le climat de Kinshasa.",
    date: "2026-10-18",
  },
];

const defaults: State = {
  products: FALLBACK_PRODUCTS,
  categories: [],
  communes: FALLBACK_COMMUNES,
  staff: FALLBACK_STAFF,
  orders: [],
  expenses: [],
  posts: FALLBACK_POSTS,
  settings: {
    storeName: STORE_NAME,
    whatsapp: "243810000000",
    heroTitle: "L'essence du luxe, livrée chez vous",
    heroSubtitle: "Parfums sélectionnés, commandes à partir de 5 pièces.",
    announcement: "Livraison Kinshasa · Commande WhatsApp",
    heroImages: DEFAULT_HERO,
  },
  cart: [],
  session: null,
  ready: true,
};

let state: State = defaults;
const listeners = new Set<() => void>();
let hydrated = false;

function emit() {
  listeners.forEach((l) => l());
}

function saveLocal() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ cart: state.cart, session: state.session }));
  } catch {}
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function parseHeroImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parseHeroImages(parsed);
    } catch {
      return raw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

async function persistRemote(prev: State, next: State, patch: Partial<State>) {
  if (!hasSupabase) return;
  try {
    if (patch.products) {
      const prevIds = new Set(prev.products.map((p) => p.id));
      const nextIds = new Set(next.products.map((p) => p.id));
      for (const id of prevIds) {
        if (!nextIds.has(id)) await supabase.from("products").delete().eq("id", id);
      }
      for (const p of next.products) {
        await supabase.from("products").upsert({
          id: p.id,
          name: p.name,
          brand: p.brand,
          family: p.family,
          category_id: p.categoryId ?? null,
          description: p.description,
          notes: p.notes,
          image: p.image,
          featured: p.featured,
        });
        await supabase.from("product_variants").delete().eq("product_id", p.id);
        if (p.variants.length) {
          await supabase.from("product_variants").insert(
            p.variants.map((v) => ({
              id: v.id,
              product_id: p.id,
              label: v.label,
              price: v.price,
              stock: v.stock,
            })),
          );
        }
      }
    }

    if (patch.categories) {
      const prevIds = new Set(prev.categories.map((c) => c.id));
      const nextIds = new Set(next.categories.map((c) => c.id));
      for (const id of prevIds) {
        if (!nextIds.has(id)) await supabase.from("categories").delete().eq("id", id);
      }
      if (next.categories.length) {
        await supabase.from("categories").upsert(
          next.categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            parent_id: c.parentId ?? null,
            sort_order: c.sortOrder,
          })),
        );
      }
    }

    if (patch.communes) {
      for (const c of next.communes) {
        await supabase.from("zones").delete().eq("commune_name", c.name);
        if (c.zones.length) {
          await supabase.from("zones").insert(
            c.zones.map((z) => ({ id: z.id, commune_name: c.name, name: z.name, fee: z.fee })),
          );
        }
      }
    }

    if (patch.staff) {
      const prevBadges = new Set(prev.staff.map((s) => s.badge));
      const nextBadges = new Set(next.staff.map((s) => s.badge));
      for (const badge of prevBadges) {
        if (!nextBadges.has(badge)) await supabase.from("staff").delete().eq("badge", badge);
      }
      if (next.staff.length) {
        await supabase.from("staff").upsert(
          next.staff.map((s) => ({
            badge: s.badge,
            password: s.password,
            name: s.name,
            role: s.role,
            active: s.active,
            phone: s.phone ?? null,
          })),
        );
      }
    }

    if (patch.orders) {
      const prevIds = new Set(prev.orders.map((o) => o.id));
      const nextIds = new Set(next.orders.map((o) => o.id));
      for (const id of prevIds) {
        if (!nextIds.has(id)) await supabase.from("orders").delete().eq("id", id);
      }
      for (const o of next.orders) {
        await supabase.from("orders").upsert({
          id: o.id,
          created_at: o.createdAt,
          customer_name: o.customer.name,
          customer_phone: o.customer.phone,
          customer_address: o.customer.address,
          customer_instructions: o.customer.instructions,
          commune: o.commune,
          zone: o.zone,
          fee: o.fee,
          delivery_date: o.deliveryDate,
          status: o.status,
          livreur: o.livreur ?? null,
        });
        await supabase.from("order_items").delete().eq("order_id", o.id);
        if (o.items.length) {
          await supabase.from("order_items").insert(
            o.items.map((i) => ({
              order_id: o.id,
              name: i.name,
              variant: i.variant,
              price: i.price,
              qty: i.qty,
            })),
          );
        }
      }
    }

    if (patch.expenses) {
      const prevIds = new Set(prev.expenses.map((e) => e.id));
      const nextIds = new Set(next.expenses.map((e) => e.id));
      for (const id of prevIds) {
        if (!nextIds.has(id)) await supabase.from("expenses").delete().eq("id", id);
      }
      if (next.expenses.length) {
        await supabase.from("expenses").upsert(
          next.expenses.map((e) => ({ id: e.id, label: e.label, amount: e.amount, date: e.date })),
        );
      }
    }

    if (patch.posts) {
      const prevIds = new Set(prev.posts.map((p) => p.id));
      const nextIds = new Set(next.posts.map((p) => p.id));
      for (const id of prevIds) {
        if (!nextIds.has(id)) await supabase.from("posts").delete().eq("id", id);
      }
      if (next.posts.length) {
        await supabase.from("posts").upsert(
          next.posts.map((p) => ({ id: p.id, title: p.title, excerpt: p.excerpt, date: p.date })),
        );
      }
    }

    if (patch.settings) {
      await supabase.from("settings").upsert({
        id: 1,
        store_name: STORE_NAME,
        whatsapp: next.settings.whatsapp,
        hero_title: next.settings.heroTitle,
        hero_subtitle: next.settings.heroSubtitle,
        announcement: next.settings.announcement,
        hero_images: next.settings.heroImages,
      });
    }
  } catch (err) {
    console.error("Supabase persist error", err);
  }
}

export async function hydrate(): Promise<void> {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;

  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const local = JSON.parse(raw) as { cart?: CartItem[]; session?: string | null };
      state = { ...state, cart: local.cart ?? [], session: local.session ?? null, ready: true };
      emit();
    }
  } catch {}

  if (!hasSupabase) {
    state = { ...state, ready: true };
    emit();
    return;
  }

  try {
    const results = await withTimeout(
      Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: true }),
        supabase.from("product_variants").select("*"),
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("communes").select("*"),
        supabase.from("zones").select("*"),
        supabase.from("staff").select("*"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("order_items").select("*"),
        supabase.from("expenses").select("*").order("date", { ascending: false }),
        supabase.from("posts").select("*").order("date", { ascending: false }),
        supabase.from("settings").select("*").eq("id", 1).limit(1),
      ]),
      12000,
    );

    const [
      { data: products },
      { data: variants },
      { data: categories },
      { data: communes },
      { data: zones },
      { data: staff },
      { data: orders },
      { data: orderItems },
      { data: expenses },
      { data: posts },
      { data: settingsRows },
    ] = results;

    const variantsByProduct = new Map<string, Variant[]>();
    for (const v of variants ?? []) {
      const list = variantsByProduct.get(v.product_id) ?? [];
      list.push({ id: v.id, label: v.label, price: Number(v.price), stock: Number(v.stock) });
      variantsByProduct.set(v.product_id, list);
    }

    const zonesByCommune = new Map<string, Zone[]>();
    for (const z of zones ?? []) {
      const list = zonesByCommune.get(z.commune_name) ?? [];
      list.push({ id: z.id, name: z.name, fee: Number(z.fee) });
      zonesByCommune.set(z.commune_name, list);
    }

    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const i of orderItems ?? []) {
      const list = itemsByOrder.get(i.order_id) ?? [];
      list.push({ name: i.name, variant: i.variant, price: Number(i.price), qty: Number(i.qty) });
      itemsByOrder.set(i.order_id, list);
    }

    const settingsRow = settingsRows?.[0];
    const heroImages = settingsRow ? parseHeroImages(settingsRow.hero_images) : [];

    const mappedProducts: Product[] = (products ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      family: p.family,
      categoryId: p.category_id,
      description: p.description,
      notes: p.notes,
      image: p.image,
      featured: p.featured,
      variants: variantsByProduct.get(p.id) ?? [],
    }));
    const mappedCategories: Category[] = (categories ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parent_id,
      sortOrder: c.sort_order,
    }));
    const mappedCommunes: Commune[] = (communes ?? []).map((c) => ({
      name: c.name,
      zones: zonesByCommune.get(c.name) ?? [],
    }));
    const mappedStaff: Staff[] = (staff ?? []).map((s) => ({
      badge: s.badge,
      password: s.password,
      name: s.name,
      role: s.role as Role,
      active: s.active,
      phone: s.phone ?? undefined,
    }));
    const mappedPosts: Post[] = (posts ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
    }));

    state = {
      ...state,
      products: mappedProducts.length ? mappedProducts : FALLBACK_PRODUCTS,
      categories: mappedCategories,
      communes: mappedCommunes.length ? mappedCommunes : FALLBACK_COMMUNES,
      staff: mappedStaff.length ? mappedStaff : FALLBACK_STAFF,
      orders: (orders ?? []).map((o) => ({
        id: o.id,
        createdAt: o.created_at,
        items: itemsByOrder.get(o.id) ?? [],
        customer: {
          name: o.customer_name,
          phone: o.customer_phone,
          address: o.customer_address,
          instructions: o.customer_instructions ?? "",
        },
        commune: o.commune,
        zone: o.zone,
        fee: Number(o.fee),
        deliveryDate: o.delivery_date,
        status: o.status as OrderStatus,
        livreur: o.livreur ?? undefined,
      })),
      expenses: (expenses ?? []).map((e) => ({
        id: e.id,
        label: e.label,
        amount: Number(e.amount),
        date: e.date,
      })),
      posts: mappedPosts.length ? mappedPosts : FALLBACK_POSTS,
      settings: settingsRow
        ? {
            storeName: STORE_NAME,
            whatsapp: settingsRow.whatsapp,
            heroTitle: settingsRow.hero_title,
            heroSubtitle: settingsRow.hero_subtitle,
            announcement: settingsRow.announcement ?? "",
            heroImages: heroImages.length ? heroImages : DEFAULT_HERO,
          }
        : { ...state.settings, storeName: STORE_NAME },
      ready: true,
    };
  } catch (err) {
    console.error("Supabase hydrate error", err);
    state = { ...state, ready: true };
  }
  emit();
}

export function setState(fn: (s: State) => Partial<State>) {
  const prev = state;
  const patch = fn(state);
  state = { ...state, ...patch };
  saveLocal();
  emit();
  void persistRemote(prev, state, patch);
}

export function getState() {
  return state;
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
    return true;
  }
  const ak = Object.keys(a as object);
  const bk = Object.keys(b as object);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

export function useStore<T>(sel: (s: State) => T): T {
  const selRef = useRef(sel);
  selRef.current = sel;
  const cacheRef = useRef<{ value: T; ready: boolean }>({ value: undefined as T, ready: false });

  const subscribe = useCallback((onChange: () => void) => {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
  }, []);

  const getSnapshot = useCallback(() => {
    const next = selRef.current(state);
    const cache = cacheRef.current;
    if (cache.ready && shallowEqual(cache.value, next)) return cache.value;
    cache.value = next;
    cache.ready = true;
    return next;
  }, []);

  const getServerSnapshot = useCallback(() => {
    const next = selRef.current(defaults);
    const cache = cacheRef.current;
    if (cache.ready && shallowEqual(cache.value, next)) return cache.value;
    cache.value = next;
    cache.ready = true;
    return next;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const fmtUSD = (n: number) => `$${n.toFixed(2)}`;
export const fmtCDF = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FC`;

export function useSessionUser() {
  return useStore((s) => s.staff.find((u) => u.badge === s.session) ?? null);
}

export function orderSubtotal(o: Order) {
  return o.items.reduce((a, i) => a + i.price * i.qty, 0);
}

export function addToCart(productId: string, variantId: string, qty = 1) {
  setState((s) => {
    const ex = s.cart.find((c) => c.productId === productId && c.variantId === variantId);
    return {
      cart: ex
        ? s.cart.map((c) => (c === ex ? { ...c, qty: c.qty + qty } : c))
        : [...s.cart, { productId, variantId, qty }],
    };
  });
}
