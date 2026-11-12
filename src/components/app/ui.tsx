import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/format";

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="mt-0.5 text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}

const statusStyle: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-status-amber-bg text-status-amber",
  READY_TO_SHIP: "bg-status-blue-bg text-status-blue",
  SHIPPED: "bg-status-green-bg text-status-green",
  CANCELLED: "bg-status-grey-bg text-status-grey",
};
export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", statusStyle[status])}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export type Flag = "UNPAID_5D" | "REFUND_NEEDED" | "RESERVE_IN_USE" | "ORDERABLE_ZERO";
const flagMeta: Record<Flag, [string, string]> = {
  UNPAID_5D: ["Unpaid 5+ days", "border-flag-red text-flag-red"],
  REFUND_NEEDED: ["Refund needed", "border-flag-purple text-flag-purple"],
  RESERVE_IN_USE: ["Reserve in use", "border-flag-amber text-flag-amber"],
  ORDERABLE_ZERO: ["Orderable 0", "border-flag-red text-flag-red"],
};
export function FlagPill({ flag }: { flag: Flag }) {
  const [label, cls] = flagMeta[flag];
  return <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-medium", cls)}>{label}</span>;
}

export function Notice({ kind, children }: { kind: "error" | "success" | "hint"; children: ReactNode }) {
  return <div className={kind === "error" ? "error-box" : kind === "success" ? "success-box" : "hint-box"}>{children}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="px-4 py-8 text-center text-muted-foreground">{children}</div>;
}

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="panel">
        <EmptyState>This page is coming soon.</EmptyState>
      </div>
    </>
  );
}

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-topbar text-topbar-foreground">
        <div className="mx-auto flex h-12 max-w-[1200px] items-center px-4 text-[15px] font-semibold">HoleSaler</div>
      </header>
      <main className="mx-auto mt-16 w-full max-w-md px-4">{children}</main>
    </div>
  );
}
