import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { resolveDestination } from "@/lib/destination";
import { myRetailer } from "@/repositories/accountRepo";

export const Route = createFileRoute("/_retailer")({
  ssr: false,
  beforeLoad: async () => {
    const d = await resolveDestination();
    if (d.to !== "/catalogue") throw redirect({ to: "/" });
    const r = await myRetailer();
    return { displayName: r.company_name };
  },
  component: RetailerLayout,
});

const NAV = [
  { to: "/catalogue", label: "Catalogue" },
  { to: "/orders", label: "My orders" },
  { to: "/summary", label: "Summary" },
];

function RetailerLayout() {
  const { displayName } = Route.useRouteContext();
  return (
    <AppShell nav={NAV} name={displayName}>
      <Outlet />
    </AppShell>
  );
}
