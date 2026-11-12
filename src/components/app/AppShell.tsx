import { Link, useNavigate, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { signOut } from "@/repositories/authRepo";

export type NavItem = { to: NonNullable<LinkProps["to"]>; label: string };

export function AppShell({ nav, name, actions, children }: { nav: NavItem[]; name: string; actions?: ReactNode; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-topbar text-topbar-foreground">
        <div className="mx-auto flex h-12 max-w-[1200px] items-center gap-6 px-4">
          <span className="text-[15px] font-semibold tracking-tight">HoleSaler</span>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="whitespace-nowrap rounded px-2 py-1 text-[13px] text-topbar-muted hover:text-topbar-foreground"
                activeProps={{ className: "bg-topbar-foreground/10 !text-topbar-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 whitespace-nowrap text-[13px]">
            {actions}
            <span className="text-topbar-muted">{name}</span>
            <button
              className="rounded border border-topbar-muted/40 px-2 py-1 hover:bg-topbar-foreground/10"
              onClick={async () => {
                await signOut();
                navigate({ to: "/login" });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-4 py-6">{children}</main>
    </div>
  );
}
