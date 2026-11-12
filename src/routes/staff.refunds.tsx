import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, Notice, PageHeader, StatusPill } from "@/components/app/ui";
import { ReasonDialog } from "@/components/app/ReasonDialog";
import { getOrder, listOrders, type OrderDetail } from "@/repositories/orderRepo";
import { cancelRefund, recordRefund } from "@/repositories/paymentRepo";
import { toUserMessage } from "@/lib/errors";
import { REFUND_REASON_LABEL, formatDateTime, formatWon, seoulLocalToIso, seoulNowLocal } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/staff/refunds")({
  validateSearch: (s: Record<string, unknown>): { order?: number | undefined } => {
    const n = Number(s["order"]);
    return { order: Number.isInteger(n) && n > 0 ? n : undefined };
  },
  head: () => ({
    meta: [
      { title: "Refunds — HoleSaler" },
      { name: "description", content: "Record and cancel refunds for orders." },
      { property: "og:title", content: "Refunds — HoleSaler" },
      { property: "og:description", content: "Record and cancel refunds for orders." },
    ],
  }),
  component: RefundsPage,
});

type Reason = "ORDER_CANCELLED" | "RETURN" | "TRANSIT_ISSUE" | "OVERCHARGE";

function RefundsPage() {
  const { order } = Route.useSearch();
  const navigate = useNavigate({ from: "/staff/refunds" });
  const [search, setSearch] = useState(order ? String(order) : "");
  const choose = (id: number | undefined) => navigate({ search: { order: id } });

  const needed = useQuery({ queryKey: ["orders", "staff", { refundNeededOnly: true }], queryFn: () => listOrders({ refundNeededOnly: true }) });
  if (needed.error) toast.error(toUserMessage(needed.error), { id: "refund-list-error" });

  return (
    <>
      <PageHeader title="Refunds" description="Record and cancel refunds for orders." />
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); const n = Number(search); if (Number.isInteger(n) && n > 0) choose(n); }}
          >
            <Input className="bg-card" placeholder="Order number" inputMode="numeric" value={search} onChange={(e) => setSearch(e.target.value.replace(/[^0-9]/g, ""))} />
            <Button type="submit" variant="secondary">Open</Button>
          </form>
          <div className="panel max-h-[calc(100vh-260px)] overflow-auto">
            <h2 className="section-title px-4 py-3">Refund needed</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Retailer</TableHead>
                  <TableHead className="num">Refundable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(needed.data ?? []).map((o) => (
                  <TableRow key={o.order_id} className={cn("cursor-pointer", o.order_id === order && "bg-muted")} onClick={() => choose(o.order_id ?? undefined)}>
                    <TableCell className="font-medium">#{o.order_id}</TableCell>
                    <TableCell>{o.company_name}</TableCell>
                    <TableCell className="num">{formatWon((o.paid_amount ?? 0) - (o.refunded_amount ?? 0))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!needed.isLoading && (needed.data ?? []).length === 0 && <EmptyState>No refunds needed.</EmptyState>}
          </div>
        </aside>
        <section>{order ? <RefundOrder id={order} /> : <div className="panel"><EmptyState>Choose an order on the left or search by number.</EmptyState></div>}</section>
      </div>
    </>
  );
}

function RefundOrder({ id }: { id: number }) {
  const q = useQuery({ queryKey: ["orders", "detail", id], queryFn: () => getOrder(id), retry: false });
  if (q.isLoading) return <div className="panel"><EmptyState>Loading…</EmptyState></div>;
  if (q.error || !q.data) return <Notice kind="error">{q.error ? toUserMessage(q.error) : "Order not found"}</Notice>;
  return <RefundOrderView o={q.data} />;
}

