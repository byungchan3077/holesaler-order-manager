import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/orders")({
  head: () => ({
    meta: [
      { title: "Orders — HoleSaler" },
      { name: "description", content: "All retailer orders with payment and refund flags." },
      { property: "og:title", content: "Orders — HoleSaler" },
      { property: "og:description", content: "All retailer orders with payment and refund flags." },
    ],
  }),
  component: () => <PlaceholderPage title="Orders" description="All retailer orders with payment and refund flags." />,
});
