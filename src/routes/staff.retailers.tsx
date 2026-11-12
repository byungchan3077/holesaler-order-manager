import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/retailers")({
  head: () => ({
    meta: [
      { title: "Retailers — HoleSaler" },
      { name: "description", content: "Approve registrations and manage retailer accounts." },
      { property: "og:title", content: "Retailers — HoleSaler" },
      { property: "og:description", content: "Approve registrations and manage retailer accounts." },
    ],
  }),
  component: () => <PlaceholderPage title="Retailers" description="Approve registrations and manage retailer accounts." />,
});
