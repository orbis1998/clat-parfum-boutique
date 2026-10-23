import { useSyncExternalStore } from "react";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

export type Role = "admin" | "gerant" | "livreur";
export type Variant = { id: string; label: string; price: number; stock: number };
export type Product = {
  id: string;
  name: string;
  brand: string;
  family: string;
  description: string;
  notes: string;
  image: string;
  featured: boolean;
  variants: Variant[];
};
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
export type Settings = { storeName: string; whatsapp: string; heroTitle: string; heroSubtitle: string; announcement: string };

export type State = {
  products: Product[];
  communes: Commune[];
  staff: Staff[];
  orders: Order[];
  expenses: Expense[];
  posts: Post[];
  settings: Settings;
  cart: CartItem[];
  session: string | null;
};

export const COMMUNES = [
  "Bandalungwa", "Barumbu", "Bumbu", "Gombe", "Kalamu", "Kasa-Vubu", "Kimbanseke", "Kinshasa",
  "Kintambo", "Kisenso", "Lemba", "Limete", "Lingwala", "Makala", "Maluku", "Masina",
  "Matete", "Mont-Ngafula", "Ndjili", "Ngaba", "Ngaliema", "Ngiri-Ngiri", "Nsele", "Selembao",
];

export const uid = () => Math.random().toString(36).slice(2, 9);

const baseFee: Record<string, number> = { Gombe: 5000, Maluku: 20000, Nsele: 15000, Kimbanseke: 12000, "Mont-Ngafula": 12000 };

const defaults: State = {
  products: [
    { id: "ambre", name: "Ambre Nocturne", brand: "Maison Kinoir", family: "Oriental", description: "Un ambre chaud et enveloppant, sublimé de vanille bourbon et de bois précieux.", notes: "Ambre · Vanille · Santal", image: p1, featured: true, variants: [{ id: uid(), label: "50 ml", price: 85, stock: 12 }, { id: uid(), label: "100 ml", price: 135, stock: 8 }] },
    { id: "oud-imperial", name: "Oud Impérial", brand: "Maison Kinoir", family: "Boisé", description: "Le oud dans sa forme la plus noble : fumé, profond, magnétique.", notes: "Oud · Cuir · Encens", image: p2, featured: true, variants: [{ id: uid(), label: "50 ml", price: 110, stock: 6 }, { id: uid(), label: "100 ml", price: 175, stock: 4 }] },
    { id: "adore", name: "Adore Rose", brand: "Atelier Lumière", family: "Floral", description: "Une rose de mai lumineuse, posée sur un fond de musc poudré.", notes: "Rose · Pivoine · Musc", image: p3, featured: true, variants: [{ id: uid(), label: "30 ml", price: 55, stock: 20 }, { id: uid(), label: "75 ml", price: 95, stock: 10 }] },
    { id: "oud-sahra", name: "Oud Al Sahra", brand: "Atelier Lumière", family: "Ambré", description: "Le souffle du désert : safran, oud doré et ambre gris.", notes: "Safran · Oud · Ambre gris", image: p4, featured: true, variants: [{ id: uid(), label: "100 ml", price: 150, stock: 7 }] },
  ],
  communes: COMMUNES.map((name) => ({ name, zones: [{ id: uid(), name: "Zone centre", fee: baseFee[name] ?? 8000 }] })),
  staff: [
    { badge: "ADM-001", password: "admin123", name: "Administrateur", role: "admin", active: true },
    { badge: "GER-001", password: "gerant123", name: "Grace Mbuyi", role: "gerant", active: true },
    { badge: "LIV-001", password: "livreur123", name: "Patrick Lukusa", role: "livreur", active: true, phone: "+243 81 000 0000" },
  ],
  orders: [],
  expenses: [{ id: uid(), label: "Achat stock initial", amount: 400, date: "2026-10-01" }],
  posts: [
    { id: uid(), title: "L'art de porter le oud", excerpt: "Trois gestes pour faire durer un parfum boisé toute la journée.", date: "2026-10-10" },
    { id: uid(), title: "Nouvelle collection Lumière", excerpt: "Des floraux solaires pensés pour le climat de Kinshasa.", date: "2026-10-18" },
  ],
  settings: {
    storeName: "Kinoir Parfums",
    whatsapp: "243810000000",
    heroTitle: "L'essence du luxe, livrée chez vous",
    heroSubtitle: "Parfums de niche et grandes maisons, livrés dans les 24 communes de Kinshasa.",
    announcement: "Livraison dans toutes les communes de Kinshasa · Commande via WhatsApp",
  },
  cart: [],
  session: null,
};

const KEY = "kinoir-store-v1";
let state: State = defaults;
const listeners = new Set<() => void>();
let hydrated = false;

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...defaults, ...JSON.parse(raw) };
  } catch {}
  listeners.forEach((l) => l());
}

export function setState(fn: (s: State) => Partial<State>) {
  state = { ...state, ...fn(state) };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => sel(state),
    () => sel(defaults),
  );
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
