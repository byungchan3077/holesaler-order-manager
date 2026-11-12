import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/summary")({
  head: () => ({
    meta: [
      { title: "Summary — HoleSaler" },
      { name: "description", content: "Order, payment and shipment totals by period." },
      { property: "og:title", content: "Summary — HoleSaler" },
      { property: "og:description", content: "Order, payment and shipment totals by period." },
    ],
  }),
  component: () => <PlaceholderPage title="Summary" description="Order, payment and shipment totals by period." />,
});
