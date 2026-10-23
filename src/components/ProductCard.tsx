import { Link } from "@tanstack/react-router";
import { fmtUSD, type Product } from "@/lib/store";

export function ProductCard({ p }: { p: Product }) {
  const min = Math.min(...p.variants.map((v) => v.price));
  return (
    <Link to="/articles/$id" params={{ id: p.id }} className="group block">
      <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
        <img src={p.image} alt={p.name} loading="lazy" width={800} height={1000} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-card/30 blur-xl opacity-0 group-hover:opacity-100 group-hover:animate-shine" />
      </div>
      <div className="pt-4 text-center">
        <p className="eyebrow text-muted-foreground !text-[0.6rem]">{p.brand}</p>
        <h3 className="mt-1 text-2xl">{p.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">À partir de {fmtUSD(min)}</p>
      </div>
    </Link>
  );
}
