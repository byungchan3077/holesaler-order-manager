import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, Notice, PageHeader } from "@/components/app/ui";
import { checkInvariants, staffInventory, staffNames, stockHistory, type StaffInventory } from "@/repositories/inventoryRepo";
import { toUserMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/staff/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — HoleSaler" },
      { name: "description", content: "Stock on hand, committed and orderable per product." },
      { property: "og:title", content: "Inventory — HoleSaler" },
      { property: "og:description", content: "Stock on hand, committed and orderable per product." },
    ],
  }),
  component: InventoryPage,
});

const badge = "inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium";

function InventoryPage() {
  const [warningsOnly, setWarningsOnly] = useState(false);
  const [selected, setSelected] = useState<StaffInventory | null>(null);
  const q = useQuery({ queryKey: ["inventory"], queryFn: staffInventory });
  const check = useMutation({ mutationFn: checkInvariants, onError: (e) => toast.error(toUserMessage(e)) });
  if (q.error) toast.error(toUserMessage(q.error), { id: "inv-error" });
  const rows = (q.data ?? []).filter((p) => !warningsOnly || p.warn_orderable_zero || p.warn_reserve_in_use);

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Stock on hand, committed and orderable per product."
        actions={<Button variant="secondary" disabled={check.isPending} onClick={() => check.mutate()}>{check.isPending ? "Checking…" : "Integrity check"}</Button>}
      />
      {check.data && (
        <div className="mb-3">
          {check.data.length === 0 ? (
            <Notice kind="success">All checks passed</Notice>
          ) : (
            <Notice kind="error">
              <p className="mb-1 font-medium">{check.data.length} check(s) failed</p>
              <ul className="list-disc space-y-0.5 pl-5">
                {check.data.map((c, i) => <li key={i}><span className="font-medium">{c.check_name}</span>: {c.detail}</li>)}
              </ul>
            </Notice>
          )}
        </div>
      )}
      <div className="mb-3 flex items-center gap-2">
        <Switch id="warn" checked={warningsOnly} onCheckedChange={setWarningsOnly} />
        <Label htmlFor="warn">Warnings only</Label>
      </div>
      <div className="panel max-h-[calc(100vh-240px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="num">On hand</TableHead>
              <TableHead className="num">Committed</TableHead>
              <TableHead className="num">Safety stock</TableHead>
              <TableHead className="num">Orderable</TableHead>
              <TableHead>Warnings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.product_id} className={cn("cursor-pointer", !p.is_active && "text-muted-foreground")} onClick={() => setSelected(p)}>
                <TableCell className="font-mono text-xs">{p.product_code}</TableCell>
                <TableCell className="font-medium">{p.name}{!p.is_active && " (inactive)"}</TableCell>
                <TableCell className="num">{p.quantity_on_hand}</TableCell>
                <TableCell className="num">{p.quantity_committed}</TableCell>
                <TableCell className="num">{p.safety_stock}</TableCell>
                <TableCell className="num font-medium">{p.orderable}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {p.warn_orderable_zero && <span className={cn(badge, "border-flag-red text-flag-red")}>Orderable 0: produce more</span>}
                    {p.warn_reserve_in_use && <span className={cn(badge, "border-flag-amber text-flag-amber")}>Reserve in use: check for loss</span>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {q.isLoading && <EmptyState>Loading…</EmptyState>}
        {!q.isLoading && rows.length === 0 && <EmptyState>{warningsOnly ? "No warnings." : "No products yet."}</EmptyState>}
      </div>
      <HistoryDrawer p={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function HistoryDrawer({ p, onClose }: { p: StaffInventory | null; onClose: () => void }) {
  const id = p?.product_id ?? null;
  const h = useQuery({ queryKey: ["inventory", "history", id], queryFn: () => stockHistory(id!), enabled: id != null });
  const names = useQuery({ queryKey: ["staffNames"], queryFn: staffNames });
  const nameOf = new Map((names.data ?? []).map((n) => [n.user_id, n.name]));
  if (h.error) toast.error(toUserMessage(h.error), { id: "history-error" });
  return (
    <Sheet open={!!p} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto bg-background sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="page-title">{p?.name}</SheetTitle>
          <SheetDescription>{p?.product_code} · on hand {p?.quantity_on_hand} · committed {p?.quantity_committed} · orderable {p?.orderable}</SheetDescription>
        </SheetHeader>
        {p && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Button asChild variant="secondary"><Link to="/staff/stock" search={{ product: p.product_id ?? undefined }}>Stocktake</Link></Button>
              <Button asChild><Link to="/staff/production" search={{ product: p.product_id ?? undefined }}>Record production</Link></Button>
            </div>
            <div className="panel overflow-auto">
              <h2 className="section-title px-4 py-3">Stock history</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead className="num">Change</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Staff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(h.data ?? []).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="tabular-nums whitespace-nowrap">{formatDateTime(r.happened_at)}</TableCell>
                      <TableCell>{r.kind}</TableCell>
                      <TableCell className={cn("num font-medium", (r.change ?? 0) < 0 ? "text-flag-red" : "text-success-fg")}>
                        {(r.change ?? 0) > 0 ? `+${r.change}` : r.change}
                      </TableCell>
                      <TableCell>{r.reason || "—"}</TableCell>
                      <TableCell>{(r.actor && nameOf.get(r.actor)) || r.actor || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {h.isLoading && <EmptyState>Loading…</EmptyState>}
              {!h.isLoading && (h.data ?? []).length === 0 && <EmptyState>No stock movements yet.</EmptyState>}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
