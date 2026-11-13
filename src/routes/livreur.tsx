import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/livreur")({
  head: () => ({ meta: [{ title: "Chez the sisters store" }, { name: "description", content: "Espace livreur." }, { property: "og:title", content: "Chez the sisters store" }, { name: "robots", content: "noindex" }] }),
  component: () => <Dashboard role="livreur" />,
});
