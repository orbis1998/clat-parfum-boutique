import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  COMMUNES, fmtCDF, fmtUSD, orderSubtotal, setState, uid, useSessionUser, useStore,
  type OrderStatus, type Product, type Role, type Staff,
} from "@/lib/store";

type Tab = "apercu" | "commandes" | "produits" | "logistique" | "finance" | "journal" | "personnel" | "parametres";
const TABS: Record<Role, [Tab, string][]> = {
  admin: [["apercu", "Aperçu"], ["commandes", "Commandes"], ["produits", "Produits & variantes"], ["logistique", "Logistique"], ["finance", "Finance"], ["journal", "Journal"], ["personnel", "Personnel"], ["parametres", "Paramètres"]],
  gerant: [["apercu", "Aperçu"], ["commandes", "Commandes"], ["produits", "Produits & variantes"], ["logistique", "Logistique"]],
  livreur: [["commandes", "Mes livraisons"]],
};
const STATUSES: OrderStatus[] = ["nouvelle", "confirmée", "en livraison", "livrée", "annulée"];

export function Dashboard({ role }: { role: Role }) {
  const user = useSessionUser();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>(TABS[role][0]![0]);
  if (!user || (user.role !== role && user.role !== "admin"))
    return (
      <div className="min-h-screen grid place-items-center text-center px-5">
        <div><h1 className="text-4xl">Accès réservé</h1><p className="text-muted-foreground mt-2">Connectez-vous avec votre badge.</p><Link to="/connexion" className="btn-lux mt-8">Connexion</Link></div>
      </div>
    );
  const tabs = TABS[role];
  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <aside className="bg-sidebar text-sidebar-foreground p-6 md:min-h-screen">
        <Link to="/" className="font-display text-2xl">Kinoir</Link>
        <p className="eyebrow text-sidebar-primary mt-1 !text-[0.6rem]">{role === "admin" ? "Administration" : role === "gerant" ? "Gérant" : "Livreur"}</p>
        <nav className="mt-8 flex md:flex-col gap-1 overflow-x-auto">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`text-left px-3 py-2 text-sm whitespace-nowrap ${tab === k ? "bg-sidebar-accent text-sidebar-primary" : "opacity-75 hover:opacity-100"}`}>{l}</button>
          ))}
        </nav>
        <div className="mt-10 border-t border-sidebar-border pt-4 text-sm">
          <p>{user.name}</p><p className="opacity-60 text-xs">{user.badge}</p>
          <button className="eyebrow text-sidebar-primary mt-4 !text-[0.6rem]" onClick={() => { setState(() => ({ session: null })); nav({ to: "/connexion" }); }}>Déconnexion</button>
        </div>
      </aside>
      <main className="p-6 md:p-10 overflow-x-auto">
        <h1 className="text-4xl mb-8">{tabs.find((t) => t[0] === tab)?.[1]}</h1>
        {tab === "apercu" && <Overview />}
        {tab === "commandes" && <Orders role={role} badge={user.badge} />}
        {tab === "produits" && <Products />}
        {tab === "logistique" && <Logistics />}
        {tab === "finance" && <Finance />}
        {tab === "journal" && <Journal />}
        {tab === "personnel" && <StaffMgr />}
        {tab === "parametres" && <SettingsMgr />}
      </main>
    </div>
  );
}

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => <div className={`bg-card border p-5 ${className}`}>{children}</div>;
const Stat = ({ l, v }: { l: string; v: string }) => <Card><p className="eyebrow text-muted-foreground !text-[0.6rem]">{l}</p><p className="font-display text-3xl mt-2">{v}</p></Card>;
const L = ({ t, children }: { t: string; children: ReactNode }) => <label className="block space-y-1"><span className="eyebrow !text-[0.6rem]">{t}</span>{children}</label>;