function RefundOrderView({ o }: { o: OrderDetail }) {
  const qc = useQueryClient();
  const paid = o.payment.filter((p) => p.kind === "PAYMENT" && !p.is_cancelled).reduce((s, p) => s + p.amount, 0);
  const refunds = o.payment.filter((p) => p.kind === "REFUND");
  const refunded = refunds.filter((p) => !p.is_cancelled).reduce((s, p) => s + p.amount, 0);
  const refundable = paid - refunded;
  const shipped = o.status === "SHIPPED";
  const refundedQty = (itemId: number) =>
    refunds.filter((p) => !p.is_cancelled && p.order_item_id === itemId).reduce((s, p) => s + (p.quantity ?? 0), 0);

  const cancel = useMutation({
    mutationFn: (a: { id: number; reason: string }) => cancelRefund({ p_payment_id: a.id, p_reason: a.reason }),
    onSuccess: () => toast.success("Refund record cancelled"),
    onError: (err) => toast.error(toUserMessage(err)),
    onSettled: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="section-title">Order #{o.order_id}</h2>
          <StatusPill status={o.status} />
        </div>
        <dl className="grid grid-cols-3 gap-4">
          <div><dt className="text-muted-foreground">Paid</dt><dd className="text-lg font-semibold tabular-nums">{formatWon(paid)}</dd></div>
          <div><dt className="text-muted-foreground">Refunded</dt><dd className="text-lg font-semibold tabular-nums">{formatWon(refunded)}</dd></div>
          <div><dt className="text-muted-foreground">Still refundable</dt><dd className="text-lg font-semibold tabular-nums">{formatWon(refundable)}</dd></div>
        </dl>
      </div>

      <div className="panel overflow-auto">
        <h2 className="section-title px-4 py-3">Lines</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="num">Price per box</TableHead>
              <TableHead className="num">Ordered</TableHead>
              <TableHead className="num">Shipped</TableHead>
              <TableHead className="num">Refunded qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {o.order_item.map((i) => (
              <TableRow key={i.order_item_id}>
                <TableCell>{i.product?.name} <span className="font-mono text-xs text-muted-foreground">{i.product?.product_code}</span></TableCell>
                <TableCell className="num">{formatWon(i.unit_price)}</TableCell>
                <TableCell className="num">{i.quantity}</TableCell>
                <TableCell className="num">{shipped ? i.quantity : 0}</TableCell>
                <TableCell className="num">{refundedQty(i.order_item_id)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RefundForm o={o} refundable={refundable} refundedQty={refundedQty} />

      <div className="panel overflow-auto">
        <h2 className="section-title px-4 py-3">Refund history</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sent at</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Line</TableHead>
              <TableHead className="num">Qty</TableHead>
              <TableHead className="num">Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.map((p) => (
              <TableRow key={p.payment_id} className={cn(p.is_cancelled && "text-muted-foreground line-through")}>
                <TableCell className="tabular-nums">{formatDateTime(p.transacted_at)}</TableCell>
                <TableCell>{p.reason ? REFUND_REASON_LABEL[p.reason] : "—"}</TableCell>
                <TableCell>{o.order_item.find((i) => i.order_item_id === p.order_item_id)?.product?.name ?? "—"}</TableCell>
                <TableCell className="num">{p.quantity ?? "—"}</TableCell>
                <TableCell className="num">{formatWon(p.amount)}</TableCell>
                <TableCell>{p.method}</TableCell>
                <TableCell className="text-right">
                  {!p.is_cancelled && (
                    <ReasonDialog
                      size="sm"
                      label="Cancel record"
                      title="Cancel this refund record?"
                      description={`${formatWon(p.amount)} sent ${formatDateTime(p.transacted_at)}. Use this only for a record entered by mistake.`}
                      confirmLabel="Cancel record"
                      pending={cancel.isPending}
                      onConfirm={(reason) => cancel.mutateAsync({ id: p.payment_id, reason })}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {refunds.length === 0 && <EmptyState>No refunds recorded.</EmptyState>}
      </div>
    </div>
  );
}

function RefundForm({ o, refundable, refundedQty }: { o: OrderDetail; refundable: number; refundedQty: (id: number) => number }) {
  const qc = useQueryClient();
  const allowed: Reason[] = o.status === "CANCELLED" ? ["ORDER_CANCELLED"] : o.status === "SHIPPED" ? ["RETURN", "TRANSIT_ISSUE", "OVERCHARGE"] : [];
  const [reason, setReason] = useState<Reason | "">(allowed[0] ?? "");
  const [amount, setAmount] = useState("");
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("");
  const [method, setMethod] = useState("Bank transfer");
  const [at, setAt] = useState(seoulNowLocal());
  const [returnDone, setReturnDone] = useState(false);

  useEffect(() => {
    setReason(allowed[0] ?? "");
    setReturnDone(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o.order_id, o.status]);
  useEffect(() => {
    setAmount(reason === "ORDER_CANCELLED" ? String(Math.max(refundable, 0)) : "");
    setItemId(""); setQty("");
  }, [reason, refundable]);

  const byLine = reason === "RETURN" || reason === "TRANSIT_ISSUE";
  const item = o.order_item.find((i) => String(i.order_item_id) === itemId);
  const maxQty = item ? item.quantity - refundedQty(item.order_item_id) : 0;
  const nQty = Number(qty);
  const nAmount = Number(amount);
  const lineAmount = item && Number.isInteger(nQty) ? nQty * item.unit_price : 0;
  const valid =
    !!reason && method.trim().length > 0 && !!at &&
    (byLine ? !!item && Number.isInteger(nQty) && nQty >= 1 && nQty <= maxQty : amount !== "" && Number.isInteger(nAmount) && nAmount > 0);

  const m = useMutation({
    mutationFn: () =>
      recordRefund({
        p_order_id: o.order_id,
        p_reason: reason as Reason,
        p_method: method.trim(),
        p_transacted_at: seoulLocalToIso(at),
        // Line refunds leave p_amount out (null): the server computes quantity × unit price.
        ...(byLine ? { p_order_item_id: item!.order_item_id, p_quantity: nQty } : { p_amount: nAmount }),
      }),
    onSuccess: () => {
      toast.success("Refund recorded");
      setReturnDone(reason === "RETURN");
      setQty(""); setAt(seoulNowLocal());
    },
    onError: (err) => toast.error(toUserMessage(err)),
    onSettled: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  return (
    <div className="panel space-y-4 p-4">
      <h2 className="section-title">Record a refund</h2>
      {returnDone && (
        <Notice kind="success">
          If the goods came back sellable,{" "}
          <Link to="/staff/stock" search={{ mode: "return", order: o.order_id }} className="font-medium underline">record a RETURN adjustment</Link>.
        </Notice>
      )}
      {allowed.length === 0 ? (
        <Notice kind="hint">Refunds can be recorded for cancelled orders (order cancelled) or shipped orders (return, transit issue, overcharge).</Notice>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as Reason)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allowed.map((r) => <SelectItem key={r} value={r}>{REFUND_REASON_LABEL[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {byLine ? (
              <>
                <div className="space-y-1.5">
                  <Label>Line</Label>
                  <Select value={itemId} onValueChange={setItemId}>
                    <SelectTrigger><SelectValue placeholder="Choose a line" /></SelectTrigger>
                    <SelectContent>
                      {o.order_item.map((i) => (
                        <SelectItem key={i.order_item_id} value={String(i.order_item_id)} disabled={i.quantity - refundedQty(i.order_item_id) <= 0}>
                          {i.product?.name} ({i.quantity - refundedQty(i.order_item_id)} refundable)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qty">Boxes {item && <span className="text-muted-foreground">(1–{maxQty})</span>}</Label>
                  <Input id="qty" type="number" min={1} max={maxQty} step={1} className="text-right tabular-nums" value={qty} onChange={(e) => setQty(e.target.value)} disabled={!item} />
                </div>
                <div className="space-y-1.5">
                  <Label>Amount</Label>
                  <div className="flex h-9 items-center justify-end rounded-md border border-dashed border-border px-3 tabular-nums">{formatWon(lineAmount)}</div>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (₩) <span className="text-muted-foreground">— still refundable {formatWon(refundable)}</span></Label>
                <Input id="amount" inputMode="numeric" className="text-right tabular-nums" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="method">Method</Label>
              <Input id="method" maxLength={30} value={method} onChange={(e) => setMethod(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="at">Sent at (Seoul time)</Label>
              <Input id="at" type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button disabled={!valid || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Saving…" : "Record refund"}</Button>
          </div>
        </>
      )}
    </div>
  );
}
