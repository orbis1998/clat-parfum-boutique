import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { addToCart, fmtUSD, useStore } from "@/lib/store";

export const Route = createFileRoute("/articles/$id")({
  head: () => ({
    meta: [
      { title: "Fragrance — Kinoir Parfums" },
      { name: "description", content: "Détails, notes olfactives et contenances disponibles." },
      { property: "og:title", content: "Fragrance — Kinoir Parfums" },
      { property: "og:description", content: "Détails, notes olfactives et contenances disponibles." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const p = useStore((s) => s.products.find((x) => x.id === id));
  const [vid, setVid] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const nav = useNavigate();
  if (!p)
    return (
      <SiteLayout>
        <div className="py-32 text-center"><h1 className="text-4xl">Article introuvable</h1><Link to="/articles" className="btn-lux mt-8">Retour</Link></div>
      </SiteLayout>
    );
  const v = p.variants.find((x) => x.id === vid) ?? p.variants[0];
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 py-14 grid md:grid-cols-2 gap-14">
        <div className="bg-secondary aspect-[4/5] overflow-hidden animate-sweep">
          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
        </div>
        <div className="md:py-10">
          <p className="eyebrow text-gold">{p.brand} · {p.family}</p>
          <h1 className="text-6xl mt-3">{p.name}</h1>
          <p className="font-display text-4xl mt-4">{v ? fmtUSD(v.price) : "—"}</p>
          <p className="mt-6 text-muted-foreground leading-relaxed">{p.description}</p>
          <p className="mt-4 text-sm"><span className="eyebrow !text-[0.6rem] text-muted-foreground mr-2">Notes</span>{p.notes}</p>
          <p className="eyebrow mt-10 mb-3">Contenance</p>
          <div className="flex flex-wrap gap-3">
            {p.variants.map((x) => (
              <button key={x.id} onClick={() => setVid(x.id)} disabled={x.stock <= 0} className={`px-5 py-3 border text-sm disabled:opacity-40 ${x.id === v?.id ? "border-foreground bg-foreground text-background" : "hover:border-foreground"}`}>
                {x.label}
              </button>
            ))}
          </div>
          {v && <p className="text-xs text-muted-foreground mt-3">{v.stock > 0 ? `${v.stock} en stock` : "Rupture de stock"}</p>}
          <div className="flex gap-3 mt-8">
            <div className="flex border">
              <button className="px-4" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="px-4 py-3 min-w-10 text-center">{qty}</span>
              <button className="px-4" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="btn-lux flex-1" disabled={!v || v.stock <= 0} onClick={() => { addToCart(p.id, v!.id, qty); toast.success("Ajouté au panier"); }}>Ajouter au panier</button>
          </div>
          <button className="btn-ghost-lux w-full mt-3" disabled={!v || v.stock <= 0} onClick={() => { addToCart(p.id, v!.id, qty); nav({ to: "/panier" }); }}>Commander maintenant</button>
        </div>
      </section>
    </SiteLayout>
  );
}
