import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, Notice, PageHeader } from "@/components/app/ui";
import { createProduct, listProducts, setProductActive, updateProduct, type Product, type ProductCategory } from "@/repositories/productRepo";
import { toUserMessage } from "@/lib/errors";
import { CATEGORY_LABEL, formatWon } from "@/lib/format";
import { validateProduct, type ProductForm } from "@/lib/productRules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/staff/products")({
  head: () => ({
    meta: [
      { title: "Products — HoleSaler" },
      { name: "description", content: "Create, edit and activate products." },
      { property: "og:title", content: "Products — HoleSaler" },
      { property: "og:description", content: "Create, edit and activate products." },
    ],
  }),
  component: ProductsPage,
});

const DUP = { "23505": "This code or an active product with this name already exists" };

function ProductsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [toggling, setToggling] = useState<Product | null>(null);
  const q = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const toggle = useMutation({
    mutationFn: (p: Product) => setProductActive({ p_product_id: p.product_id, p_active: !p.is_active }),
    onSuccess: (_d, p) => { toast.success(`${p.name} ${p.is_active ? "deactivated" : "activated"}`); setToggling(null); },
    onError: (e) => toast.error(toUserMessage(e, DUP)),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["products"] }); qc.invalidateQueries({ queryKey: ["inventory"] }); },
  });
  if (q.error) toast.error(toUserMessage(q.error), { id: "products-error" });
  const rows = q.data ?? [];

  return (
    <>
      <PageHeader title="Products" description="Create, edit and activate products." actions={<Button onClick={() => setEditing("new")}>New product</Button>} />
      <div className="panel max-h-[calc(100vh-200px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Specification</TableHead>
              <TableHead className="num">Price per box</TableHead>
              <TableHead className="num">Pieces per box</TableHead>
              <TableHead className="num">Safety stock</TableHead>
              <TableHead>Active</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.product_id} className={cn(!p.is_active && "text-muted-foreground")}>
                <TableCell className="font-mono text-xs">{p.product_code}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{CATEGORY_LABEL[p.category]}</TableCell>
                <TableCell>{p.specification || "—"}</TableCell>
                <TableCell className="num">{formatWon(p.unit_price)}</TableCell>
                <TableCell className="num">{p.order_unit.toLocaleString("en-US")}</TableCell>
                <TableCell className="num">{p.safety_stock.toLocaleString("en-US")}</TableCell>
                <TableCell>
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", p.is_active ? "bg-status-green-bg text-status-green" : "bg-status-grey-bg text-status-grey")}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>Edit</Button>{" "}
                  <Button size="sm" variant="secondary" onClick={() => setToggling(p)}>{p.is_active ? "Deactivate" : "Activate"}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {q.isLoading && <EmptyState>Loading…</EmptyState>}
        {!q.isLoading && rows.length === 0 && <EmptyState>No products yet.</EmptyState>}
      </div>

      {editing && <ProductDialog key={editing === "new" ? "new" : editing.product_id} product={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

      <Dialog open={!!toggling} onOpenChange={(o) => !o && setToggling(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{toggling?.is_active ? "Deactivate" : "Activate"} {toggling?.name}?</DialogTitle>
            <DialogDescription>
              {toggling?.is_active ? "Retailers will no longer see it in the catalogue." : "Retailers will see it in the catalogue again."}
            </DialogDescription>
          </DialogHeader>
          <Notice kind="hint">Existing orders keep their prices and can still be paid and shipped.</Notice>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setToggling(null)}>Close</Button>
            <Button disabled={toggle.isPending} onClick={() => toggling && toggle.mutate(toggling)}>{toggling?.is_active ? "Deactivate" : "Activate"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProductDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const qc = useQueryClient();
  const creating = !product;
  const [f, setF] = useState<ProductForm>({
    code: product?.product_code ?? "", name: product?.name ?? "", category: product?.category ?? "",
    specification: product?.specification ?? "", unit_price: product ? String(product.unit_price) : "",
    order_unit: product ? String(product.order_unit) : "", safety_stock: product ? String(product.safety_stock) : "0",
  });
  const [errs, setErrs] = useState<ReturnType<typeof validateProduct>>({});
  const m = useMutation({
    mutationFn: async () => {
      const common = {
        p_name: f.name.trim(), p_category: f.category as ProductCategory, p_specification: f.specification.trim(),
        p_unit_price: Number(f.unit_price), p_order_unit: Number(f.order_unit), p_safety_stock: Number(f.safety_stock),
      };
      return creating ? createProduct({ p_code: f.code.trim(), ...common }) : updateProduct({ p_product_id: product.product_id, ...common });
    },
    onSuccess: () => { toast.success(creating ? "Product created" : "Product saved"); onClose(); },
    onError: (e) => toast.error(toUserMessage(e, DUP)),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["products"] }); qc.invalidateQueries({ queryKey: ["inventory"] }); },
  });
  const field = (k: keyof ProductForm, label: string, opts: { num?: boolean; readOnly?: boolean; max?: number } = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input
        id={k} value={f[k]} readOnly={opts.readOnly} maxLength={opts.max}
        inputMode={opts.num ? "numeric" : undefined}
        className={cn(opts.num && "text-right tabular-nums", opts.readOnly && "bg-muted")}
        onChange={(e) => setF({ ...f, [k]: opts.num ? e.target.value.replace(/[^0-9]/g, "") : e.target.value })}
      />
      {errs[k] && <p className="text-xs text-destructive">{errs[k]}</p>}
    </div>
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{creating ? "New product" : `Edit ${product.name}`}</DialogTitle>
          <DialogDescription>{creating ? "The code cannot be changed later." : "Price changes apply to new orders only."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {field("code", "Code", { readOnly: !creating, max: 20 })}
          {field("name", "Name", { max: 50 })}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
              <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
              <SelectContent>{Object.entries(CATEGORY_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
            {errs.category && <p className="text-xs text-destructive">{errs.category}</p>}
          </div>
          {field("specification", "Specification", { max: 30 })}
          {field("unit_price", "Price per box (₩)", { num: true })}
          {field("order_unit", "Pieces per box", { num: true })}
          {field("safety_stock", "Safety stock (boxes)", { num: true })}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            disabled={m.isPending}
            onClick={() => { const e = validateProduct(f, creating); setErrs(e); if (!Object.keys(e).length) m.mutate(); }}
          >
            {creating ? "Create product" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
