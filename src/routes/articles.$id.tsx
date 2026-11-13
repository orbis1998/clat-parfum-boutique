import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { MIN_ORDER_QTY, addToCart, fmtUSD, useStore } from "@/lib/store";

export const Route = createFileRoute("/articles/$id")({
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
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const p = useStore((s) => s.products.find((x) => x.id === id));
  const [vid, setVid] = useState<string | null>(null);
  const [qty, setQty] = useState(MIN_ORDER_QTY);
  const nav = useNavigate();
  if (!p)
    return (
      <SiteLayout>
        <div className="px-5 py-20 sm:py-28 text-center">
          <h1 className="text-3xl tracking-[0.4px]">Article introuvable</h1>
          <Link to="/articles" className="btn-lux-dark mt-8 inline-flex">
            Retour
          </Link>
        </div>
      </SiteLayout>
    );
  const v = p.variants.find((x) => x.id === vid) ?? p.variants[0];
  return (
    <SiteLayout>
      <section className="container-page py-8 sm:py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-14">
        <div className="bg-[#f8f8f8] aspect-[3/4] overflow-hidden">
          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
        </div>
        <div className="md:py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272]">
            {p.brand} · {p.family}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl mt-2 tracking-[0.4px] font-normal">{p.name}</h1>
          <p className="text-xl sm:text-2xl mt-4 tracking-[0.4px]">{v ? fmtUSD(v.price) : "—"}</p>
          <p className="mt-5 text-sm text-[#545454] leading-relaxed tracking-[0.4px] max-w-md">{p.description}</p>
          <p className="mt-4 text-sm tracking-[0.4px] text-[#727272]">{p.notes}</p>

          <p className="text-[11px] uppercase tracking-[0.16em] mt-8 mb-3">Contenance</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {p.variants.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setVid(x.id)}
                disabled={x.stock <= 0}
                className={`min-h-11 px-4 sm:px-5 rounded-full border text-[11px] sm:text-[12px] uppercase tracking-[0.14em] disabled:opacity-40 transition-colors ${
                  x.id === v?.id ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-[#1a1a1a] hover:bg-[#f8f8f8]"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 sm:gap-3 mt-8">
            <div className="flex border border-[#1a1a1a]">
              <button type="button" className="px-3 sm:px-4 min-h-12" onClick={() => setQty(Math.max(1, qty - 1))}>
                −
              </button>
              <span className="px-3 sm:px-4 py-3 min-w-10 text-center tracking-[0.4px]">{qty}</span>
              <button type="button" className="px-3 sm:px-4 min-h-12" onClick={() => setQty(qty + 1)}>
                +
              </button>
            </div>
            <button
              type="button"
              className="btn-lux-dark flex-1"
              disabled={!v || v.stock <= 0}
              onClick={() => {
                addToCart(p.id, v!.id, qty);
                toast.success("Ajouté");
              }}
            >
              Ajouter
            </button>
          </div>
          {qty >= MIN_ORDER_QTY ? (
            <button
              type="button"
              className="btn-ghost-lux w-full mt-3"
              disabled={!v || v.stock <= 0}
              onClick={() => {
                addToCart(p.id, v!.id, qty);
                nav({ to: "/panier" });
              }}
            >
              Commander
            </button>
          ) : (
            <p className="mt-3 text-xs text-[#727272] tracking-[0.4px]">Commande à partir de {MIN_ORDER_QTY} pièces</p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
