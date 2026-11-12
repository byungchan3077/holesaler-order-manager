import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/payments")({
  head: () => ({
    meta: [
      { title: "Payments — HoleSaler" },
      { name: "description", content: "Confirm bank transfers and cancel mistaken entries." },
      { property: "og:title", content: "Payments — HoleSaler" },
      { property: "og:description", content: "Confirm bank transfers and cancel mistaken entries." },
    ],
  }),
  component: () => <PlaceholderPage title="Payments" description="Confirm bank transfers and cancel mistaken entries." />,
});
