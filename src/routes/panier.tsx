import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { MIN_ORDER_QTY, STORE_NAME, fmtCDF, fmtUSD, setState, uid, useStore, type Order } from "@/lib/store";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Chez the sisters store" },
      {
        name: "description",
        content: "Boutique de parfums à Kinshasa. Découvrez notre sélection et commandez à partir de 5 pièces.",
      },
      { property: "og:title", content: "Chez the sisters store" },
      {
        property: "og:description",
        content: "Boutique de parfums à Kinshasa. Découvrez notre sélection et commandez à partir de 5 pièces.",
      },
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
  const totalQty = lines.reduce((a, l) => a + l.c.qty, 0);
  const canOrder = totalQty >= MIN_ORDER_QTY;
  const commune = communes.find((c) => c.name === f.commune);
  const zone = commune?.zones.find((z) => z.id === f.zone) ?? (commune?.zones.length === 1 ? commune.zones[0] : undefined);
  const day = f.date ? DAYS[new Date(f.date + "T12:00").getDay()] : "";
  const today = new Date().toISOString().slice(0, 10);

  const updateQty = (i: number, q: number) =>
    setState((s) => ({ cart: q <= 0 ? s.cart.filter((_, k) => k !== i) : s.cart.map((c, k) => (k === i ? { ...c, qty: q } : c)) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canOrder) {
      toast.error(`Minimum ${MIN_ORDER_QTY} pièces`);
      return;
    }
    if (!lines.length || !commune || !zone) {
      toast.error("Choisissez votre commune et zone");
      return;
    }
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
      `*Nouvelle commande ${order.id}* — ${STORE_NAME}`,
      "",
      ...order.items.map((i) => `• ${i.name} (${i.variant}) × ${i.qty} = ${fmtUSD(i.price * i.qty)}`),
      "",
      `*Sous-total articles : ${fmtUSD(subtotal)}*`,
      `Frais de livraison : ${fmtCDF(zone.fee)}`,
      "",
      `Nom : ${f.name}`,
      `Téléphone : ${f.phone}`,
      `Commune : ${commune.name} — ${zone.name}`,
      `Adresse : ${f.address}`,
      `Livraison : ${day} ${f.date}`,
      f.instructions ? `Instructions : ${f.instructions}` : "",
    ]
      .filter((x) => x !== null)
      .join("\n");
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
    window.open(`https://wa.me/${String(settings.whatsapp ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Commande envoyée");
  };

  if (!lines.length)
    return (
      <SiteLayout>
        <div className="px-5 py-20 sm:py-28 text-center">
          <h1 className="text-3xl sm:text-4xl tracking-[0.4px] font-normal">Panier vide</h1>
          <Link to="/articles" className="btn-lux-dark mt-8 inline-flex">
            Continuer
          </Link>
        </div>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <form onSubmit={submit} className="container-page py-10 sm:py-14 md:py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14">
        <div>
          <h1 className="text-3xl sm:text-4xl tracking-[0.4px] font-normal">Commande</h1>
          <div className="mt-6 sm:mt-8 divide-y border-y border-[#e5e5e5]">
            {lines.map((l, i) => (
              <div key={i} className="flex gap-3 sm:gap-5 py-4 sm:py-5">
                <img src={l.p.image} alt={l.p.name} className="w-20 h-24 sm:w-24 sm:h-28 object-cover bg-[#f8f8f8] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">{l.p.brand}</p>
                  <p className="text-lg sm:text-xl tracking-[0.4px] truncate">{l.p.name}</p>
                  <p className="text-sm text-[#727272] mt-0.5">
                    {l.v.label} · {fmtUSD(l.v.price)}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex border border-[#e5e5e5] text-sm">
                      <button type="button" className="px-3 min-h-9" onClick={() => updateQty(i, l.c.qty - 1)}>
                        −
                      </button>
                      <span className="px-3 py-1.5 min-w-8 text-center">{l.c.qty}</span>
                      <button type="button" className="px-3 min-h-9" onClick={() => updateQty(i, l.c.qty + 1)}>
                        +
                      </button>
                    </div>
                    <button type="button" onClick={() => updateQty(i, 0)} className="text-[#929292] hover:text-destructive" aria-label="Retirer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-base sm:text-xl tracking-[0.4px] shrink-0">{fmtUSD(l.v.price * l.c.qty)}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl sm:text-2xl tracking-[0.4px] font-normal mt-10 sm:mt-12 mb-5">Livraison</h2>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <label className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">Nom</span>
              <input required className="field" value={f.name} onChange={(e) => set("name", e.target.value)} />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">Téléphone</span>
              <input required className="field" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">Commune</span>
              <select required className="field" value={f.commune} onChange={(e) => set("commune", e.target.value)}>
                <option value="">Choisir</option>
                {communes.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">Zone</span>
              <select required className="field" value={zone?.id ?? ""} onChange={(e) => set("zone", e.target.value)} disabled={!commune}>
                <option value="">Choisir</option>
                {commune?.zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} — {fmtCDF(z.fee)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">Adresse</span>
              <input required className="field" value={f.address} onChange={(e) => set("address", e.target.value)} />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">Date</span>
              <input required type="date" min={today} className="field" value={f.date} onChange={(e) => set("date", e.target.value)} />
            </label>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">Jour</span>
              <div className="field capitalize text-[#727272]">{day || "—"}</div>
            </div>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#727272]">Note</span>
              <textarea rows={3} className="field" value={f.instructions} onChange={(e) => set("instructions", e.target.value)} />
            </label>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit border border-[#e5e5e5] p-5 sm:p-7 bg-white">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272]">Total</p>
          <div className="mt-5 space-y-2.5 text-sm tracking-[0.4px]">
            {lines.map((l, i) => (
              <div key={i} className="flex justify-between gap-3">
                <span className="truncate">
                  {l.p.name} × {l.c.qty}
                </span>
                <span className="shrink-0">{fmtUSD(l.v.price * l.c.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#e5e5e5] mt-5 pt-5 flex justify-between items-baseline">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#727272]">Articles</span>
            <span className="text-2xl sm:text-3xl tracking-[0.4px]">{fmtUSD(subtotal)}</span>
          </div>
          <div className="mt-4 flex justify-between text-sm tracking-[0.4px]">
            <span className="text-[#727272]">Livraison</span>
            <span>{zone ? fmtCDF(zone.fee) : "—"}</span>
          </div>
          {canOrder ? (
            <button type="submit" className="btn-lux-dark w-full mt-6">
              WhatsApp
            </button>
          ) : (
            <p className="mt-6 text-xs text-center text-[#727272] tracking-[0.4px]">
              Minimum {MIN_ORDER_QTY} pièces pour commander
            </p>
          )}
        </aside>
      </form>
    </SiteLayout>
  );
}
