import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/gerant")({
  head: () => ({ meta: [{ title: "Espace gérant — Kinoir Parfums" }, { name: "description", content: "Espace gérant." }, { property: "og:title", content: "Espace gérant" }, { property: "og:description", content: "Espace gérant." }, { name: "robots", content: "noindex" }] }),
  component: () => <Dashboard role="gerant" />,
});
