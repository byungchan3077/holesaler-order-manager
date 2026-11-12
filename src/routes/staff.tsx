import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { resolveDestination } from "@/lib/destination";
import { myProfile } from "@/repositories/accountRepo";

export const Route = createFileRoute("/staff")({
  ssr: false,
  beforeLoad: async () => {
    const d = await resolveDestination();
    if (d.to !== "/staff/orders") throw redirect({ to: "/" });
    const p = await myProfile();
    return { displayName: p?.name || p?.email || "Staff" };
  },
  component: StaffLayout,
});

const NAV: NavItem[] = [
  { to: "/staff/orders", label: "Orders" },
  { to: "/staff/payments", label: "Payments" },
  { to: "/staff/shipments", label: "Shipments" },
  { to: "/staff/refunds", label: "Refunds" },
  { to: "/staff/inventory", label: "Inventory" },
  { to: "/staff/production", label: "Production" },
  { to: "/staff/stock", label: "Stock adjustment" },
  { to: "/staff/products", label: "Products" },
  { to: "/staff/retailers", label: "Retailers" },
  { to: "/staff/summary", label: "Summary" },
];

function StaffLayout() {
  const { displayName } = Route.useRouteContext();
  return (
    <AppShell nav={NAV} name={displayName}>
      <Outlet />
    </AppShell>
  );
}
