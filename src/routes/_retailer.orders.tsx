import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/_retailer/orders")({
  head: () => ({
    meta: [
      { title: "My orders — HoleSaler" },
      { name: "description", content: "Your orders, payments and shipments." },
      { property: "og:title", content: "My orders — HoleSaler" },
      { property: "og:description", content: "Your orders, payments and shipments." },
    ],
  }),
  component: () => <PlaceholderPage title="My orders" description="Your orders, payments and shipments." />,
});
