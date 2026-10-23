import { Link } from "@tanstack/react-router";
import { ShoppingBag, User } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

export function SiteLayout({ children }: { children: ReactNode }) {
  const settings = useStore((s) => s.settings);
  const count = useStore((s) => s.cart.reduce((a, c) => a + c.qty, 0));
  const nav = "eyebrow text-muted-foreground hover:text-foreground transition-colors";
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-primary text-primary-foreground text-center eyebrow py-2 px-4 !text-[0.62rem]">
        {settings.announcement}
      </div>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-5 h-16 grid grid-cols-3 items-center">
          <nav className="flex gap-6">
            <Link to="/" className={nav} activeOptions={{ exact: true }} activeProps={{ className: "!text-foreground" }}>Accueil</Link>
            <Link to="/articles" className={nav} activeProps={{ className: "!text-foreground" }}>Articles</Link>
          </nav>
          <Link to="/" className="text-center font-display text-2xl md:text-3xl tracking-wide">
            {settings.storeName}
          </Link>
          <div className="flex justify-end items-center gap-5">
            <Link to="/connexion" aria-label="Connexion" className="hover:text-gold"><User size={19} /></Link>
            <Link to="/panier" aria-label="Panier" className="relative hover:text-gold">
              <ShoppingBag size={19} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-ink text-[10px] font-bold rounded-full h-4 min-w-4 px-1 grid place-items-center">{count}</span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-primary text-primary-foreground mt-24">
        <div className="mx-auto max-w-7xl px-5 py-14 grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl">{settings.storeName}</p>
            <p className="mt-3 text-sm opacity-70 max-w-xs">{settings.heroSubtitle}</p>
          </div>
          <div className="text-sm space-y-2 opacity-80">
            <p className="eyebrow text-gold">Boutique</p>
            <Link to="/articles" className="block">Tous les articles</Link>
            <Link to="/panier" className="block">Panier</Link>
          </div>
          <div className="text-sm space-y-2 opacity-80">
            <p className="eyebrow text-gold">Contact</p>
            <p>WhatsApp : +{settings.whatsapp}</p>
            <p>Kinshasa, RD Congo</p>
          </div>
        </div>
        <p className="text-center text-xs opacity-50 pb-6">© 2026 {settings.storeName}</p>
      </footer>
    </div>
  );
}
