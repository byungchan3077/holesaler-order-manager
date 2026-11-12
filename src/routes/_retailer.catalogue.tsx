import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/_retailer/catalogue")({
  head: () => ({
    meta: [
      { title: "Catalogue — HoleSaler" },
      { name: "description", content: "Browse products and order by the box." },
      { property: "og:title", content: "Catalogue — HoleSaler" },
      { property: "og:description", content: "Browse products and order by the box." },
    ],
  }),
  component: () => <PlaceholderPage title="Catalogue" description="Browse products and order by the box." />,
});
