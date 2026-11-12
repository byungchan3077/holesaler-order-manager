import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader, StatusPill } from "@/components/app/ui";
import { listOrders } from "@/repositories/orderRepo";
import { toUserMessage } from "@/lib/errors";
import { ORDER_STATUS_LABEL, formatDateTime, formatWon, type OrderStatus } from "@/lib/format";

export const Route = createFileRoute("/_retailer/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — HoleSaler" },
      { name: "description", content: "Your orders, payments and shipments." },
      { property: "og:title", content: "My orders — HoleSaler" },
      { property: "og:description", content: "Your orders, payments and shipments." },
    ],
  }),
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const [status, setStatus] = useState<"ALL" | OrderStatus>("ALL");
  const q = useQuery({
    queryKey: ["orders", status],
    queryFn: () => listOrders(status === "ALL" ? {} : { status }),
  });
  if (q.error) toast.error(toUserMessage(q.error), { id: "orders-error" });
  const rows = q.data ?? [];

  return (
    <>
      <PageHeader title="My orders" description="Your orders, payments and shipments." />
      <div className="mb-3">
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-52 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {Object.entries(ORDER_STATUS_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="panel max-h-[calc(100vh-220px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Ordered at</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="num">Total</TableHead>
              <TableHead className="num">Paid</TableHead>
              <TableHead className="num">Refunded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.order_id} className="cursor-pointer">
                <TableCell>
                  <Link to="/orders/$id" params={{ id: String(o.order_id) }} className="font-medium underline-offset-2 hover:underline">
                    #{o.order_id}
                  </Link>
                </TableCell>
                <TableCell className="tabular-nums">{formatDateTime(o.ordered_at)}</TableCell>
                <TableCell>{o.status && <StatusPill status={o.status} />}</TableCell>
                <TableCell className="num">{formatWon(o.total_amount)}</TableCell>
                <TableCell className="num">{formatWon(o.paid_amount)}</TableCell>
                <TableCell className="num">{formatWon(o.refunded_amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {q.isLoading && <EmptyState>Loading…</EmptyState>}
        {!q.isLoading && rows.length === 0 && <EmptyState>No orders yet.</EmptyState>}
      </div>
    </>
  );
}
