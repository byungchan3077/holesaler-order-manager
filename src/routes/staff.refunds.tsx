import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/refunds")({
  head: () => ({
    meta: [
      { title: "Refunds — HoleSaler" },
      { name: "description", content: "Record and cancel refunds for orders." },
      { property: "og:title", content: "Refunds — HoleSaler" },
      { property: "og:description", content: "Record and cancel refunds for orders." },
    ],
  }),
  component: () => <PlaceholderPage title="Refunds" description="Record and cancel refunds for orders." />,
});
