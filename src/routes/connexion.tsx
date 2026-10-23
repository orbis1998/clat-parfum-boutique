import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { getState, setState } from "@/lib/store";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion personnel — Kinoir Parfums" },
      { name: "description", content: "Espace réservé au personnel : administrateur, gérant, livreur." },
      { property: "og:title", content: "Connexion personnel — Kinoir Parfums" },
      { property: "og:description", content: "Espace réservé au personnel." },
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
    const u = getState().staff.find((s) => s.badge.toLowerCase() === badge.trim().toLowerCase() && s.password === pw);
    if (!u) return setErr("Badge ou mot de passe incorrect.");
    if (!u.active) return setErr("Ce compte est désactivé.");
    setState(() => ({ session: u.badge }));
    nav({ to: u.role === "admin" ? "/admin" : u.role === "gerant" ? "/gerant" : "/livreur" });
  };
  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-5 py-24">
        <p className="eyebrow text-gold text-center">Espace personnel</p>
        <h1 className="text-5xl text-center mt-3">Connexion</h1>
        <form onSubmit={submit} className="mt-12 space-y-5 bg-card border p-8 shadow-lux">
          <label className="block space-y-1"><span className="eyebrow !text-[0.6rem]">ID (badge)</span><input required className="field uppercase" placeholder="ADM-001" value={badge} onChange={(e) => setBadge(e.target.value)} /></label>
          <label className="block space-y-1"><span className="eyebrow !text-[0.6rem]">Mot de passe</span><input required type="password" className="field" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button className="btn-lux w-full">Se connecter</button>
          <p className="text-xs text-center text-muted-foreground">Les comptes sont créés uniquement par l'administrateur.</p>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-6">Démo : ADM-001 / admin123 · GER-001 / gerant123 · LIV-001 / livreur123</p>
      </div>
    </SiteLayout>
  );
}
