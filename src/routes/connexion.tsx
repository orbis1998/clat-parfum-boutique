import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { getState, setState } from "@/lib/store";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Chez the sisters store" },
      {
        name: "description",
        content: "Boutique de parfums à Kinshasa. Découvrez notre sélection et commandez à partir de 5 pièces.",
      },
      { property: "og:title", content: "Chez the sisters store" },
      { property: "og:description", content: "Espace personnel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const [badge, setBadge] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = getState().staff.find(
      (s) => s.badge.toLowerCase() === badge.trim().toLowerCase() && s.password === pw,
    );
    if (!u) return setErr("Identifiants incorrects.");
    if (!u.active) return setErr("Compte désactivé.");
    setState(() => ({ session: u.badge }));
    nav({ to: u.role === "admin" ? "/admin" : u.role === "gerant" ? "/gerant" : "/livreur" });
  };

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-md px-5 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl text-center tracking-[0.4px] font-normal">Connexion</h1>
        <form onSubmit={submit} className="mt-10 space-y-5 border border-[#e5e5e5] p-6 sm:p-8">
          <label className="block space-y-1.5">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#727272]">Identifiant</span>
            <input required className="field uppercase" value={badge} onChange={(e) => setBadge(e.target.value)} autoComplete="username" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#727272]">Mot de passe</span>
            <input required type="password" className="field" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
          </label>
          {err ? <p className="text-sm text-destructive">{err}</p> : null}
          <button type="submit" className="btn-lux-dark w-full">
            Se connecter
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}
