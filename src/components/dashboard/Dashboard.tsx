import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  COMMUNES,
  STORE_NAME,
  fmtCDF,
  fmtUSD,
  orderSubtotal,
  setState,
  uid,
  useSessionUser,
  useStore,
  type Category,
  type Order,
  type OrderItem,
  type OrderStatus,
  type Product,
  type Role,
  type Staff,
} from "@/lib/store";

const tipStyle = {
  background: "#19110b",
  border: "none",
  borderRadius: 0,
  color: "#fff",
  fontSize: 12,
  letterSpacing: "0.4px",
  padding: "10px 12px",
};

async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1200;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type Tab = "apercu" | "commandes" | "produits" | "logistique" | "finance" | "personnel" | "parametres";

const TABS: Record<Role, [Tab, string][]> = {
  admin: [
    ["apercu", "Aperçu"],
    ["commandes", "Commandes"],
    ["produits", "Produits"],
    ["logistique", "Logistique"],
    ["finance", "Finance"],
    ["personnel", "Équipe"],
    ["parametres", "Paramètres"],
  ],
  gerant: [
    ["apercu", "Aperçu"],
    ["commandes", "Commandes"],
    ["produits", "Produits"],
    ["logistique", "Logistique"],
  ],
  livreur: [
    ["apercu", "Aujourd'hui"],
    ["commandes", "Livraisons"],
  ],
};

const STATUSES: OrderStatus[] = ["nouvelle", "confirmée", "en livraison", "livrée", "annulée"];
const CHART = ["#1a1a1a", "#727272", "#b0b0b0", "#d4d4d4", "#19110b"];

