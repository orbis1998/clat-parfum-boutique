import { Link } from "@tanstack/react-router";
import { fmtUSD, type Product } from "@/lib/store";

export function ProductCard({ p }: { p: Product }) {
  const prices = p.variants.map((v) => v.price);
  const min = prices.length ? Math.min(...prices) : 0;
  const inStock = p.variants.some((v) => v.stock > 0);

  return (
    <Link to="/articles/$id" params={{ id: p.id }} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f8f8f8] mb-4">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          width={800}
          height={1067}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {!inStock ? (
          <span className="absolute bottom-4 left-4 right-4 text-center text-[10px] tracking-[0.18em] uppercase bg-white/90 py-2">
            Rupture
          </span>
        ) : null}
      </div>
      <div className="text-center space-y-1">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#727272]">{p.brand}</p>
        <h3 className="text-[15px] tracking-[0.4px]">{p.name}</h3>
        <p className="text-[13px] text-[#545454] tracking-[0.4px]">{fmtUSD(min)}</p>
      </div>
    </Link>
  );
}
