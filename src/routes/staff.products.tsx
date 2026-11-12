import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/products")({
  head: () => ({
    meta: [
      { title: "Products — HoleSaler" },
      { name: "description", content: "Create, edit and activate products." },
      { property: "og:title", content: "Products — HoleSaler" },
      { property: "og:description", content: "Create, edit and activate products." },
    ],
  }),
  component: () => <PlaceholderPage title="Products" description="Create, edit and activate products." />,
});
