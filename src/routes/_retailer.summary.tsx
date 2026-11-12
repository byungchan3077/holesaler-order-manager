import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/ui";
import { SummaryView } from "@/components/app/SummaryView";

export const Route = createFileRoute("/_retailer/summary")({
  head: () => ({
    meta: [
      { title: "Summary — HoleSaler" },
      { name: "description", content: "Your order and payment totals by period." },
      { property: "og:title", content: "Summary — HoleSaler" },
      { property: "og:description", content: "Your order and payment totals by period." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Summary" description="Your order and payment totals by period." />
      <SummaryView />
    </>
  ),
});
