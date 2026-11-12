import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, FlagPill, PageHeader } from "@/components/app/ui";
import { ReasonDialog } from "@/components/app/ReasonDialog";
import { listOrderDetails, listOrders, type OrderOverview } from "@/repositories/orderRepo";
import { cancelPayment, confirmPayment } from "@/repositories/paymentRepo";
import { toUserMessage } from "@/lib/errors";
import { formatDateTime, formatWon } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/staff/payments")({
  head: () => ({
    meta: [
      { title: "Payments — HoleSaler" },
      { name: "description", content: "Confirm bank transfers and cancel mistaken entries." },
      { property: "og:title", content: "Payments — HoleSaler" },
      { property: "og:description", content: "Confirm bank transfers and cancel mistaken entries." },
    ],
  }),
  component: PaymentsPage,
});

const ageDays = (iso: string | null) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : 0);

function PaymentsPage() {
  return (
    <>
      <PageHeader title="Payments" description="Confirm bank transfers and cancel mistaken entries." />
      <Tabs defaultValue="awaiting">
        <TabsList className="mb-3">
          <TabsTrigger value="awaiting">Awaiting payment</TabsTrigger>
          <TabsTrigger value="paid">Paid, not shipped</TabsTrigger>
        </TabsList>
        <TabsContent value="awaiting"><AwaitingTab /></TabsContent>
        <TabsContent value="paid"><PaidTab /></TabsContent>
      </Tabs>
    </>
  );
}

function AwaitingTab() {
  const [selected, setSelected] = useState<OrderOverview | null>(null);
  const q = useQuery({ queryKey: ["orders", "staff", { status: "PENDING_PAYMENT" }], queryFn: () => listOrders({ status: "PENDING_PAYMENT" }) });
  if (q.error) toast.error(toUserMessage(q.error), { id: "awaiting-error" });
  const rows = [...(q.data ?? [])].sort((a, b) => (a.ordered_at ?? "").localeCompare(b.ordered_at ?? ""));
  return (
    <div className="panel max-h-[calc(100vh-260px)] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Retailer</TableHead>
            <TableHead className="num">Total</TableHead>
            <TableHead>Ordered at</TableHead>
            <TableHead className="num">Age (days)</TableHead>
            <TableHead />
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((o) => (
            <TableRow key={o.order_id} className={cn(o.unpaid_flag && "bg-error-bg/60")}>
              <TableCell className="font-medium">#{o.order_id}</TableCell>
              <TableCell>{o.company_name}</TableCell>
              <TableCell className="num">{formatWon(o.total_amount)}</TableCell>
              <TableCell className="tabular-nums">{formatDateTime(o.ordered_at)}</TableCell>
              <TableCell className="num">{ageDays(o.ordered_at)}</TableCell>
              <TableCell>{o.unpaid_flag && <FlagPill flag="UNPAID_5D" />}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={() => setSelected(o)}>Confirm payment</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {q.isLoading && <EmptyState>Loading…</EmptyState>}
      {!q.isLoading && rows.length === 0 && <EmptyState>No orders awaiting payment.</EmptyState>}
      <ConfirmPaymentDialog order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

/** Current Seoul time as a datetime-local value. */
function nowLocal() {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

function ConfirmPaymentDialog({ order, onClose }: { order: OrderOverview | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank transfer");
  const [at, setAt] = useState(nowLocal());
  const reset = () => { setAmount(""); setMethod("Bank transfer"); setAt(nowLocal()); };
  const m = useMutation({
    mutationFn: () =>
      confirmPayment({ p_order_id: order!.order_id!, p_amount: Number(amount), p_method: method.trim(), p_transacted_at: `${at}:00+09:00` }),
    onSuccess: () => { toast.success(`Payment confirmed for order #${order?.order_id}`); reset(); onClose(); },
    onError: (err) =>
      toast.error(toUserMessage(err, {
        AMOUNT_MISMATCH: "The amount differs from the order total. Settle the difference with the retailer outside the system.",
        ORDER_NOT_PENDING_PAYMENT: "Already paid or cancelled; refresh.",
      })),
    onSettled: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
  const n = Number(amount);
  const valid = amount.trim() !== "" && Number.isInteger(n) && n > 0 && method.trim().length >= 1 && method.length <= 30 && !!at;
  return (
    <Dialog open={!!order} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm payment — order #{order?.order_id}</DialogTitle>
          <DialogDescription>{order?.company_name} · Order total {formatWon(order?.total_amount)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount received (₩)</Label>
            <Input id="amount" inputMode="numeric" className="text-right tabular-nums" placeholder="Type the amount on the bank statement" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="method">Method</Label>
            <Input id="method" maxLength={30} value={method} onChange={(e) => setMethod(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="at">Received at (Seoul time)</Label>
            <Input id="at" type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => { reset(); onClose(); }}>Close</Button>
          <Button disabled={!valid || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Saving…" : "Confirm payment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaidTab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["orders", "details", "READY_TO_SHIP"], queryFn: () => listOrderDetails("READY_TO_SHIP") });
  const m = useMutation({
    mutationFn: (a: { id: number; reason: string }) => cancelPayment({ p_payment_id: a.id, p_reason: a.reason }),
    onSuccess: () => toast.success("Payment cancelled"),
    onError: (err) => toast.error(toUserMessage(err)),
    onSettled: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
  if (q.error) toast.error(toUserMessage(q.error), { id: "paid-error" });
  const rows = (q.data ?? []).map((o) => ({ o, p: o.payment.find((p) => p.kind === "PAYMENT" && !p.is_cancelled) }));
  return (
    <div className="panel max-h-[calc(100vh-260px)] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Retailer</TableHead>
            <TableHead className="num">Total</TableHead>
            <TableHead className="num">Paid</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Received at</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ o, p }) => (
            <TableRow key={o.order_id}>
              <TableCell className="font-medium">#{o.order_id}</TableCell>
              <TableCell>{o.retailer?.company_name}</TableCell>
              <TableCell className="num">{formatWon(o.total_amount)}</TableCell>
              <TableCell className="num">{formatWon(p?.amount)}</TableCell>
              <TableCell>{p?.method || "—"}</TableCell>
              <TableCell className="tabular-nums">{formatDateTime(p?.transacted_at)}</TableCell>
              <TableCell className="text-right">
                {p && (
                  <ReasonDialog
                    size="sm"
                    label="Cancel payment"
                    title={`Cancel payment for order #${o.order_id}?`}
                    description={`${formatWon(p.amount)} received ${formatDateTime(p.transacted_at)}. The order goes back to awaiting payment.`}
                    confirmLabel="Cancel payment"
                    pending={m.isPending}
                    onConfirm={(reason) => m.mutateAsync({ id: p.payment_id, reason })}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {q.isLoading && <EmptyState>Loading…</EmptyState>}
      {!q.isLoading && rows.length === 0 && <EmptyState>No paid orders waiting for shipment.</EmptyState>}
    </div>
  );
}
