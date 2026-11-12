import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/ui";
import { SummaryView } from "@/components/app/SummaryView";

export const Route = createFileRoute("/staff/summary")({
  head: () => ({
    meta: [
      { title: "Summary — HoleSaler" },
      { name: "description", content: "Order, payment and shipment totals by period." },
      { property: "og:title", content: "Summary — HoleSaler" },
      { property: "og:description", content: "Order, payment and shipment totals by period." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Summary" description="Order, payment and shipment totals by period." />
      <SummaryView />
    </>
  ),
});
