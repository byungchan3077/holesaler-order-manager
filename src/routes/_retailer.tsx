import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { CartProvider, useCart } from "@/lib/cart";
import { AppShell, type NavItem } from "@/components/app/AppShell";
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

const NAV: NavItem[] = [
  { to: "/catalogue", label: "Catalogue" },
  { to: "/orders", label: "My orders" },
  { to: "/summary", label: "Summary" },
];

function RetailerLayout() {
  const { displayName } = Route.useRouteContext();
  return (
    <CartProvider>
      <AppShell nav={NAV} name={displayName} actions={<CartButton />}>
        <Outlet />
      </AppShell>
    </CartProvider>
  );
}

function CartButton() {
  const { boxCount, lines } = useCart();
  return (
    <Link
      to="/order/new"
      className="inline-flex items-center gap-1.5 rounded bg-topbar-foreground px-2.5 py-1 font-medium text-topbar"
    >
      <ShoppingCart className="size-3.5" />
      Cart
      {lines.length > 0 && <span className="tabular-nums">· {boxCount} boxes</span>}
    </Link>
  );
}
