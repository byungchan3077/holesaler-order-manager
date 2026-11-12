import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader } from "@/components/app/ui";
import { productionLog, recordProduction, staffNames } from "@/repositories/inventoryRepo";
import { listProducts } from "@/repositories/productRepo";
import { toUserMessage } from "@/lib/errors";
import { formatDate, formatDateTime, seoulToday } from "@/lib/format";

export const Route = createFileRoute("/staff/production")({
  validateSearch: (s: Record<string, unknown>): { product?: number | undefined } => {
    const n = Number(s["product"]);
    return { product: Number.isInteger(n) && n > 0 ? n : undefined };
  },
  head: () => ({
    meta: [
      { title: "Production — HoleSaler" },
      { name: "description", content: "Record finished production into stock." },
      { property: "og:title", content: "Production — HoleSaler" },
      { property: "og:description", content: "Record finished production into stock." },
    ],
  }),
  component: ProductionPage,
});

function ProductionPage() {
  const { product } = Route.useSearch();
  const qc = useQueryClient();
  const today = seoulToday();
  const [productId, setProductId] = useState(product ? String(product) : "");
  const [qty, setQty] = useState("");
  const [date, setDate] = useState(today);
  const products = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const log = useQuery({ queryKey: ["production"], queryFn: productionLog });
  const names = useQuery({ queryKey: ["staffNames"], queryFn: staffNames });
  const nameOf = new Map((names.data ?? []).map((n) => [n.user_id, n.name]));
  const all = products.data ?? [];
  const productOf = new Map(all.map((p) => [p.product_id, p]));
  const active = all.filter((p) => p.is_active);

  const m = useMutation({
    mutationFn: () => recordProduction({ p_product_id: Number(productId), p_quantity: Number(qty), p_produced_at: date }),
    onSuccess: () => { toast.success("Production recorded"); setQty(""); },
    onError: (e) => toast.error(toUserMessage(e)),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["production"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
  const n = Number(qty);
  const valid = active.some((p) => String(p.product_id) === productId) && Number.isInteger(n) && n > 0 && !!date && date <= today;
  if (log.error) toast.error(toUserMessage(log.error), { id: "prod-error" });

  return (
    <>
      <PageHeader title="Production" description="Record finished production into stock." />
      <div className="panel mb-6 flex flex-wrap items-end gap-4 p-4">
        <div className="min-w-64 flex-1 space-y-1.5">
          <Label>Product</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger><SelectValue placeholder="Choose an active product" /></SelectTrigger>
            <SelectContent>
              {active.map((p) => <SelectItem key={p.product_id} value={String(p.product_id)}>{p.product_code} — {p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-36 space-y-1.5">
          <Label htmlFor="qty">Boxes</Label>
          <Input id="qty" type="number" min={1} step={1} className="text-right tabular-nums" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div className="w-44 space-y-1.5">
          <Label htmlFor="date">Produced on</Label>
          <Input id="date" type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button disabled={!valid || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Saving…" : "Record production"}</Button>
        {date > today && <p className="w-full text-xs text-destructive">The produced date cannot be in the future.</p>}
      </div>

      <h2 className="section-title mb-2">Recent production</h2>
      <div className="panel max-h-[calc(100vh-340px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="num">Boxes</TableHead>
              <TableHead>Produced on</TableHead>
              <TableHead>Recorded at</TableHead>
              <TableHead>Staff</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(log.data ?? []).map((r) => {
              const p = productOf.get(r.product_id);
              return (
                <TableRow key={r.production_id}>
                  <TableCell>{p?.name ?? `#${r.product_id}`} <span className="font-mono text-xs text-muted-foreground">{p?.product_code}</span></TableCell>
                  <TableCell className="num">{r.quantity.toLocaleString("en-US")}</TableCell>
                  <TableCell className="tabular-nums">{formatDate(r.produced_at)}</TableCell>
                  <TableCell className="tabular-nums">{formatDateTime(r.recorded_at)}</TableCell>
                  <TableCell>{nameOf.get(r.operator_id) ?? "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {log.isLoading && <EmptyState>Loading…</EmptyState>}
        {!log.isLoading && (log.data ?? []).length === 0 && <EmptyState>No production recorded yet.</EmptyState>}
      </div>
    </>
  );
}
