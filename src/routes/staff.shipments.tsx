import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/shipments")({
  head: () => ({
    meta: [
      { title: "Shipments — HoleSaler" },
      { name: "description", content: "Ship paid orders and record tracking references." },
      { property: "og:title", content: "Shipments — HoleSaler" },
      { property: "og:description", content: "Ship paid orders and record tracking references." },
    ],
  }),
  component: () => <PlaceholderPage title="Shipments" description="Ship paid orders and record tracking references." />,
});
