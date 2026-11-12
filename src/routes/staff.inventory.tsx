import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — HoleSaler" },
      { name: "description", content: "Stock on hand, committed and orderable per product." },
      { property: "og:title", content: "Inventory — HoleSaler" },
      { property: "og:description", content: "Stock on hand, committed and orderable per product." },
    ],
  }),
  component: () => <PlaceholderPage title="Inventory" description="Stock on hand, committed and orderable per product." />,
});
