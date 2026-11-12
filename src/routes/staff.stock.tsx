import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/stock")({
  head: () => ({
    meta: [
      { title: "Stock adjustment — HoleSaler" },
      { name: "description", content: "Correct stock for loss, damage, miscounts and returns." },
      { property: "og:title", content: "Stock adjustment — HoleSaler" },
      { property: "og:description", content: "Correct stock for loss, damage, miscounts and returns." },
    ],
  }),
  component: () => <PlaceholderPage title="Stock adjustment" description="Correct stock for loss, damage, miscounts and returns." />,
});
