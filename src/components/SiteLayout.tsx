import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { STORE_NAME, useStore } from "@/lib/store";

export function SiteLayout({ children }: { children: ReactNode; floatingWhatsApp?: boolean }) {
  const settings = useStore((s) => s.settings);
  const categories = useStore((s) => s.categories);
  const count = useStore((s) => s.cart.reduce((a, c) => a + c.qty, 0));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navCats = categories.filter((c) => c.slug !== "journal");
  const brand = STORE_NAME;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1a1a1a]">
      {settings.announcement ? (
        <div className="bg-[#1a1a1a] text-white text-center text-[10px] sm:text-[11px] tracking-[0.14em] uppercase py-2 px-3">
          {settings.announcement}
        </div>
      ) : null}

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e5e5e5]">
        <div className="container-page grid grid-cols-3 items-center h-14 sm:h-16 md:h-[4.5rem]">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Ouvrir le menu"
              className="p-2 -ml-2 hover:opacity-60 transition-opacity"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="w-5 h-5" strokeWidth={1.25} />
            </button>
          </div>

          <Link to="/" className="lv-wordmark text-center justify-self-center text-[0.72rem] sm:text-[0.9rem] md:text-[1.05rem] hover:opacity-70 transition-opacity">
            {brand}
          </Link>

          <div className="flex justify-end items-center gap-0.5 sm:gap-1">
            <Link to="/panier" aria-label="Panier" className="relative p-2 hover:opacity-60">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.25} />
              {count > 0 ? (
                <span className="absolute top-0.5 right-0.5 bg-[#1a1a1a] text-white text-[9px] h-4 min-w-4 px-1 grid place-items-center rounded-full">
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-[60] transition ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!menuOpen}>
        <button
          type="button"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          aria-label="Fermer"
          onClick={() => setMenuOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[min(100vw,20rem)] sm:w-[24rem] bg-white transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-end px-5 h-14 border-b border-[#e5e5e5]">
            <button type="button" aria-label="Fermer" className="p-2 hover:opacity-60" onClick={() => setMenuOpen(false)}>
              <X className="w-5 h-5" strokeWidth={1.25} />
            </button>
          </div>
          <nav className="px-6 py-6 overflow-y-auto h-[calc(100%-3.5rem)] flex flex-col">
            <ul className="flex-1">
              <li>
                <Link to="/" className="block py-3.5 text-[15px] tracking-[0.4px] border-b border-[#f0f0f0]" onClick={() => setMenuOpen(false)}>
                  Accueil
                </Link>
              </li>
              {navCats.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/articles"
                    search={{ categorie: c.slug } as { categorie: string }}
                    className="block py-3.5 text-[15px] tracking-[0.4px] border-b border-[#f0f0f0]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/articles" className="block py-3.5 text-[15px] tracking-[0.4px] border-b border-[#f0f0f0]" onClick={() => setMenuOpen(false)}>
                  Tous les articles
                </Link>
              </li>
            </ul>
            <Link
              to="/connexion"
              className="mt-8 block py-3.5 text-[15px] tracking-[0.4px] border-t border-[#e5e5e5] text-[#727272] hover:text-[#1a1a1a]"
              onClick={() => setMenuOpen(false)}
            >
              Connexion
            </Link>
          </nav>
        </aside>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="mt-10 sm:mt-14 bg-[#19110b] text-white">
        <div className="container-page py-7 sm:py-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-12 items-start">
          <div className="lg:col-span-6">
            <p className="lv-wordmark text-[0.7rem] sm:text-[0.8rem] text-white">{brand}</p>
          </div>
          <div className="lg:col-span-6 flex flex-wrap gap-x-6 gap-y-2 text-sm tracking-[0.4px]">
            <Link to="/articles" className="text-white/75 hover:text-white">
              Articles
            </Link>
            <Link to="/panier" className="text-white/75 hover:text-white">
              Panier
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="container-page py-3.5 text-[10px] text-white/40 tracking-[0.14em] uppercase">
            © {new Date().getFullYear()} {brand}
          </p>
        </div>
      </footer>
    </div>
  );
}
