import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administration — Kinoir Parfums" }, { name: "description", content: "Panneau d'administration." }, { property: "og:title", content: "Administration" }, { property: "og:description", content: "Panneau d'administration." }, { name: "robots", content: "noindex" }] }),
  component: () => <Dashboard role="admin" />,
});
