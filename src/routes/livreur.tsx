import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/livreur")({
  head: () => ({ meta: [{ title: "Espace livreur — Kinoir Parfums" }, { name: "description", content: "Espace livreur." }, { property: "og:title", content: "Espace livreur" }, { property: "og:description", content: "Espace livreur." }, { name: "robots", content: "noindex" }] }),
  component: () => <Dashboard role="livreur" />,
});
