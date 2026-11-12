import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, Notice, PageHeader } from "@/components/app/ui";
import { listOrderDetails, shipOrder, type OrderWithDetails } from "@/repositories/orderRepo";
import { toUserMessage } from "@/lib/errors";
import { formatDate, formatDateTime, seoulToday } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/staff/shipments")({
  validateSearch: (s: Record<string, unknown>): { order?: number | undefined } => {
    const n = Number(s["order"]);
    return { order: Number.isInteger(n) && n > 0 ? n : undefined };
  },
  head: () => ({
    meta: [
      { title: "Shipments — HoleSaler" },
      { name: "description", content: "Ship paid orders and record tracking references." },
      { property: "og:title", content: "Shipments — HoleSaler" },
      { property: "og:description", content: "Ship paid orders and record tracking references." },
    ],
  }),
  component: ShipmentsPage,
});

function ShipmentsPage() {
  const { order } = Route.useSearch();
  const ready = useQuery({ queryKey: ["orders", "details", "READY_TO_SHIP"], queryFn: () => listOrderDetails("READY_TO_SHIP") });
  const shipped = useQuery({ queryKey: ["orders", "details", "SHIPPED"], queryFn: () => listOrderDetails("SHIPPED", { ascending: false, limit: 50 }) });
  if (ready.error) toast.error(toUserMessage(ready.error), { id: "ready-error" });
  const readyRows = [...(ready.data ?? [])].sort((a, b) => (a.order_id === order ? -1 : b.order_id === order ? 1 : 0));
  const shippedRows = [...(shipped.data ?? [])].sort((a, b) => (b.shipment?.shipped_at ?? "").localeCompare(a.shipment?.shipped_at ?? ""));

  return (
    <>
      <PageHeader title="Shipments" description="Ship paid orders and record tracking references." />
      <div className="mb-4"><Notice kind="hint">Record a shipment only when the goods actually leave. A recorded shipment cannot be undone.</Notice></div>

      <h2 className="section-title mb-2">Ready to ship</h2>
      <div className="space-y-3">
        {readyRows.map((o) => <ShipCard key={o.order_id} o={o} highlight={o.order_id === order} />)}
        {ready.isLoading && <div className="panel"><EmptyState>Loading…</EmptyState></div>}
        {!ready.isLoading && readyRows.length === 0 && <div className="panel"><EmptyState>No paid orders waiting to ship.</EmptyState></div>}
      </div>

      <h2 className="section-title mt-8 mb-2">Recently shipped</h2>
      <div className="panel max-h-[420px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Retailer</TableHead>
              <TableHead>Ship date</TableHead>
              <TableHead>Tracking reference</TableHead>
              <TableHead className="num">Boxes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shippedRows.map((o) => (
              <TableRow key={o.order_id}>
                <TableCell className="font-medium">#{o.order_id}</TableCell>
                <TableCell>{o.retailer?.company_name}</TableCell>
                <TableCell className="tabular-nums">{formatDate(o.shipment?.shipped_at)}</TableCell>
                <TableCell>{o.shipment?.tracking_ref || "—"}</TableCell>
                <TableCell className="num">{o.order_item.reduce((s, i) => s + i.quantity, 0).toLocaleString("en-US")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!shipped.isLoading && shippedRows.length === 0 && <EmptyState>No shipments yet.</EmptyState>}
      </div>
    </>
  );
}

function ShipCard({ o, highlight }: { o: OrderWithDetails; highlight: boolean }) {
  const qc = useQueryClient();
  const [tracking, setTracking] = useState("");
  const m = useMutation({
    mutationFn: () => shipOrder(o.order_id, tracking.trim()),
    onSuccess: () => toast.success(`Order #${o.order_id} shipped`),
    onError: (err) => toast.error(toUserMessage(err, { ORDER_NOT_READY_TO_SHIP: "Not paid or already handled; refresh." })),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
  const lines = o.order_item.map((i) => (
    <li key={i.order_item_id} className="flex justify-between gap-4">
      <span>{i.product?.name} <span className="font-mono text-xs text-muted-foreground">{i.product?.product_code}</span></span>
      <span className="tabular-nums">{i.quantity.toLocaleString("en-US")} boxes</span>
    </li>
  ));
  return (
    <div className={cn("panel grid gap-4 p-4 md:grid-cols-[1fr_320px]", highlight && "ring-2 ring-primary")}>
      <div>
        <div className="mb-2 flex items-baseline gap-3">
          <span className="font-semibold">#{o.order_id}</span>
          <span>{o.retailer?.company_name}</span>
          <span className="text-muted-foreground tabular-nums">Ordered {formatDateTime(o.ordered_at)}</span>
        </div>
        <ul className="space-y-1">{lines}</ul>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-[110px_1fr] items-center gap-2">
          <Label>Ship date</Label>
          <span className="tabular-nums">{seoulToday()}</span>
          <Label htmlFor={`t-${o.order_id}`}>Tracking ref</Label>
          <Input id={`t-${o.order_id}`} maxLength={50} placeholder="Optional" value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" disabled={m.isPending}>Record shipment</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Record shipment for order #{o.order_id}?</AlertDialogTitle>
              <AlertDialogDescription>
                {o.retailer?.company_name} · ship date {seoulToday()}{tracking.trim() && ` · tracking ${tracking.trim()}`}. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ul className="panel space-y-1 p-3">{lines}</ul>
            <AlertDialogFooter>
              <AlertDialogCancel>Not yet</AlertDialogCancel>
              <AlertDialogAction onClick={() => m.mutate()}>Record shipment</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
