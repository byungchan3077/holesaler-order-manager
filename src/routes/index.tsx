import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveDestination } from "@/lib/destination";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "HoleSaler — B2B packaging orders" },
      { name: "description", content: "Order packaging by the box and track payments, shipments and stock." },
      { property: "og:title", content: "HoleSaler — B2B packaging orders" },
      { property: "og:description", content: "Order packaging by the box and track payments, shipments and stock." },
    ],
  }),
  beforeLoad: async () => {
    const d = await resolveDestination();
    if (d.to === "/register") throw redirect({ to: "/register", search: { step: 2 } });
    if (d.to === "/account-status") throw redirect({ to: "/account-status", search: { s: d.status } });
    throw redirect({ to: d.to });
  },
  component: () => null,
});
