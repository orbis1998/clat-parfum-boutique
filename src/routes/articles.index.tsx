import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { SiteLayout } from "@/components/SiteLayout";
import { STORE_NAME, STORE_SEO_DESCRIPTION, useStore } from "@/lib/store";

type ArticlesSearch = { categorie?: string; q?: string };

export const Route = createFileRoute("/articles/")({
  validateSearch: (search: Record<string, unknown>): ArticlesSearch => ({
    categorie: typeof search.categorie === "string" ? search.categorie : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: STORE_NAME },
      { name: "description", content: STORE_SEO_DESCRIPTION },
      { property: "og:title", content: STORE_NAME },
      { property: "og:description", content: STORE_SEO_DESCRIPTION },
    ],
  }),
  component: Articles,
});

function Articles() {
  const { categorie, q } = Route.useSearch();
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);

  const activeCat = categories.find((c) => c.slug === categorie);
  const list = products.filter((p) => {
    const byCat = !activeCat
      ? true
      : p.categoryId === activeCat.id || p.family.toLowerCase() === activeCat.name.toLowerCase();
    const byQ = !q
      ? true
      : [p.name, p.brand, p.family, p.notes].join(" ").toLowerCase().includes(q.toLowerCase());
    return byCat && byQ;
  });

  return (
    <SiteLayout>
      <section className="container-page py-10 sm:py-16 md:py-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-[0.4px] font-normal">
          {activeCat?.name ?? (q ? q : "Articles")}
        </h1>

        <div className="flex gap-5 sm:gap-7 mt-8 mb-10 sm:mb-12 overflow-x-auto border-b border-[#e5e5e5] pb-3 -mx-5 px-5 sm:mx-0 sm:px-0 scrollbar-none">
          <LinkFilter active={!categorie} toSlug={undefined} label="Tous" />
          {categories
            .filter((c) => c.slug !== "journal")
            .map((c) => (
              <LinkFilter key={c.id} active={categorie === c.slug} toSlug={c.slug} label={c.name} />
            ))}
        </div>

        {list.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-[#727272] tracking-[0.4px]">Aucun article</p>
        )}
      </section>
    </SiteLayout>
  );
}

function LinkFilter({ active, toSlug, label }: { active: boolean; toSlug?: string; label: string }) {
  const navigate = Route.useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate({ search: toSlug ? { categorie: toSlug } : {} })}
      className={`shrink-0 text-[12px] sm:text-[13px] tracking-[0.4px] pb-1 border-b-2 transition-colors ${
        active ? "border-[#1a1a1a] text-[#1a1a1a]" : "border-transparent text-[#727272] hover:text-[#1a1a1a]"
      }`}
    >
      {label}
    </button>
  );
}
