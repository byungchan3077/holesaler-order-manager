import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, Notice, PageHeader } from "@/components/app/ui";
import { catalogue } from "@/repositories/productRepo";
import { placeOrder } from "@/repositories/orderRepo";
import { useCart } from "@/lib/cart";
import { errorCode, toUserMessage } from "@/lib/errors";
import { formatWon } from "@/lib/format";
import { PAYMENT_INSTRUCTIONS } from "@/config";

export const Route = createFileRoute("/_retailer/order/new")({
  head: () => ({
    meta: [
      { title: "Place order — HoleSaler" },
      { name: "description", content: "Review your cart and place an order." },
      { property: "og:title", content: "Place order — HoleSaler" },
      { property: "og:description", content: "Review your cart and place an order." },
    ],
  }),
  component: PlaceOrderPage,
});

function PlaceOrderPage() {
  const cart = useCart();
  const qc = useQueryClient();
  const [placed, setPlaced] = useState<{ id: number; total: number } | null>(null);
  const cat = useQuery({ queryKey: ["catalogue"], queryFn: catalogue, staleTime: 0, refetchOnMount: "always" });
  const orderable = new Map((cat.data ?? []).map((p) => [p.product_id, p.orderable_boxes]));
  const total = cart.lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);

  // Drop lines for products no longer in the catalogue (inactive).
  useEffect(() => {
    if (!cat.data) return;
    for (const l of cart.lines) {
      if (!orderable.has(l.product_id)) {
        cart.remove(l.product_id);
        toast.error(`${l.name}: This product is no longer sold`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat.data]);

  const m = useMutation({
    mutationFn: () => placeOrder(cart.lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity }))),
    onSuccess: (id) => {
      setPlaced({ id, total });
      cart.clear();
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["catalogue"] });
    },
    onError: (err) => {
      toast.error(toUserMessage(err, { PRODUCT_INACTIVE: "This product is no longer sold" }));
      cat.refetch();
      if (errorCode(err) !== "INSUFFICIENT_STOCK" && errorCode(err) !== "PRODUCT_INACTIVE") qc.invalidateQueries();
    },
  });

  if (placed) {
    return (
      <>
        <PageHeader title="Order placed" description="Pay by bank transfer to confirm your order." />
        <div className="panel max-w-xl space-y-4 p-6">
          <Notice kind="success">Your order has been received.</Notice>
          <dl className="grid grid-cols-[140px_1fr] gap-y-2">
            <dt className="text-muted-foreground">Order number</dt>
            <dd className="font-semibold tabular-nums">#{placed.id}</dd>
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-semibold tabular-nums">{formatWon(placed.total)}</dd>
          </dl>
          <div className="hint-box text-foreground">{PAYMENT_INSTRUCTIONS}</div>
          <p className="text-muted-foreground">Unpaid orders may be cancelled after 5 days.</p>
          <Button asChild variant="secondary"><Link to="/orders">Go to My orders</Link></Button>
        </div>
      </>
    );
  }

  const invalid = cart.lines.some((l) => {
    const max = orderable.get(l.product_id) ?? 0;
    return !Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > max;
  });

  return (
    <>
      <PageHeader title="Place order" description="Review quantities, then place your order." />
      <div className="panel overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="num">Price per box</TableHead>
              <TableHead className="num">Orderable</TableHead>
              <TableHead className="num w-32">Boxes</TableHead>
              <TableHead className="num">Line total</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.lines.map((l) => {
              const max = orderable.get(l.product_id) ?? 0;
              const bad = l.quantity < 1 || l.quantity > max || !Number.isInteger(l.quantity);
              return (
                <TableRow key={l.product_id}>
                  <TableCell>
                    <div className="font-medium">{l.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{l.product_code}</div>
                  </TableCell>
                  <TableCell className="num">{formatWon(l.unit_price)}</TableCell>
                  <TableCell className="num">{cat.isLoading ? "…" : max.toLocaleString("en-US")}</TableCell>
                  <TableCell className="num">
                    <Input
                      type="number" min={1} max={max} step={1} value={l.quantity}
                      aria-invalid={bad}
                      onChange={(e) => cart.setQuantity(l.product_id, Number(e.target.value))}
                      className="ml-auto h-8 w-20 text-right tabular-nums aria-[invalid=true]:border-destructive"
                    />
                  </TableCell>
                  <TableCell className="num">{formatWon(l.unit_price * l.quantity)}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" aria-label={`Remove ${l.name}`} onClick={() => cart.remove(l.product_id)}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          {cart.lines.length > 0 && (
            <TableFooter className="bg-card">
              <TableRow>
                <TableCell colSpan={4} className="font-semibold">Order total</TableCell>
                <TableCell className="num font-semibold">{formatWon(total)}</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
        {cart.lines.length === 0 && (
          <EmptyState>
            Your cart is empty. <Link to="/catalogue" className="text-foreground underline">Browse the catalogue</Link>
          </EmptyState>
        )}
      </div>
      {cart.lines.length > 0 && (
        <div className="mt-4 flex items-center justify-end gap-3">
          {invalid && <span className="text-destructive">Each line needs 1 to the orderable number of boxes.</span>}
          <Button variant="secondary" asChild><Link to="/catalogue">Keep shopping</Link></Button>
          <Button disabled={invalid || m.isPending || cat.isLoading} onClick={() => m.mutate()}>
            {m.isPending ? "Placing…" : "Place order"}
          </Button>
        </div>
      )}
    </>
  );
}
