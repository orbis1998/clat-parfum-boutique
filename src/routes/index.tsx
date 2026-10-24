import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SiteLayout } from "@/components/SiteLayout";
import { fmtUSD, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kinoir Parfums — Parfums de luxe à Kinshasa" },
      { name: "description", content: "Parfums de niche et grandes maisons livrés dans les 24 communes de Kinshasa. Commande via WhatsApp." },
      { property: "og:title", content: "Kinoir Parfums — Parfums de luxe à Kinshasa" },
      { property: "og:description", content: "Parfums de luxe livrés partout à Kinshasa, commande via WhatsApp." },
    ],
  }),
  component: Home,
});

function Hero() {
  const settings = useStore((s) => s.settings);
  const allProducts = useStore((s) => s.products);
  const products = allProducts.filter((p) => p.featured);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (products.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % products.length), 4500);
    return () => clearInterval(t);
  }, [products.length]);
  const p = products[i % Math.max(products.length, 1)];

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 grid md:grid-cols-2 gap-10 items-center min-h-[86vh] py-14">
        <div className="animate-rise">
          <p className="eyebrow text-gold">Collection 2026</p>
          <h1 className="mt-5 text-5xl md:text-7xl leading-[1.02]">{settings.heroTitle}</h1>
          <p className="mt-6 max-w-md opacity-75">{settings.heroSubtitle}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/articles" className="btn-lux !bg-gold !text-ink hover:!bg-primary-foreground">Découvrir</Link>
            {p && (
              <Link to="/articles/$id" params={{ id: p.id }} className="btn-ghost-lux">{p.name}</Link>
            )}
          </div>
          {p && (
            <div key={p.id} className="mt-14 animate-rise border-t border-primary-foreground/20 pt-6 flex items-end justify-between max-w-md">
              <div>
                <p className="eyebrow opacity-60 !text-[0.6rem]">{p.family} · {p.notes}</p>
                <p className="font-display text-3xl mt-1">{p.name}</p>
              </div>
              <p className="font-display text-3xl text-gold">{fmtUSD(Math.min(...p.variants.map((v) => v.price)))}</p>
            </div>
          )}
        </div>
        <div className="relative aspect-[4/5] w-full max-w-lg mx-auto">
          {p && (
            <div key={p.id} className="absolute inset-0 overflow-hidden animate-sweep shadow-lux">
              <img src={p.image} alt={p.name} width={800} height={1000} className="h-full w-full object-cover" />
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-card/40 blur-2xl animate-shine" />
            </div>
          )}
          <div className="absolute -bottom-5 left-0 right-0 flex justify-center gap-2">
            {products.map((x, k) => (
              <button key={x.id} onClick={() => setI(k)} aria-label={x.name} className={`h-[2px] transition-all ${k === i ? "w-10 bg-gold" : "w-5 bg-primary-foreground/30"}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 overflow-hidden py-4">
        <div className="flex w-max animate-marquee gap-12">
          {[...products, ...products, ...products, ...products].map((x, k) => (
            <span key={k} className="flex items-center gap-4 font-display text-2xl opacity-70 whitespace-nowrap">
              <img src={x.image} alt="" className="h-10 w-8 object-cover" /> {x.name} <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home() {
  const products = useStore((s) => s.products);
  const posts = useStore((s) => s.posts);
  return (
    <SiteLayout>
      <Hero />
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center mb-14">
          <p className="eyebrow text-gold">Sélection</p>
          <h2 className="text-5xl mt-3">Nos fragrances</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <div className="text-center mt-14"><Link to="/articles" className="btn-ghost-lux">Voir tous les articles</Link></div>
      </section>
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-20 grid md:grid-cols-3 gap-10 text-center">
          {[["Authenticité", "Flacons 100% originaux, sélectionnés à la source."], ["Livraison", "Dans les 24 communes de Kinshasa, au jour choisi."], ["WhatsApp", "Commandez et échangez directement avec notre équipe."]].map(([t, d]) => (
            <div key={t}><p className="font-display text-3xl">{t}</p><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </section>
      {posts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-24">
          <p className="eyebrow text-gold text-center">Journal</p>
          <h2 className="text-5xl mt-3 text-center mb-12">Le carnet olfactif</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="border-t pt-6">
                <p className="eyebrow text-muted-foreground !text-[0.6rem]">{post.date}</p>
                <h3 className="text-3xl mt-2">{post.title}</h3>
                <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
