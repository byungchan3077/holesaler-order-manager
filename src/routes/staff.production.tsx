import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/ui";

export const Route = createFileRoute("/staff/production")({
  head: () => ({
    meta: [
      { title: "Production — HoleSaler" },
      { name: "description", content: "Record finished production into stock." },
      { property: "og:title", content: "Production — HoleSaler" },
      { property: "og:description", content: "Record finished production into stock." },
    ],
  }),
  component: () => <PlaceholderPage title="Production" description="Record finished production into stock." />,
});