export function Dashboard({ role }: { role: Role }) {
  const user = useSessionUser();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>(TABS[role][0]![0]);
  const [openNav, setOpenNav] = useState(false);

  if (!user || (user.role !== role && user.role !== "admin")) {
    return (
      <div className="min-h-screen grid place-items-center px-5 text-center">
        <div>
          <h1 className="text-3xl tracking-[0.4px]">Accès réservé</h1>
          <Link to="/connexion" className="btn-lux-dark mt-8">
            Connexion
          </Link>
        </div>
      </div>
    );
  }

  const tabs = TABS[role];
  const title = tabs.find((t) => t[0] === tab)?.[1] ?? "";

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#1a1a1a] md:grid md:grid-cols-[240px_1fr]">
      <aside className={`bg-[#19110b] text-white p-5 md:min-h-screen md:p-6 ${openNav ? "block" : "hidden md:block"}`}>
        <Link to="/" className="lv-wordmark text-[0.75rem] text-white">
          {STORE_NAME}
        </Link>
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
          {role === "admin" ? "Administration" : role === "gerant" ? "Gérant" : "Livreur"}
        </p>
        <nav className="mt-8 flex flex-col gap-1">
          {tabs.map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setTab(k);
                setOpenNav(false);
              }}
              className={`text-left px-3 py-2.5 text-sm tracking-[0.4px] ${tab === k ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
            >
              {l}
            </button>
          ))}
        </nav>
        <div className="mt-10 border-t border-white/10 pt-4 text-sm">
          <p className="tracking-[0.4px]">{user.name}</p>
          <button
            type="button"
            className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/55 hover:text-white"
            onClick={() => {
              setState(() => ({ session: null }));
              nav({ to: "/connexion" });
            }}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[#e5e5e5] bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={openNav ? "Fermer le menu" : "Ouvrir le menu"}
              className="md:hidden p-1.5 -ml-1.5 hover:opacity-60"
              onClick={() => setOpenNav((o) => !o)}
            >
              {openNav ? <X className="w-5 h-5" strokeWidth={1.25} /> : <Menu className="w-5 h-5" strokeWidth={1.25} />}
            </button>
            <h1 className="text-lg sm:text-xl tracking-[0.4px] font-normal">{title}</h1>
          </div>
          <Link to="/" className="text-[11px] uppercase tracking-[0.16em] text-[#727272] hover:text-[#1a1a1a]">
            Boutique
          </Link>
        </header>

        <main className="p-4 sm:p-6 md:p-8 overflow-x-auto">
          {tab === "apercu" && <Overview role={role} badge={user.badge} />}
          {tab === "commandes" && <Orders role={role} badge={user.badge} />}
          {tab === "produits" && <Products />}
          {tab === "logistique" && <Logistics />}
          {tab === "finance" && <Finance />}
          {tab === "personnel" && <StaffMgr />}
          {tab === "parametres" && <SettingsMgr />}
        </main>
      </div>
    </div>
  );
}

const Panel = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`bg-white border border-[#e8e8e8] p-4 sm:p-5 ${className}`}>{children}</div>
);

const Field = ({ t, children }: { t: string; children: ReactNode }) => (
  <label className="block space-y-1.5">
    <span className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">{t}</span>
    {children}
  </label>
);

function Overview({ role, badge }: { role: Role; badge: string }) {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const expenses = useStore((s) => s.expenses);

  const mine = role === "livreur" ? orders.filter((o) => o.livreur === badge) : orders;
  const delivered = mine.filter((o) => o.status === "livrée");
  const pending = mine.filter((o) => !["livrée", "annulée"].includes(o.status));
  const revenue = delivered.reduce((a, o) => a + orderSubtotal(o), 0);
  const spent = expenses.reduce((a, e) => a + e.amount, 0);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of mine) map[o.status] = (map[o.status] ?? 0) + 1;
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [mine]);

  const revenueSeries = useMemo(() => {
    const days: Record<string, { ca: number; commandes: number }> = {};
    for (const o of delivered) {
      const d = o.deliveryDate || o.createdAt.slice(0, 10);
      const cur = days[d] ?? { ca: 0, commandes: 0 };
      days[d] = { ca: cur.ca + orderSubtotal(o), commandes: cur.commandes + 1 };
    }
    return Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, v]) => ({ date: date.slice(5), ca: Number(v.ca.toFixed(2)), commandes: v.commandes }));
  }, [delivered]);

  const stockBars = useMemo(
    () =>
      [...products]
        .map((p) => ({
          name: p.name.length > 16 ? `${p.name.slice(0, 16)}…` : p.name,
          stock: p.variants.reduce((a, v) => a + v.stock, 0),
        }))
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 8),
    [products],
  );

  const financeBars = useMemo(
    () => [
      { name: "CA", value: Number(revenue.toFixed(2)) },
      { name: "Dépenses", value: Number(spent.toFixed(2)) },
      { name: "Net", value: Number(Math.max(0, revenue - spent).toFixed(2)) },
    ],
    [revenue, spent],
  );

  if (role === "livreur") {
    return (
      <div className="space-y-4">
        <div className="grid lg:grid-cols-2 gap-4">
          <Panel className="!p-5">
            <div className="flex items-end justify-between mb-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272]">Activité</p>
              <p className="text-2xl tracking-[0.4px]">{pending.length + delivered.length}</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "À livrer", value: pending.length },
                    { name: "Livrées", value: delivered.length },
                  ]}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#f0f0f0" vertical={false} strokeDasharray="3 6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#727272" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#727272" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={tipStyle} cursor={{ fill: "rgba(25,17,11,0.04)" }} />
                  <Bar dataKey="value" fill="#19110b" radius={[4, 4, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel className="!p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272] mb-2">Répartition</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus.length ? byStatus : [{ name: "Aucune", value: 1 }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {(byStatus.length ? byStatus : [{ name: "Aucune", value: 1 }]).map((_, i) => (
                      <Cell key={i} fill={CHART[i % CHART.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tipStyle} />
                  <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2 !p-5">
          <div className="flex items-end justify-between gap-3 mb-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272]">CA (commandes livrées)</p>
              <p className="mt-1 text-2xl tracking-[0.4px]">{fmtUSD(revenue)}</p>
            </div>
            <p className="text-xs text-[#929292]">{delivered.length} livrées · {pending.length} en cours</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries.length ? revenueSeries : [{ date: "—", ca: 0, commandes: 0 }]} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="caFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#19110b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#19110b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0f0f0" vertical={false} strokeDasharray="3 6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#727272" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#727272" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={tipStyle}
                  formatter={(value: number, name: string) => [name === "ca" ? fmtUSD(value) : value, name === "ca" ? "CA" : "Commandes"]}
                />
                <Area type="monotone" dataKey="ca" stroke="#19110b" fill="url(#caFill)" strokeWidth={2} />
                <Line type="monotone" dataKey="commandes" stroke="#b0b0b0" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="!p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272] mb-3">Statuts</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byStatus.length ? byStatus : [{ name: "Aucune", value: 1 }]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={3}
                >
                  {(byStatus.length ? byStatus : [{ name: "Aucune", value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={CHART[i % CHART.length]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tipStyle} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel className="!p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272] mb-3">Finance</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f0f0f0" vertical={false} strokeDasharray="3 6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#727272" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#727272" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={tipStyle} formatter={(v: number) => [fmtUSD(v), ""]} cursor={{ fill: "rgba(25,17,11,0.04)" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={64}>
                  {financeBars.map((_, i) => (
                    <Cell key={i} fill={CHART[i % CHART.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="!p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272] mb-3">Stock</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockBars.length ? stockBars : [{ name: "—", stock: 0 }]} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#f0f0f0" horizontal={false} strokeDasharray="3 6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#727272" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#727272" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tipStyle} cursor={{ fill: "rgba(25,17,11,0.04)" }} />
                <Bar dataKey="stock" fill="#19110b" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ManualOrderForm({ livreurs }: { livreurs: Staff[] }) {
  const products = useStore((s) => s.products);
  const communes = useStore((s) => s.communes);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    name: "",
    phone: "",
    address: "",
    instructions: "",
    commune: "",
    zone: "",
    date: new Date().toISOString().slice(0, 10),
    livreur: "",
    status: "confirmée" as OrderStatus,
    productId: "",
    variantId: "",
    qty: "5",
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v, ...(k === "commune" ? { zone: "" } : {}), ...(k === "productId" ? { variantId: "" } : {}) }));
  const product = products.find((p) => p.id === f.productId);
  const commune = communes.find((c) => c.name === f.commune);
  const zone = commune?.zones.find((z) => z.id === f.zone);

  const addItem = () => {
    const v = product?.variants.find((x) => x.id === f.variantId);
    const qty = Math.max(1, +f.qty || 1);
    if (!product || !v) {
      toast.error("Produit requis");
      return;
    }
    setItems((list) => [...list, { name: product.name, variant: v.label, price: v.price, qty }]);
    setF((x) => ({ ...x, productId: "", variantId: "", qty: "5" }));
  };

  const create = () => {
    if (!f.name.trim() || !f.phone.trim()) {
      toast.error("Client requis");
      return;
    }
    if (!commune || !zone) {
      toast.error("Commune et zone requises");
      return;
    }
    if (!items.length) {
      toast.error("Ajoutez au moins un article");
      return;
    }
    const order: Order = {
      id: "CMD-" + uid().toUpperCase().slice(0, 5),
      createdAt: new Date().toISOString(),
      items,
      customer: { name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim(), instructions: f.instructions.trim() },
      commune: commune.name,
      zone: zone.name,
      fee: zone.fee,
      deliveryDate: f.date,
      status: f.status === "livrée" ? "livrée" : f.status,
      livreur: f.livreur || undefined,
    };
    setState((s) => ({
      orders: [order, ...s.orders],
      products: s.products.map((p) => ({
        ...p,
        variants: p.variants.map((v) => {
          const used = items.filter((i) => i.name === p.name && i.variant === v.label).reduce((a, i) => a + i.qty, 0);
          return used ? { ...v, stock: Math.max(0, v.stock - used) } : v;
        }),
      })),
    }));
    setItems([]);
    setF({
      name: "",
      phone: "",
      address: "",
      instructions: "",
      commune: "",
      zone: "",
      date: new Date().toISOString().slice(0, 10),
      livreur: "",
      status: "confirmée",
      productId: "",
      variantId: "",
      qty: "5",
    });
    setOpen(false);
    toast.success("Commande créée");
  };

  if (!open) {
    return (
      <button type="button" className="btn-lux-dark" onClick={() => setOpen(true)}>
        Nouvelle commande
      </button>
    );
  }

  return (
    <Panel className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272]">Créer une commande</p>
        <button type="button" className="text-sm text-[#727272]" onClick={() => setOpen(false)}>
          Fermer
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field t="Client">
          <input className="field" value={f.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field t="Téléphone">
          <input className="field" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field t="Adresse">
          <input className="field" value={f.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field t="Date livraison">
          <input type="date" className="field" value={f.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field t="Commune">
          <select className="field" value={f.commune} onChange={(e) => set("commune", e.target.value)}>
            <option value="">—</option>
            {communes.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field t="Zone">
          <select className="field" value={f.zone} onChange={(e) => set("zone", e.target.value)} disabled={!commune}>
            <option value="">—</option>
            {commune?.zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} — {fmtCDF(z.fee)}
              </option>
            ))}
          </select>
        </Field>
        <Field t="Livreur">
          <select className="field" value={f.livreur} onChange={(e) => set("livreur", e.target.value)}>
            <option value="">—</option>
            {livreurs.map((l) => (
              <option key={l.badge} value={l.badge}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>
        <Field t="Statut">
          <select className="field" value={f.status} onChange={(e) => set("status", e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid sm:grid-cols-[1.2fr_1fr_0.6fr_auto] gap-2 items-end border-t border-[#eee] pt-4">
        <Field t="Produit">
          <select className="field" value={f.productId} onChange={(e) => set("productId", e.target.value)}>
            <option value="">—</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field t="Variante">
          <select className="field" value={f.variantId} onChange={(e) => set("variantId", e.target.value)} disabled={!product}>
            <option value="">—</option>
            {product?.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} · {fmtUSD(v.price)}
              </option>
            ))}
          </select>
        </Field>
        <Field t="Qté">
          <input type="number" min={1} className="field" value={f.qty} onChange={(e) => set("qty", e.target.value)} />
        </Field>
        <button type="button" className="btn-ghost-lux !min-h-11" onClick={addItem}>
          +
        </button>
      </div>
      {items.length ? (
        <ul className="text-sm space-y-1">
          {items.map((i, k) => (
            <li key={k} className="flex justify-between gap-3 border-t border-[#f0f0f0] pt-2">
              <span>
                {i.name} ({i.variant}) × {i.qty}
              </span>
              <button type="button" className="text-destructive" onClick={() => setItems((list) => list.filter((_, j) => j !== k))}>
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <Field t="Note">
        <input className="field" value={f.instructions} onChange={(e) => set("instructions", e.target.value)} />
      </Field>
      <button type="button" className="btn-lux-dark" onClick={create}>
        Enregistrer la commande
      </button>
    </Panel>
  );
}

function Orders({ role, badge }: { role: Role; badge: string }) {
  const all = useStore((s) => s.orders);
  const staffAll = useStore((s) => s.staff);
  const livreurs = staffAll.filter((u) => u.role === "livreur" && u.active);
  const orders = role === "livreur" ? all.filter((o) => o.livreur === badge) : all;
  const upd = (id: string, patch: Partial<Order>) =>
    setState((s) => ({
      orders: s.orders.map((o) => {
        if (o.id !== id) return o;
        const next = { ...o, ...patch };
        if (patch.status === "livrée" && !next.deliveryDate) {
          next.deliveryDate = new Date().toISOString().slice(0, 10);
        }
        return next;
      }),
    }));

  return (
    <div className="space-y-4">
      {role !== "livreur" ? <ManualOrderForm livreurs={livreurs} /> : null}
      {!orders.length ? <p className="text-sm text-[#727272] tracking-[0.4px]">Aucune commande.</p> : null}
      {orders.map((o) => (
        <Panel key={o.id}>
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="font-medium tracking-[0.4px]">
                {o.id} <span className="text-xs text-[#929292] ml-2">{new Date(o.createdAt).toLocaleString("fr-FR")}</span>
              </p>
              <p className="text-sm mt-1">
                {o.customer.name} · {o.customer.phone}
              </p>
              <p className="text-sm text-[#727272]">
                {o.commune} — {o.zone}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl tracking-[0.4px]">{fmtUSD(orderSubtotal(o))}</p>
              <p className="text-xs text-[#727272]">+ {fmtCDF(o.fee)}</p>
              {o.status === "livrée" ? <p className="text-[10px] uppercase tracking-[0.14em] text-[#2f6b4f] mt-1">Comptabilisé CA</p> : null}
            </div>
          </div>
          <div className="text-sm mt-3 border-t border-[#eee] pt-3 space-y-0.5">
            {o.items.map((i, k) => (
              <p key={k}>
                {i.name} ({i.variant}) × {i.qty}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <select
              className="field !w-auto"
              value={o.status}
              onChange={(e) => upd(o.id, { status: e.target.value as OrderStatus })}
            >
              {(role === "livreur"
                ? (["en livraison", "livrée"] as OrderStatus[]).concat(
                    o.status === "en livraison" || o.status === "livrée" ? [] : [o.status],
                  )
                : STATUSES
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {role !== "livreur" ? (
              <select className="field !w-auto" value={o.livreur ?? ""} onChange={(e) => upd(o.id, { livreur: e.target.value || undefined })}>
                <option value="">Livreur</option>
                {livreurs.map((l) => (
                  <option key={l.badge} value={l.badge}>
                    {l.name}
                  </option>
                ))}
              </select>
            ) : null}
            {role === "admin" ? (
              <button type="button" className="text-sm text-destructive" onClick={() => setState((s) => ({ orders: s.orders.filter((x) => x.id !== o.id) }))}>
                Supprimer
              </button>
            ) : null}
          </div>
        </Panel>
      ))}
    </div>
  );
}

const emptyProduct = (): Product => ({
  id: uid(),
  name: "",
  brand: "",
  family: "",
  categoryId: null,
  description: "",
  notes: "",
  image: "",
  featured: false,
  variants: [{ id: uid(), label: "50 ml", price: 0, stock: 0 }],
});

function CategoriesMgr() {
  const categories = useStore((s) => s.categories);
  const [name, setName] = useState("");

  const add = () => {
    const n = name.trim();
    if (!n) return;
    const slug = slugify(n) || uid();
    if (categories.some((c) => c.slug === slug || c.name.toLowerCase() === n.toLowerCase())) {
      toast.error("Catégorie déjà existante");
      return;
    }
    const cat: Category = { id: uid(), name: n, slug, sortOrder: categories.length + 1 };
    setState((s) => ({ categories: [...s.categories, cat] }));
    setName("");
    toast.success("Catégorie créée");
  };

  return (
    <Panel className="space-y-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272]">Catégories</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input className="field" placeholder="Nouvelle catégorie" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" className="btn-lux-dark shrink-0" onClick={add}>
          Créer
        </button>
      </div>
      {categories.length ? (
        <ul className="divide-y border-t border-[#eee]">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="tracking-[0.4px]">{c.name}</span>
              <button
                type="button"
                className="text-destructive"
                onClick={() =>
                  setState((s) => ({
                    categories: s.categories.filter((x) => x.id !== c.id),
                    products: s.products.map((p) => (p.categoryId === c.id ? { ...p, categoryId: null } : p)),
                  }))
                }
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#929292]">Aucune catégorie — créez-en une.</p>
      )}
    </Panel>
  );
}

function Products() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const [edit, setEdit] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const save = () => {
    if (!edit || !edit.name) {
      toast.error("Nom requis");
      return;
    }
    setState((s) => ({
      products: s.products.some((p) => p.id === edit.id) ? s.products.map((p) => (p.id === edit.id ? edit : p)) : [...s.products, edit],
    }));
    setEdit(null);
    toast.success("Enregistré");
  };
  const e = edit;
  const set = (patch: Partial<Product>) => setEdit((x) => (x ? { ...x, ...patch } : x));

  const onImport = async (file?: File | null) => {
    if (!file || !e) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Fichier image requis");
      return;
    }
    try {
      setUploading(true);
      const dataUrl = await fileToDataUrl(file);
      set({ image: dataUrl });
      toast.success("Image importée");
    } catch {
      toast.error("Import impossible");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <CategoriesMgr />
      {!e ? (
        <button type="button" className="btn-lux-dark" onClick={() => setEdit(emptyProduct())}>
          Ajouter un produit
        </button>
      ) : null}
      {e ? (
        <Panel className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field t="Nom">
              <input className="field" value={e.name} onChange={(x) => set({ name: x.target.value })} />
            </Field>
            <Field t="Marque">
              <input className="field" value={e.brand} onChange={(x) => set({ brand: x.target.value })} />
            </Field>
            <Field t="Famille">
              <input className="field" value={e.family} onChange={(x) => set({ family: x.target.value })} />
            </Field>
            <Field t="Catégorie">
              <select className="field" value={e.categoryId ?? ""} onChange={(x) => set({ categoryId: x.target.value || null })}>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field t="Notes">
              <input className="field" value={e.notes} onChange={(x) => set({ notes: x.target.value })} />
            </Field>
            <Field t="Image">
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  className="field !py-2 file:mr-3 file:border-0 file:bg-transparent file:text-sm"
                  disabled={uploading}
                  onChange={(x) => void onImport(x.target.files?.[0])}
                />
                {e.image ? <img src={e.image} alt="" className="h-24 w-20 object-cover bg-[#f8f8f8]" /> : null}
              </div>
            </Field>
          </div>
          <Field t="Description">
            <textarea className="field" rows={3} value={e.description} onChange={(x) => set({ description: x.target.value })} />
          </Field>
          <label className="flex gap-2 text-sm items-center">
            <input type="checkbox" checked={e.featured} onChange={(x) => set({ featured: x.target.checked })} />
            Mis en avant
          </label>
          {e.variants.map((v, k) => (
            <div key={v.id} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
              <Field t="Contenance">
                <input className="field" value={v.label} onChange={(x) => set({ variants: e.variants.map((y, j) => (j === k ? { ...y, label: x.target.value } : y)) })} />
              </Field>
              <Field t="Prix">
                <input type="number" className="field" value={v.price} onChange={(x) => set({ variants: e.variants.map((y, j) => (j === k ? { ...y, price: +x.target.value } : y)) })} />
              </Field>
              <Field t="Stock">
                <input type="number" className="field" value={v.stock} onChange={(x) => set({ variants: e.variants.map((y, j) => (j === k ? { ...y, stock: +x.target.value } : y)) })} />
              </Field>
              <button type="button" className="text-destructive text-sm pb-2" onClick={() => set({ variants: e.variants.filter((_, j) => j !== k) })}>
                Retirer
              </button>
            </div>
          ))}
          <button type="button" className="btn-ghost-lux" onClick={() => set({ variants: [...e.variants, { id: uid(), label: "", price: 0, stock: 0 }] })}>
            + Variante
          </button>
          <div className="flex gap-2">
            <button type="button" className="btn-lux-dark" onClick={save}>
              Enregistrer
            </button>
            <button type="button" className="btn-ghost-lux" onClick={() => setEdit(null)}>
              Annuler
            </button>
          </div>
        </Panel>
      ) : null}
      <div className="grid sm:grid-cols-2 gap-3">
        {products.map((p) => (
          <Panel key={p.id} className="flex gap-4">
            {p.image ? <img src={p.image} alt="" className="w-16 h-20 object-cover bg-[#f8f8f8]" /> : null}
            <div className="flex-1 min-w-0">
              <p className="text-lg tracking-[0.4px] truncate">{p.name}</p>
              <p className="text-xs text-[#727272] mt-1">{p.variants.map((v) => `${v.label}: ${fmtUSD(v.price)}`).join(" · ")}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <button type="button" className="underline" onClick={() => setEdit(structuredClone(p))}>
                  Modifier
                </button>
                <button type="button" className="text-destructive" onClick={() => setState((s) => ({ products: s.products.filter((x) => x.id !== p.id) }))}>
                  Supprimer
                </button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Logistics() {
  const communes = useStore((s) => s.communes);
  const [newZone, setNewZone] = useState<Record<string, { name: string; fee: string }>>({});
  const upd = (name: string, fn: (z: (typeof communes)[number]["zones"]) => (typeof communes)[number]["zones"]) =>
    setState((s) => ({ communes: s.communes.map((c) => (c.name === name ? { ...c, zones: fn(c.zones) } : c)) }));

  return (
    <div className="space-y-3">
      <div className="border bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-[#f8f8f8]">
            <tr>
              <th className="text-left p-3 font-normal">Commune</th>
              <th className="text-left p-3 font-normal">Zones</th>
              <th className="text-left p-3 font-normal">Ajouter</th>
            </tr>
          </thead>
          <tbody>
            {communes.map((c) => (
              <tr key={c.name} className="border-t align-top">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 space-y-2">
                  {c.zones.map((z) => (
                    <div key={z.id} className="flex gap-2 items-center">
                      <input className="field !py-1" value={z.name} onChange={(e) => upd(c.name, (zs) => zs.map((y) => (y.id === z.id ? { ...y, name: e.target.value } : y)))} />
                      <input type="number" className="field !py-1 !w-28" value={z.fee} onChange={(e) => upd(c.name, (zs) => zs.map((y) => (y.id === z.id ? { ...y, fee: +e.target.value } : y)))} />
                      <button type="button" className="text-destructive" onClick={() => upd(c.name, (zs) => zs.filter((y) => y.id !== z.id))}>
                        ×
                      </button>
                    </div>
                  ))}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <input className="field !py-1" placeholder="Quartier" value={newZone[c.name]?.name ?? ""} onChange={(e) => setNewZone((x) => ({ ...x, [c.name]: { fee: x[c.name]?.fee ?? "", name: e.target.value } }))} />
                    <input type="number" className="field !py-1 !w-24" placeholder="FC" value={newZone[c.name]?.fee ?? ""} onChange={(e) => setNewZone((x) => ({ ...x, [c.name]: { name: x[c.name]?.name ?? "", fee: e.target.value } }))} />
                    <button
                      type="button"
                      className="btn-lux-dark !px-3 !py-1"
                      onClick={() => {
                        const n = newZone[c.name];
                        if (!n?.name) return;
                        upd(c.name, (zs) => [...zs, { id: uid(), name: n.name, fee: +n.fee || 0 }]);
                        setNewZone((x) => ({ ...x, [c.name]: { name: "", fee: "" } }));
                      }}
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#929292]">{COMMUNES.length} communes</p>
    </div>
  );
}

function Finance() {
  const orders = useStore((s) => s.orders);
  const expenses = useStore((s) => s.expenses);
  const [f, setF] = useState({ label: "", amount: "" });
  const delivered = orders.filter((o) => o.status === "livrée");
  const revenue = delivered.reduce((a, o) => a + orderSubtotal(o), 0);
  const spent = expenses.reduce((a, e) => a + e.amount, 0);

  const chart = useMemo(
    () => [
      { name: "CA", value: revenue },
      { name: "Dépenses", value: spent },
      { name: "Net", value: Math.max(0, revenue - spent) },
    ],
    [revenue, spent],
  );

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-3">
        <Panel>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">CA livré</p>
          <p className="mt-2 text-3xl tracking-[0.4px]">{fmtUSD(revenue)}</p>
        </Panel>
        <Panel>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">Dépenses</p>
          <p className="mt-2 text-3xl tracking-[0.4px]">{fmtUSD(spent)}</p>
        </Panel>
        <Panel>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">Net</p>
          <p className="mt-2 text-3xl tracking-[0.4px]">{fmtUSD(revenue - spent)}</p>
        </Panel>
      </div>
      <Panel>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid stroke="#efefef" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#727272" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#727272" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip />
              <Bar dataKey="value" fill="#1a1a1a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="field" placeholder="Libellé" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
          <input type="number" className="field sm:!w-32" placeholder="USD" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          <button
            type="button"
            className="btn-lux-dark"
            onClick={() => {
              if (!f.label) return;
              setState((s) => ({
                expenses: [{ id: uid(), label: f.label, amount: +f.amount || 0, date: new Date().toISOString().slice(0, 10) }, ...s.expenses],
              }));
              setF({ label: "", amount: "" });
            }}
          >
            Ajouter
          </button>
        </div>
        {expenses.map((e) => (
          <div key={e.id} className="flex justify-between text-sm border-t border-[#eee] pt-2">
            <span>
              {e.date} · {e.label}
            </span>
            <span>
              {fmtUSD(e.amount)}{" "}
              <button type="button" className="text-destructive ml-3" onClick={() => setState((s) => ({ expenses: s.expenses.filter((x) => x.id !== e.id) }))}>
                ×
              </button>
            </span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function StaffMgr() {
  const staff = useStore((s) => s.staff);
  const [f, setF] = useState<Staff>({ badge: "", password: "", name: "", role: "livreur", active: true, phone: "" });
  const upd = (badge: string, patch: Partial<Staff>) => setState((s) => ({ staff: s.staff.map((u) => (u.badge === badge ? { ...u, ...patch } : u)) }));

  return (
    <div className="space-y-5">
      <Panel className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <Field t="Nom">
          <input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field t="Identifiant">
          <input className="field uppercase" value={f.badge} onChange={(e) => setF({ ...f, badge: e.target.value.toUpperCase() })} />
        </Field>
        <Field t="Mot de passe">
          <input className="field" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </Field>
        <Field t="Rôle">
          <select className="field" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>
            <option value="livreur">Livreur</option>
            <option value="gerant">Gérant</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <button
          type="button"
          className="btn-lux-dark"
          onClick={() => {
            if (!f.name || !f.badge || !f.password) {
              toast.error("Champs requis");
              return;
            }
            if (staff.some((u) => u.badge === f.badge)) {
              toast.error("Identifiant déjà utilisé");
              return;
            }
            setState((s) => ({ staff: [...s.staff, f] }));
            setF({ ...f, badge: "", password: "", name: "" });
            toast.success("Compte créé");
          }}
        >
          Créer
        </button>
      </Panel>
      <div className="border bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-[#f8f8f8]">
            <tr>
              {["Nom", "ID", "Rôle", "Mot de passe", "Statut", ""].map((h) => (
                <th key={h} className="text-left p-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.badge} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3 font-mono text-xs">{u.badge}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <input className="field !py-1" value={u.password} onChange={(e) => upd(u.badge, { password: e.target.value })} />
                </td>
                <td className="p-3">
                  <button type="button" onClick={() => upd(u.badge, { active: !u.active })} className={u.active ? "text-[#2f6b4f]" : "text-destructive"}>
                    {u.active ? "Actif" : "Off"}
                  </button>
                </td>
                <td className="p-3">
                  {u.badge !== "ADM-001" ? (
                    <button type="button" className="text-destructive" onClick={() => setState((s) => ({ staff: s.staff.filter((x) => x.badge !== u.badge) }))}>
                      Supprimer
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsMgr() {
  const settings = useStore((s) => s.settings);
  const [uploading, setUploading] = useState(false);
  const set = <K extends keyof typeof settings>(k: K, v: (typeof settings)[K]) =>
    setState((s) => ({ settings: { ...s.settings, [k]: v, storeName: STORE_NAME } }));

  const importHero = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      setUploading(true);
      const imported: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        imported.push(await fileToDataUrl(file));
      }
      if (!imported.length) {
        toast.error("Fichier image requis");
        return;
      }
      set("heroImages", [...(settings.heroImages ?? []), ...imported]);
      toast.success("Image(s) ajoutée(s)");
    } catch {
      toast.error("Import impossible");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Panel className="space-y-4 max-w-2xl">
      <Field t="WhatsApp">
        <input className="field" value={settings.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
      </Field>
      <Field t="Bandeau">
        <input className="field" value={settings.announcement} onChange={(e) => set("announcement", e.target.value)} />
      </Field>
      <Field t="Titre héro">
        <input className="field" value={settings.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
      </Field>
      <Field t="Sous-titre héro">
        <textarea className="field" rows={2} value={settings.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} />
      </Field>
      <Field t="Images héro">
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          className="field !py-2 file:mr-3 file:border-0 file:bg-transparent file:text-sm"
          onChange={(e) => {
            void importHero(e.target.files);
            e.target.value = "";
          }}
        />
      </Field>
      {(settings.heroImages ?? []).length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {settings.heroImages.map((src, i) => (
            <div key={`${i}-${src.slice(0, 24)}`} className="relative">
              <img src={src} alt="" className="aspect-[4/5] w-full object-cover bg-[#f8f8f8]" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-white/90 px-2 py-0.5 text-xs text-destructive"
                onClick={() => set("heroImages", settings.heroImages.filter((_, k) => k !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}
