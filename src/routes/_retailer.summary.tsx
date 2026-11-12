import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/_retailer/summary")({
  head: () => ({
    meta: [
      { title: "Summary — HoleSaler" },
      { name: "description", content: "Your order and payment totals by period." },
      { property: "og:title", content: "Summary — HoleSaler" },
      { property: "og:description", content: "Your order and payment totals by period." },
    ],
  }),
  component: () => <PlaceholderPage title="Summary" description="Your order and payment totals by period." />,
});
