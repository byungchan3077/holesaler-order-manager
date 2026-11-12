import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader, StatusPill } from "@/components/app/ui";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { cancelOrder, getOrder } from "@/repositories/orderRepo";
import { toUserMessage } from "@/lib/errors";
import { REFUND_REASON_LABEL, formatDate, formatDateTime, formatWon } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_retailer/orders/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order #${params.id} — HoleSaler` },
      { name: "description", content: "Order lines, shipment, payments and refunds." },
      { property: "og:title", content: `Order #${params.id} — HoleSaler` },
      { property: "og:description", content: "Order lines, shipment, payments and refunds." },
    ],
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const id = Number(Route.useParams().id);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["orders", "detail", id], queryFn: () => getOrder(id) });
  const cancel = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: () => toast.success(`Order #${id} cancelled`),
    onError: (err) =>
      toast.error(
        toUserMessage(err, {
          ORDER_NOT_CANCELLABLE: "This order has been paid. After delivery you can return goods by contacting us.",
        }),
      ),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["catalogue"] });
    },
  });

  if (q.error) toast.error(toUserMessage(q.error), { id: "order-error" });
  const o = q.data;

  return (
    <>
      <Link to="/orders" className="mb-2 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> My orders
      </Link>
      <PageHeader
        title={`Order #${id}`}
        description={o ? `Ordered ${formatDateTime(o.ordered_at)} · Total ${formatWon(o.total_amount)}` : "Loading…"}
        actions={
          o && (
            <div className="flex items-center gap-3">
              <StatusPill status={o.status} />
              {o.status === "PENDING_PAYMENT" && (
                <ConfirmButton
                  label="Cancel order"
                  title={`Cancel order #${id}?`}
                  description="The order will be cancelled and the boxes released. This cannot be undone."
                  confirmLabel="Cancel order"
                  disabled={cancel.isPending}
                  onConfirm={() => cancel.mutate()}
                />
              )}
            </div>
          )
        }
      />
      {o && (
        <div className="space-y-4">
          {o.status === "CANCELLED" && o.cancel_reason && (
            <div className="hint-box">Cancelled {formatDateTime(o.cancelled_at)} — {o.cancel_reason}</div>
          )}
          <section className="panel overflow-auto">
            <h2 className="section-title px-4 py-3">Lines</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="num">Boxes</TableHead>
                  <TableHead className="num">Price per box</TableHead>
                  <TableHead className="num">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {o.order_item.map((it) => (
                  <TableRow key={it.order_item_id}>
                    <TableCell className="font-medium">{it.product?.name}</TableCell>
                    <TableCell className="font-mono text-xs">{it.product?.product_code}</TableCell>
                    <TableCell className="num">{it.quantity.toLocaleString("en-US")}</TableCell>
                    <TableCell className="num">{formatWon(it.unit_price)}</TableCell>
                    <TableCell className="num">{formatWon(it.unit_price * it.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
            <section className="panel">
              <h2 className="section-title px-4 py-3">Shipment</h2>
              {!o.shipment ? (
                <EmptyState>Not shipped yet.</EmptyState>
              ) : (
                <dl className="grid grid-cols-[130px_1fr] gap-y-2 px-4 pb-4">
                  <dt className="text-muted-foreground">Shipped on</dt>
                  <dd className="tabular-nums">{formatDate(o.shipment.shipped_at)}</dd>
                  <dt className="text-muted-foreground">Tracking</dt>
                  <dd>{o.shipment.tracking_ref || "—"}</dd>
                </dl>
              )}
            </section>

            <section className="panel overflow-auto">
              <h2 className="section-title px-4 py-3">Payments and refunds</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kind</TableHead>
                    <TableHead className="num">Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...o.payment]
                    .sort((a, b) => b.transacted_at.localeCompare(a.transacted_at))
                    .map((p) => (
                      <TableRow key={p.payment_id} className={cn(p.is_cancelled && "text-muted-foreground line-through")}>
                        <TableCell>{p.kind === "PAYMENT" ? "Payment" : "Refund"}{p.is_cancelled && " (cancelled)"}</TableCell>
                        <TableCell className="num">{formatWon(p.kind === "REFUND" ? -p.amount : p.amount)}</TableCell>
                        <TableCell>{p.reason ? REFUND_REASON_LABEL[p.reason] : "—"}</TableCell>
                        <TableCell className="tabular-nums">{formatDate(p.transacted_at)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {o.payment.length === 0 && <EmptyState>No payments yet.</EmptyState>}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
