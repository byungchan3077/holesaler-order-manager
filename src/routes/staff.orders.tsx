import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader, StatusPill } from "@/components/app/ui";
import { OrderDetailView } from "@/components/app/OrderDetailView";
import { ReasonDialog } from "@/components/app/ReasonDialog";
import { cancelOrder, getOrder, listOrders, type OrderFilters } from "@/repositories/orderRepo";
import { listRetailers } from "@/repositories/accountRepo";
import { toUserMessage } from "@/lib/errors";
import { ORDER_STATUS_LABEL, formatDateTime, formatWon, type OrderStatus } from "@/lib/format";

export const Route = createFileRoute("/staff/orders")({
  head: () => ({
    meta: [
      { title: "Orders — HoleSaler" },
      { name: "description", content: "All retailer orders with payment and refund flags." },
      { property: "og:title", content: "Orders — HoleSaler" },
      { property: "og:description", content: "All retailer orders with payment and refund flags." },
    ],
  }),
  component: StaffOrdersPage,
});

function UnpaidBadge() {
  return <span className="inline-flex rounded-full border border-flag-red px-2 py-0.5 text-xs font-medium whitespace-nowrap text-flag-red">Unpaid 5+ days: contact retailer</span>;
}
function RefundBadge() {
  return <span className="inline-flex rounded-full border border-flag-purple px-2 py-0.5 text-xs font-medium whitespace-nowrap text-flag-purple">Refund needed</span>;
}

function StaffOrdersPage() {
  const [status, setStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [flag, setFlag] = useState<"ALL" | "UNPAID" | "REFUND">("ALL");
  const [retailer, setRetailer] = useState("ALL");
  const [openId, setOpenId] = useState<number | null>(null);

  const filters: OrderFilters = {
    ...(status !== "ALL" && { status }),
    ...(flag === "UNPAID" && { unpaidOnly: true }),
    ...(flag === "REFUND" && { refundNeededOnly: true }),
    ...(retailer !== "ALL" && { retailerId: Number(retailer) }),
  };
  const q = useQuery({ queryKey: ["orders", "staff", filters], queryFn: () => listOrders(filters) });
  const retailers = useQuery({ queryKey: ["retailers"], queryFn: listRetailers });
  if (q.error) toast.error(toUserMessage(q.error), { id: "orders-error" });
  const rows = q.data ?? [];

  return (
    <>
      <PageHeader title="Orders" description="All retailer orders with payment and refund flags." />
      <div className="mb-3 flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {Object.entries(ORDER_STATUS_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={flag} onValueChange={(v) => setFlag(v as typeof flag)}>
          <SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All flags</SelectItem>
            <SelectItem value="UNPAID">Unpaid 5+ days</SelectItem>
            <SelectItem value="REFUND">Refund needed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={retailer} onValueChange={setRetailer}>
          <SelectTrigger className="w-56 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All retailers</SelectItem>
            {(retailers.data ?? []).map((r) => (
              <SelectItem key={r.retailer_id} value={String(r.retailer_id)}>{r.company_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="panel max-h-[calc(100vh-220px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Retailer</TableHead>
              <TableHead>Ordered at</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="num">Total</TableHead>
              <TableHead className="num">Paid</TableHead>
              <TableHead className="num">Refunded</TableHead>
              <TableHead>Flags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.order_id} className="cursor-pointer" onClick={() => setOpenId(o.order_id)}>
                <TableCell className="font-medium">#{o.order_id}</TableCell>
                <TableCell>{o.company_name}</TableCell>
                <TableCell className="tabular-nums">{formatDateTime(o.ordered_at)}</TableCell>
                <TableCell>{o.status && <StatusPill status={o.status} />}</TableCell>
                <TableCell className="num">{formatWon(o.total_amount)}</TableCell>
                <TableCell className="num">{formatWon(o.paid_amount)}</TableCell>
                <TableCell className="num">{formatWon(o.refunded_amount)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {o.unpaid_flag && <UnpaidBadge />}
                    {o.refund_needed && <RefundBadge />}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {q.isLoading && <EmptyState>Loading…</EmptyState>}
        {!q.isLoading && rows.length === 0 && <EmptyState>No orders match these filters.</EmptyState>}
      </div>
      <OrderDrawer id={openId} flags={rows.find((r) => r.order_id === openId)} onClose={() => setOpenId(null)} />
    </>
  );
}

function OrderDrawer({ id, flags, onClose }: { id: number | null; flags?: { unpaid_flag: boolean | null; refund_needed: boolean | null } | undefined; onClose: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["orders", "detail", id], queryFn: () => getOrder(id!), enabled: id != null });
  const cancel = useMutation({
    mutationFn: (reason: string) => cancelOrder(id!, reason),
    onSuccess: () => toast.success(`Order #${id} cancelled`),
    onError: (err) => toast.error(toUserMessage(err)),
    onSettled: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
  if (q.error) toast.error(toUserMessage(q.error), { id: "order-drawer-error" });
  const o = q.data;
  const cancellable = o && (o.status === "PENDING_PAYMENT" || o.status === "READY_TO_SHIP");

  return (
    <Sheet open={id != null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto bg-background sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="page-title">Order #{id}</SheetTitle>
          <SheetDescription>
            {o ? `Ordered ${formatDateTime(o.ordered_at)} · Total ${formatWon(o.total_amount)}` : "Loading…"}
          </SheetDescription>
        </SheetHeader>
        {o && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={o.status} />
              {flags?.unpaid_flag && <UnpaidBadge />}
              {flags?.refund_needed && <RefundBadge />}
            </div>
            <div className="flex flex-wrap gap-2">
              {o.status === "READY_TO_SHIP" && (
                <Button asChild><Link to="/staff/shipments" search={{ order: o.order_id }}>Ship</Link></Button>
              )}
              <Button variant="secondary" asChild>
                <Link to="/staff/refunds" search={{ order: o.order_id }}>Refund</Link>
              </Button>
              {cancellable && (
                <ReasonDialog
                  label="Cancel order"
                  title={`Cancel order #${o.order_id}?`}
                  description="The boxes are released back to stock. This cannot be undone."
                  warning={o.status === "READY_TO_SHIP" ? "Only when we cannot fulfil this order. The payment will need a refund." : undefined}
                  confirmLabel="Cancel order"
                  pending={cancel.isPending}
                  onConfirm={(r) => cancel.mutateAsync(r)}
                />
              )}
            </div>
            <OrderDetailView order={o} compact />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
