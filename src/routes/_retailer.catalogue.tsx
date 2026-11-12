import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader } from "@/components/app/ui";
import { catalogue } from "@/repositories/productRepo";
import { useCart } from "@/lib/cart";
import { toUserMessage } from "@/lib/errors";
import { CATEGORY_LABEL, formatWon } from "@/lib/format";

export const Route = createFileRoute("/_retailer/catalogue")({
  head: () => ({
    meta: [
      { title: "Catalogue — HoleSaler" },
      { name: "description", content: "Browse products and order by the box." },
      { property: "og:title", content: "Catalogue — HoleSaler" },
      { property: "og:description", content: "Browse products and order by the box." },
    ],
  }),
  component: CataloguePage,
});

type Item = Awaited<ReturnType<typeof catalogue>>[number];

function CataloguePage() {
  const q = useQuery({ queryKey: ["catalogue"], queryFn: catalogue });
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  if (q.error) toast.error(toUserMessage(q.error), { id: "catalogue-error" });

  const term = search.trim().toLowerCase();
  const rows = (q.data ?? []).filter(
    (p) =>
      (category === "ALL" || p.category === category) &&
      (!term || p.name.toLowerCase().includes(term) || p.product_code.toLowerCase().includes(term)),
  );

  return (
    <>
      <PageHeader title="Catalogue" description="Browse products and order by the box." />
      <div className="mb-3 flex flex-wrap gap-3">
        <Input className="w-64 bg-card" placeholder="Search name or code" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="panel max-h-[calc(100vh-220px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Specification</TableHead>
              <TableHead className="num">Price per box</TableHead>
              <TableHead className="num">Pieces per box</TableHead>
              <TableHead className="num">Orderable boxes</TableHead>
              <TableHead className="w-56">Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => <CatalogueRow key={p.product_id} p={p} />)}
          </TableBody>
        </Table>
        {q.isLoading && <EmptyState>Loading…</EmptyState>}
        {!q.isLoading && rows.length === 0 && <EmptyState>No products match.</EmptyState>}
      </div>
    </>
  );
}

function CatalogueRow({ p }: { p: Item }) {
  const cart = useCart();
  const [qty, setQty] = useState("1");
  const inCart = cart.lines.find((l) => l.product_id === p.product_id)?.quantity ?? 0;
  const max = p.orderable_boxes - inCart;
  const n = Number(qty);
  const valid = Number.isInteger(n) && n >= 1 && n <= max;
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{p.product_code}</TableCell>
      <TableCell className="font-medium">{p.name}</TableCell>
      <TableCell>{CATEGORY_LABEL[p.category]}</TableCell>
      <TableCell className="text-muted-foreground">{p.specification}</TableCell>
      <TableCell className="num">{formatWon(p.unit_price)}</TableCell>
      <TableCell className="num">{p.order_unit.toLocaleString("en-US")}</TableCell>
      <TableCell className="num">{p.orderable_boxes.toLocaleString("en-US")}</TableCell>
      <TableCell>
        {p.orderable_boxes <= 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Out of stock</span>
            <Button size="sm" disabled>Add to order</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="number" min={1} max={Math.max(max, 1)} step={1} value={qty}
              onChange={(e) => setQty(e.target.value)} className="h-8 w-20 text-right tabular-nums"
              aria-label={`Boxes of ${p.name}`}
            />
            <Button
              size="sm"
              disabled={!valid}
              onClick={() => {
                cart.add({ product_id: p.product_id, product_code: p.product_code, name: p.name, unit_price: p.unit_price, quantity: n });
                toast.success(`Added ${n} boxes of ${p.name}`);
                setQty("1");
              }}
            >
              Add to order
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
