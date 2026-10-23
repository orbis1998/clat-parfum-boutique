import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SiteLayout } from "@/components/SiteLayout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "Articles — Kinoir Parfums" },
      { name: "description", content: "Toute notre collection de parfums : oud, floraux, boisés, ambrés." },
      { property: "og:title", content: "Articles — Kinoir Parfums" },
      { property: "og:description", content: "Toute notre collection de parfums de luxe." },
    ],
  }),
  component: Articles,
});

function Articles() {
  const products = useStore((s) => s.products);
  const families = ["Tous", ...Array.from(new Set(products.map((p) => p.family)))];
  const [f, setF] = useState("Tous");
  const list = f === "Tous" ? products : products.filter((p) => p.family === f);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="text-center">
          <p className="eyebrow text-gold">La collection</p>
          <h1 className="text-6xl mt-3">Articles</h1>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-10 mb-14">
          {families.map((x) => (
            <button key={x} onClick={() => setF(x)} className={`eyebrow pb-1 border-b ${f === x ? "border-gold text-foreground" : "border-transparent text-muted-foreground"}`}>{x}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </SiteLayout>
  );
}
