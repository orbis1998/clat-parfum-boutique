import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SiteLayout } from "@/components/SiteLayout";
import { STORE_NAME, STORE_SEO_DESCRIPTION, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: STORE_NAME },
      { name: "description", content: STORE_SEO_DESCRIPTION },
      { property: "og:title", content: STORE_NAME },
      { property: "og:description", content: STORE_SEO_DESCRIPTION },
    ],
  }),
  component: Home,
});

function Hero() {
  const settings = useStore((s) => s.settings);
  const products = useStore((s) => s.products);
  const slides = useMemo(() => {
    const fromSettings = (settings.heroImages ?? []).filter(Boolean);
    if (fromSettings.length) return fromSettings;
    return products.filter((p) => p.featured && p.image).map((p) => p.image);
  }, [settings.heroImages, products]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  const safe = Math.max(slides.length, 1);

  return (
    <section className="relative min-h-[78vh] sm:min-h-[86vh] flex items-end overflow-hidden bg-[#19110b] text-white">
      <div className="absolute inset-0" aria-hidden="true">
        {slides.map((src, k) => (
          <img
            key={`${src}-${k}`}
            src={src}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${k === i % safe ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/15" />
      </div>

      <div className="relative z-10 container-page w-full pb-12 pt-28 sm:pb-16 sm:pt-32 animate-rise">
        <h1 className="max-w-3xl text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl tracking-[0.4px] font-normal">
          {settings.heroTitle}
        </h1>
        <p className="mt-4 sm:mt-5 max-w-md text-sm text-white/80 tracking-[0.4px] leading-relaxed">
          {settings.heroSubtitle}
        </p>
        <div className="mt-8 sm:mt-10">
          <Link
            to="/articles"
            className="inline-flex items-center justify-center min-h-11 sm:min-h-12 px-6 sm:px-7 rounded-full border border-white/80 bg-white/15 text-[11px] sm:text-[12px] uppercase tracking-[0.16em] backdrop-blur-md hover:bg-white hover:text-[#1a1a1a] transition-colors"
          >
            Découvrir
          </Link>
        </div>
        {slides.length > 1 ? (
          <div className="mt-10 sm:mt-12 flex gap-2">
            {slides.map((src, k) => (
              <button
                key={`${src}-dot-${k}`}
                type="button"
                aria-label={`Image ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-[2px] transition-all ${k === i % slides.length ? "w-8 sm:w-10 bg-white" : "w-4 sm:w-5 bg-white/35"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Home() {
  const products = useStore((s) => s.products);

  return (
    <SiteLayout>
      <Hero />

      <section className="container-page py-14 sm:py-20 md:py-24">
        <div className="flex items-end justify-between gap-4 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl tracking-[0.4px] font-normal">Sélection</h2>
          <Link to="/articles" className="text-[11px] sm:text-[12px] uppercase tracking-[0.16em] hover:opacity-55">
            Tout voir
          </Link>
        </div>
        {products.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-[#727272] tracking-[0.4px]">Catalogue en cours de mise à jour</div>
        )}
      </section>

      <section className="bg-[#f8f8f8]">
        <div className="container-page py-14 sm:py-20 md:py-24 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-[0.4px] leading-tight font-normal">
            Des parfums choisis avec soin.
          </h2>
          <p className="mt-5 text-sm text-[#545454] leading-relaxed tracking-[0.4px] max-w-md">
            Commandez à partir de 5 pièces et faites-vous livrer à Kinshasa.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