function Overview() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const delivered = orders.filter((o) => o.status === "livrée");
  const low = products.flatMap((p) => p.variants.filter((v) => v.stock <= 3).map((v) => `${p.name} ${v.label} (${v.stock})`));
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        <Stat l="Commandes" v={String(orders.length)} />
        <Stat l="Nouvelles" v={String(orders.filter((o) => o.status === "nouvelle").length)} />
        <Stat l="Livrées" v={String(delivered.length)} />
        <Stat l="CA articles" v={fmtUSD(delivered.reduce((a, o) => a + orderSubtotal(o), 0))} />
      </div>
      <Card><p className="eyebrow mb-3">Stock faible</p>{low.length ? low.map((x) => <p key={x} className="text-sm">{x}</p>) : <p className="text-sm text-muted-foreground">Aucune alerte.</p>}</Card>
    </div>
  );
}

function Orders({ role, badge }: { role: Role; badge: string }) {
  const all = useStore((s) => s.orders);
  const livreurs = useStore((s) => s.staff.filter((u) => u.role === "livreur" && u.active));
  const orders = role === "livreur" ? all.filter((o) => o.livreur === badge) : all;
  const upd = (id: string, patch: object) => setState((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
  if (!orders.length) return <p className="text-muted-foreground">Aucune commande pour le moment.</p>;
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <Card key={o.id}>
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="font-semibold">{o.id} <span className="text-xs text-muted-foreground ml-2">{new Date(o.createdAt).toLocaleString("fr-FR")}</span></p>
              <p className="text-sm">{o.customer.name} · {o.customer.phone}</p>
              <p className="text-sm text-muted-foreground">{o.commune} — {o.zone} · {o.customer.address}</p>
              <p className="text-sm text-muted-foreground">Livraison : {o.deliveryDate}{o.customer.instructions && ` · ${o.customer.instructions}`}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl">{fmtUSD(orderSubtotal(o))}</p>
              <p className="text-xs text-muted-foreground">+ livraison {fmtCDF(o.fee)}</p>
            </div>
          </div>
          <div className="text-sm mt-3 border-t pt-3">{o.items.map((i, k) => <p key={k}>{i.name} ({i.variant}) × {i.qty}</p>)}</div>
          <div className="flex flex-wrap gap-3 mt-4">
            <select className="field !w-auto" value={o.status} onChange={(e) => upd(o.id, { status: e.target.value })}>
              {(role === "livreur" ? (["en livraison", "livrée"] as OrderStatus[]).concat(o.status === "en livraison" || o.status === "livrée" ? [] : [o.status]) : STATUSES).map((s) => <option key={s}>{s}</option>)}
            </select>
            {role !== "livreur" && (
              <select className="field !w-auto" value={o.livreur ?? ""} onChange={(e) => upd(o.id, { livreur: e.target.value || undefined })}>
                <option value="">Assigner un livreur</option>
                {livreurs.map((l) => <option key={l.badge} value={l.badge}>{l.name}</option>)}
              </select>
            )}
            {role === "admin" && <button className="text-sm text-destructive" onClick={() => setState((s) => ({ orders: s.orders.filter((x) => x.id !== o.id) }))}>Supprimer</button>}
          </div>
        </Card>
      ))}
    </div>
  );
}

const emptyProduct = (): Product => ({ id: uid(), name: "", brand: "", family: "", description: "", notes: "", image: "", featured: false, variants: [{ id: uid(), label: "50 ml", price: 0, stock: 0 }] });

