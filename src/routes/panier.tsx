import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { fmtCDF, fmtUSD, setState, uid, useStore, type Order } from "@/lib/store";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Panier — Kinoir Parfums" },
      { name: "description", content: "Finalisez votre commande et envoyez-la via WhatsApp." },
      { property: "og:title", content: "Panier — Kinoir Parfums" },
      { property: "og:description", content: "Finalisez votre commande via WhatsApp." },
    ],
  }),
  component: Cart,
});

const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function Cart() {
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const communes = useStore((s) => s.communes);
  const settings = useStore((s) => s.settings);
  const [f, setF] = useState({ name: "", phone: "", address: "", instructions: "", commune: "", zone: "", date: "" });
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v, ...(k === "commune" ? { zone: "" } : {}) }));

  const lines = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.productId);
      const v = p?.variants.find((x) => x.id === c.variantId);
      return p && v ? { c, p, v } : null;
    })
    .filter(Boolean) as { c: (typeof cart)[number]; p: (typeof products)[number]; v: (typeof products)[number]["variants"][number] }[];
  const subtotal = lines.reduce((a, l) => a + l.v.price * l.c.qty, 0);
  const commune = communes.find((c) => c.name === f.commune);
  const zone = commune?.zones.find((z) => z.id === f.zone) ?? (commune?.zones.length === 1 ? commune.zones[0] : undefined);
  const day = f.date ? DAYS[new Date(f.date + "T12:00").getDay()] : "";
  const today = new Date().toISOString().slice(0, 10);

  const updateQty = (i: number, q: number) =>
    setState((s) => ({ cart: q <= 0 ? s.cart.filter((_, k) => k !== i) : s.cart.map((c, k) => (k === i ? { ...c, qty: q } : c)) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lines.length || !commune || !zone) { toast.error("Choisissez votre commune et zone"); return; }
    const order: Order = {
      id: "CMD-" + uid().toUpperCase().slice(0, 5),
      createdAt: new Date().toISOString(),
      items: lines.map((l) => ({ name: l.p.name, variant: l.v.label, price: l.v.price, qty: l.c.qty })),
      customer: { name: f.name, phone: f.phone, address: f.address, instructions: f.instructions },
      commune: commune.name,
      zone: zone.name,
      fee: zone.fee,
      deliveryDate: f.date,
      status: "nouvelle",
    };
    const msg = [
      `*Nouvelle commande ${order.id}* — ${settings.storeName}`,
      "",
      ...order.items.map((i) => `• ${i.name} (${i.variant}) × ${i.qty} = ${fmtUSD(i.price * i.qty)}`),
      "",
      `*Sous-total articles : ${fmtUSD(subtotal)}*`,
      `Frais de livraison : ${fmtCDF(zone.fee)} (à payer à la livraison)`,
      "",
      `Nom : ${f.name}`,
      `Téléphone : ${f.phone}`,
      `Commune : ${commune.name} — ${zone.name}`,
      `Adresse : ${f.address}`,
      `Livraison : ${day} ${f.date}`,
      f.instructions ? `Instructions : ${f.instructions}` : "",
    ].filter((x) => x !== null).join("\n");
    setState((s) => ({
      orders: [order, ...s.orders],
      cart: [],
      products: s.products.map((p) => ({
        ...p,
        variants: p.variants.map((v) => {
          const l = lines.find((x) => x.v.id === v.id);
          return l ? { ...v, stock: Math.max(0, v.stock - l.c.qty) } : v;
        }),
      })),
    }));
    window.open(`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Commande envoyée sur WhatsApp");
  };

  if (!lines.length)
    return (
      <SiteLayout>
        <div className="py-32 text-center">
          <p className="eyebrow text-gold">Panier</p>
          <h1 className="text-5xl mt-3">Votre panier est vide</h1>
          <Link to="/articles" className="btn-lux mt-10">Découvrir les articles</Link>
        </div>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <form onSubmit={submit} className="mx-auto max-w-7xl px-5 py-14 grid lg:grid-cols-[1.2fr_1fr] gap-12">
        <div>
          <h1 className="text-5xl">Votre commande</h1>
          <div className="mt-8 divide-y border-y">
            {lines.map((l, i) => (
              <div key={i} className="flex gap-5 py-5">
                <img src={l.p.image} alt={l.p.name} className="w-24 h-28 object-cover bg-secondary" />
                <div className="flex-1">
                  <p className="eyebrow text-muted-foreground !text-[0.6rem]">{l.p.brand}</p>
                  <p className="font-display text-2xl">{l.p.name}</p>
                  <p className="text-sm text-muted-foreground">{l.v.label} · {l.p.notes}</p>
                  <p className="text-sm">{fmtUSD(l.v.price)} / unité</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex border text-sm">
                      <button type="button" className="px-3" onClick={() => updateQty(i, l.c.qty - 1)}>−</button>
                      <span className="px-3 py-1">{l.c.qty}</span>
                      <button type="button" className="px-3" onClick={() => updateQty(i, l.c.qty + 1)}>+</button>
                    </div>
                    <button type="button" onClick={() => updateQty(i, 0)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="font-display text-2xl">{fmtUSD(l.v.price * l.c.qty)}</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl mt-12 mb-6">Informations de livraison</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1"><span className="eyebrow !text-[0.6rem]">Nom complet</span><input required className="field" value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
            <label className="space-y-1"><span className="eyebrow !text-[0.6rem]">Téléphone</span><input required className="field" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></label>
            <label className="space-y-1"><span className="eyebrow !text-[0.6rem]">Commune</span>
              <select required className="field" value={f.commune} onChange={(e) => set("commune", e.target.value)}>
                <option value="">Choisir une commune</option>
                {communes.map((c) => <option key={c.name}>{c.name}</option>)}
              </select>
            </label>
            <label className="space-y-1"><span className="eyebrow !text-[0.6rem]">Zone / quartier</span>
              <select required className="field" value={zone?.id ?? ""} onChange={(e) => set("zone", e.target.value)} disabled={!commune}>
                <option value="">Choisir une zone</option>
                {commune?.zones.map((z) => <option key={z.id} value={z.id}>{z.name} — {fmtCDF(z.fee)}</option>)}
              </select>
            </label>
            <label className="space-y-1 sm:col-span-2"><span className="eyebrow !text-[0.6rem]">Adresse complète</span><input required className="field" placeholder="Avenue, numéro, référence" value={f.address} onChange={(e) => set("address", e.target.value)} /></label>
            <label className="space-y-1"><span className="eyebrow !text-[0.6rem]">Date de livraison</span><input required type="date" min={today} className="field" value={f.date} onChange={(e) => set("date", e.target.value)} /></label>
            <div className="space-y-1"><span className="eyebrow !text-[0.6rem]">Jour</span><div className="field capitalize text-muted-foreground">{day || "—"}</div></div>
            <label className="space-y-1 sm:col-span-2"><span className="eyebrow !text-[0.6rem]">Instructions</span><textarea rows={3} className="field" value={f.instructions} onChange={(e) => set("instructions", e.target.value)} /></label>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit bg-card border p-8 shadow-lux">
          <p className="eyebrow text-gold">Récapitulatif</p>
          <div className="mt-6 space-y-3 text-sm">
            {lines.map((l, i) => (
              <div key={i} className="flex justify-between"><span>{l.p.name} ({l.v.label}) × {l.c.qty}</span><span>{fmtUSD(l.v.price * l.c.qty)}</span></div>
            ))}
          </div>
          <div className="border-t mt-6 pt-5 flex justify-between items-baseline">
            <span className="eyebrow">Total articles</span>
            <span className="font-display text-4xl">{fmtUSD(subtotal)}</span>
          </div>
          <div className="mt-4 bg-secondary p-4 text-sm">
            <div className="flex justify-between">
              <span>Livraison {commune ? `· ${commune.name}` : ""}</span>
              <span className="font-semibold">{zone ? fmtCDF(zone.fee) : "Choisir la commune"}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Les frais de livraison (en FC) ne sont pas inclus dans le total et se paient au livreur.</p>
          </div>
          <button className="btn-lux w-full mt-6">Commander via WhatsApp</button>
          <p className="text-xs text-muted-foreground text-center mt-3">Aucun paiement en ligne. Votre commande est confirmée par WhatsApp.</p>
        </aside>
      </form>
    </SiteLayout>
  );
}
