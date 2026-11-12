import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/refunds")({
  validateSearch: (s: Record<string, unknown>): { order?: number | undefined } => {
    const n = Number(s["order"]);
    return { order: Number.isInteger(n) && n > 0 ? n : undefined };
  },
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