function Products() {
  const products = useStore((s) => s.products);
  const [edit, setEdit] = useState<Product | null>(null);
  const save = () => {
    if (!edit || !edit.name) { toast.error("Nom requis"); return; }
    setState((s) => ({ products: s.products.some((p) => p.id === edit.id) ? s.products.map((p) => (p.id === edit.id ? edit : p)) : [...s.products, edit] }));
    setEdit(null);
    toast.success("Produit enregistré");
  };
  const e = edit;
  const set = (patch: Partial<Product>) => setEdit((x) => (x ? { ...x, ...patch } : x));
  return (
    <div className="space-y-6">
      {!e && <button className="btn-lux" onClick={() => setEdit(emptyProduct())}>Ajouter un produit</button>}
      {e && (
        <Card className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <L t="Nom"><input className="field" value={e.name} onChange={(x) => set({ name: x.target.value })} /></L>
            <L t="Marque"><input className="field" value={e.brand} onChange={(x) => set({ brand: x.target.value })} /></L>
            <L t="Famille"><input className="field" value={e.family} onChange={(x) => set({ family: x.target.value })} /></L>
            <L t="Notes"><input className="field" value={e.notes} onChange={(x) => set({ notes: x.target.value })} /></L>
            <L t="Image (URL)"><input className="field" value={e.image.startsWith("data:") ? "(fichier importé)" : e.image} onChange={(x) => set({ image: x.target.value })} /></L>
            <L t="Ou importer"><input type="file" accept="image/*" className="field" onChange={(x) => { const f = x.target.files?.[0]; if (!f) return undefined; const r = new FileReader(); r.onload = () => set({ image: String(r.result) }); r.readAsDataURL(f); }} /></L>
          </div>
          <L t="Description"><textarea className="field" rows={3} value={e.description} onChange={(x) => set({ description: x.target.value })} /></L>
          <label className="flex gap-2 text-sm items-center"><input type="checkbox" checked={e.featured} onChange={(x) => set({ featured: x.target.checked })} /> Afficher dans le héro (balayage)</label>
          <p className="eyebrow">Variantes (prix en USD)</p>
          {e.variants.map((v, k) => (
            <div key={v.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
              <L t="Contenance"><input className="field" value={v.label} onChange={(x) => set({ variants: e.variants.map((y, j) => (j === k ? { ...y, label: x.target.value } : y)) })} /></L>
              <L t="Prix USD"><input type="number" className="field" value={v.price} onChange={(x) => set({ variants: e.variants.map((y, j) => (j === k ? { ...y, price: +x.target.value } : y)) })} /></L>
              <L t="Stock"><input type="number" className="field" value={v.stock} onChange={(x) => set({ variants: e.variants.map((y, j) => (j === k ? { ...y, stock: +x.target.value } : y)) })} /></L>
              <button className="text-destructive text-sm pb-3" onClick={() => set({ variants: e.variants.filter((_, j) => j !== k) })}>Retirer</button>
            </div>
          ))}
          <button className="btn-ghost-lux" onClick={() => set({ variants: [...e.variants, { id: uid(), label: "", price: 0, stock: 0 }] })}>+ Variante</button>
          <div className="flex gap-3"><button className="btn-lux" onClick={save}>Enregistrer</button><button className="btn-ghost-lux" onClick={() => setEdit(null)}>Annuler</button></div>
        </Card>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {products.map((p) => (
          <Card key={p.id} className="flex gap-4">
            {p.image && <img src={p.image} alt="" className="w-16 h-20 object-cover" />}
            <div className="flex-1">
              <p className="font-display text-2xl">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.variants.map((v) => `${v.label}: ${fmtUSD(v.price)} (${v.stock})`).join(" · ")}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <button className="underline" onClick={() => setEdit(structuredClone(p))}>Modifier</button>
                <button className="text-destructive" onClick={() => setState((s) => ({ products: s.products.filter((x) => x.id !== p.id) }))}>Supprimer</button>
              </div>
            </div>
          </Card>
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
      <p className="text-sm text-muted-foreground">Les frais de livraison sont en francs congolais (FC) et ne sont pas comptabilisés dans le chiffre d'affaires.</p>
      <div className="border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr><th className="text-left p-3">Commune</th><th className="text-left p-3">Zones & frais (FC)</th><th className="text-left p-3">Ajouter une zone</th></tr></thead>
          <tbody>
            {communes.map((c) => (
              <tr key={c.name} className="border-t align-top">
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3 space-y-2">
                  {c.zones.map((z) => (
                    <div key={z.id} className="flex gap-2 items-center">
                      <input className="field !py-1" value={z.name} onChange={(e) => upd(c.name, (zs) => zs.map((y) => (y.id === z.id ? { ...y, name: e.target.value } : y)))} />
                      <input type="number" className="field !py-1 !w-28" value={z.fee} onChange={(e) => upd(c.name, (zs) => zs.map((y) => (y.id === z.id ? { ...y, fee: +e.target.value } : y)))} />
                      <button className="text-destructive" onClick={() => upd(c.name, (zs) => zs.filter((y) => y.id !== z.id))}>×</button>
                    </div>
                  ))}
                  {!c.zones.length && <span className="text-muted-foreground">Aucune zone — non livrable</span>}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <input className="field !py-1" placeholder="Quartier" value={newZone[c.name]?.name ?? ""} onChange={(e) => setNewZone((x) => ({ ...x, [c.name]: { fee: x[c.name]?.fee ?? "", name: e.target.value } }))} />
                    <input type="number" className="field !py-1 !w-24" placeholder="FC" value={newZone[c.name]?.fee ?? ""} onChange={(e) => setNewZone((x) => ({ ...x, [c.name]: { name: x[c.name]?.name ?? "", fee: e.target.value } }))} />
                    <button className="btn-lux !px-3 !py-1" onClick={() => { const n = newZone[c.name]; if (!n?.name) return; upd(c.name, (zs) => [...zs, { id: uid(), name: n.name, fee: +n.fee || 0 }]); setNewZone((x) => ({ ...x, [c.name]: { name: "", fee: "" } })); }}>+</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{COMMUNES.length} communes de Kinshasa.</p>
    </div>
  );
}

function Finance() {
  const orders = useStore((s) => s.orders);
  const expenses = useStore((s) => s.expenses);
  const [f, setF] = useState({ label: "", amount: "" });
  const delivered = orders.filter((o) => o.status === "livrée");
  const pending = orders.filter((o) => !["livrée", "annulée"].includes(o.status));
  const revenue = delivered.reduce((a, o) => a + orderSubtotal(o), 0);
  const spent = expenses.reduce((a, e) => a + e.amount, 0);
  const fees = delivered.reduce((a, o) => a + o.fee, 0);
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        <Stat l="CA articles (livrées)" v={fmtUSD(revenue)} />
        <Stat l="En attente" v={fmtUSD(pending.reduce((a, o) => a + orderSubtotal(o), 0))} />
        <Stat l="Dépenses" v={fmtUSD(spent)} />
        <Stat l="Bénéfice net" v={fmtUSD(revenue - spent)} />
      </div>
      <Card><p className="text-sm">Frais de livraison encaissés par les livreurs : <b>{fmtCDF(fees)}</b> <span className="text-muted-foreground">(non comptabilisés)</span></p></Card>
      <Card className="space-y-3">
        <p className="eyebrow">Dépenses (USD)</p>
        <div className="flex gap-2">
          <input className="field" placeholder="Libellé" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
          <input type="number" className="field !w-32" placeholder="USD" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          <button className="btn-lux" onClick={() => { if (!f.label) return; setState((s) => ({ expenses: [{ id: uid(), label: f.label, amount: +f.amount || 0, date: new Date().toISOString().slice(0, 10) }, ...s.expenses] })); setF({ label: "", amount: "" }); }}>Ajouter</button>
        </div>
        {expenses.map((e) => (
          <div key={e.id} className="flex justify-between text-sm border-t pt-2"><span>{e.date} · {e.label}</span><span>{fmtUSD(e.amount)} <button className="text-destructive ml-3" onClick={() => setState((s) => ({ expenses: s.expenses.filter((x) => x.id !== e.id) }))}>×</button></span></div>
        ))}
      </Card>
    </div>
  );
}

function Journal() {
  const posts = useStore((s) => s.posts);
  const [f, setF] = useState({ title: "", excerpt: "" });
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <L t="Titre"><input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></L>
        <L t="Texte"><textarea className="field" rows={3} value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} /></L>
        <button className="btn-lux" onClick={() => { if (!f.title) return; setState((s) => ({ posts: [{ id: uid(), ...f, date: new Date().toISOString().slice(0, 10) }, ...s.posts] })); setF({ title: "", excerpt: "" }); }}>Publier</button>
      </Card>
      {posts.map((p) => (
        <Card key={p.id}><div className="flex justify-between"><p className="font-display text-2xl">{p.title}</p><button className="text-destructive text-sm" onClick={() => setState((s) => ({ posts: s.posts.filter((x) => x.id !== p.id) }))}>Supprimer</button></div><p className="text-sm text-muted-foreground">{p.excerpt}</p></Card>
      ))}
    </div>
  );
}

function StaffMgr() {
  const staff = useStore((s) => s.staff);
  const [f, setF] = useState<Staff>({ badge: "", password: "", name: "", role: "livreur", active: true, phone: "" });
  const upd = (badge: string, patch: Partial<Staff>) => setState((s) => ({ staff: s.staff.map((u) => (u.badge === badge ? { ...u, ...patch } : u)) }));
  return (
    <div className="space-y-6">
      <Card className="grid sm:grid-cols-5 gap-3 items-end">
        <L t="Nom"><input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></L>
        <L t="ID badge"><input className="field uppercase" value={f.badge} onChange={(e) => setF({ ...f, badge: e.target.value.toUpperCase() })} /></L>
        <L t="Mot de passe"><input className="field" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></L>
        <L t="Rôle"><select className="field" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}><option value="livreur">Livreur</option><option value="gerant">Gérant</option><option value="admin">Admin</option></select></L>
        <button className="btn-lux" onClick={() => {
          if (!f.name || !f.badge || !f.password) { toast.error("Champs requis"); return; }
          if (staff.some((u) => u.badge === f.badge)) { toast.error("Badge déjà utilisé"); return; }
          setState((s) => ({ staff: [...s.staff, f] })); setF({ ...f, badge: "", password: "", name: "" }); toast.success("Compte créé");
        }}>Créer le compte</button>
      </Card>
      <div className="border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr>{["Nom", "Badge", "Rôle", "Mot de passe", "Statut", ""].map((h) => <th key={h} className="text-left p-3">{h}</th>)}</tr></thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.badge} className="border-t">
                <td className="p-3">{u.name}</td><td className="p-3 font-mono">{u.badge}</td><td className="p-3 capitalize">{u.role}</td>
                <td className="p-3"><input className="field !py-1" value={u.password} onChange={(e) => upd(u.badge, { password: e.target.value })} /></td>
                <td className="p-3"><button onClick={() => upd(u.badge, { active: !u.active })} className={u.active ? "text-success" : "text-destructive"}>{u.active ? "Actif" : "Désactivé"}</button></td>
                <td className="p-3">{u.badge !== "ADM-001" && <button className="text-destructive" onClick={() => setState((s) => ({ staff: s.staff.filter((x) => x.badge !== u.badge) }))}>Supprimer</button>}</td>
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
  const set = (k: keyof typeof settings, v: string) => setState((s) => ({ settings: { ...s.settings, [k]: v } }));
  return (
    <Card className="space-y-4 max-w-2xl">
      <L t="Nom de la boutique"><input className="field" value={settings.storeName} onChange={(e) => set("storeName", e.target.value)} /></L>
      <L t="Numéro WhatsApp des commandes (format international, ex. 243810000000)"><input className="field" value={settings.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></L>
      <L t="Bandeau d'annonce"><input className="field" value={settings.announcement} onChange={(e) => set("announcement", e.target.value)} /></L>
      <L t="Titre du héro"><input className="field" value={settings.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} /></L>
      <L t="Sous-titre du héro"><textarea className="field" rows={2} value={settings.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} /></L>
      <p className="text-xs text-muted-foreground">Les modifications sont enregistrées automatiquement.</p>
    </Card>
  );
}
