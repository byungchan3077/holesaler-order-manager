import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, Notice, PageHeader } from "@/components/app/ui";
import { adjustStock, staffInventory, type StaffInventory } from "@/repositories/inventoryRepo";
import { listOrderDetails } from "@/repositories/orderRepo";
import { errorCode, toUserMessage } from "@/lib/errors";
import { ADJUSTMENT_REASON_LABEL, formatDate } from "@/lib/format";
import type { Enums } from "@/repositories/_shared";

type ReasonType = Enums<"adjustment_reason">;

export const Route = createFileRoute("/staff/stock")({
  validateSearch: (s: Record<string, unknown>): { product?: number | undefined; mode?: "return" | undefined; order?: number | undefined } => {
    const num = (v: unknown) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : undefined; };
    return { product: num(s["product"]), mode: s["mode"] === "return" ? "return" : undefined, order: num(s["order"]) };
  },
  head: () => ({
    meta: [
      { title: "Stock adjustment — HoleSaler" },
      { name: "description", content: "Correct stock for loss, damage, miscounts and returns." },
      { property: "og:title", content: "Stock adjustment — HoleSaler" },
      { property: "og:description", content: "Correct stock for loss, damage, miscounts and returns." },
    ],
  }),
  component: StockPage,
});

const NEG: ReasonType[] = ["LOSS", "DAMAGE", "MISCOUNT", "CORRECTION"];
const POS: ReasonType[] = ["FOUND", "MISCOUNT", "CORRECTION"];

function useAdjust(onDone: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adjustStock,
    onSuccess: () => { toast.success("Stock adjusted"); onDone(); },
    onError: (err) => {
      if (errorCode(err) === "BELOW_COMMITTED") {
        toast.error(
          <span>
            {toUserMessage(err)}{" "}
            <Link to="/staff/orders" className="font-medium underline">Review orders</Link>
          </span>,
        );
      } else toast.error(toUserMessage(err));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

function StockPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/staff/stock" });
  const inv = useQuery({ queryKey: ["inventory"], queryFn: staffInventory });
  if (inv.error) toast.error(toUserMessage(inv.error), { id: "inv-error" });
  const product = (inv.data ?? []).find((p) => p.product_id === search.product);

  return (
    <>
      <PageHeader title="Stock adjustment" description="Correct stock for loss, damage, miscounts and returns." />
      <Tabs defaultValue={search.mode === "return" ? "return" : "stocktake"}>
        <TabsList className="mb-3">
          <TabsTrigger value="stocktake">Stocktake</TabsTrigger>
          <TabsTrigger value="change">Change</TabsTrigger>
          <TabsTrigger value="return">Returned goods</TabsTrigger>
        </TabsList>
        <TabsContent value="stocktake">
          <ProductPicker inv={inv.data ?? []} product={product} onPick={(id) => navigate({ search: (p) => ({ ...p, product: id }) })}>
            {product && <StocktakeForm key={product.product_id} p={product} />}
          </ProductPicker>
        </TabsContent>
        <TabsContent value="change">
          <ProductPicker inv={inv.data ?? []} product={product} onPick={(id) => navigate({ search: (p) => ({ ...p, product: id }) })}>
            {product && <ChangeForm key={product.product_id} p={product} />}
          </ProductPicker>
        </TabsContent>
        <TabsContent value="return">
          <ReturnForm initialOrder={search.order} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function ProductPicker({ inv, product, onPick, children }: { inv: StaffInventory[]; product?: StaffInventory | undefined; onPick: (id: number) => void; children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="panel space-y-4 p-4">
        <div className="space-y-1.5">
          <Label>Product</Label>
          <Select value={product ? String(product.product_id) : ""} onValueChange={(v) => onPick(Number(v))}>
            <SelectTrigger><SelectValue placeholder="Choose a product" /></SelectTrigger>
            <SelectContent>
              {inv.map((p) => (
                <SelectItem key={p.product_id} value={String(p.product_id)}>{p.product_code} — {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {product && (
          <dl className="grid grid-cols-3 gap-3">
            <div><dt className="text-muted-foreground">On hand</dt><dd className="text-lg font-semibold tabular-nums">{product.quantity_on_hand}</dd></div>
            <div><dt className="text-muted-foreground">Committed</dt><dd className="text-lg font-semibold tabular-nums">{product.quantity_committed}</dd></div>
            <div><dt className="text-muted-foreground">Safety stock</dt><dd className="text-lg font-semibold tabular-nums">{product.safety_stock}</dd></div>
          </dl>
        )}
        {product && <Notice kind="hint">Committed to orders: stock cannot go below this ({product.quantity_committed} boxes).</Notice>}
      </div>
      <div className="panel p-4">{product ? children : <EmptyState>Choose a product to adjust.</EmptyState>}</div>
    </div>
  );
}

function ReasonFields({ diff, type, setType, text, setText }: { diff: number; type: ReasonType | ""; setType: (t: ReasonType) => void; text: string; setText: (s: string) => void }) {
  const options = diff < 0 ? NEG : diff > 0 ? POS : [];
  return (
    <>
      <div className="space-y-1.5">
        <Label>Reason type</Label>
        <Select value={options.includes(type as ReasonType) ? type : ""} onValueChange={(v) => setType(v as ReasonType)} disabled={!options.length}>
          <SelectTrigger><SelectValue placeholder={options.length ? "Choose" : "Enter a change first"} /></SelectTrigger>
          <SelectContent>{options.map((r) => <SelectItem key={r} value={r}>{ADJUSTMENT_REASON_LABEL[r]}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reason">Reason <span className="text-muted-foreground">({text.trim().length}/200)</span></Label>
        <Textarea id="reason" rows={2} maxLength={200} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
    </>
  );
}

const reasonOk = (diff: number, type: ReasonType | "", text: string) =>
  !!type && (diff < 0 ? NEG : POS).includes(type) && text.trim().length >= 1 && text.trim().length <= 200;

function StocktakeForm({ p }: { p: StaffInventory }) {
  const [counted, setCounted] = useState("");
  const [type, setType] = useState<ReasonType | "">("");
  const [text, setText] = useState("");
  const m = useAdjust(() => { setCounted(""); setType(""); setText(""); });
  const n = Number(counted);
  const countedOk = counted !== "" && Number.isInteger(n) && n >= 0;
  const diff = countedOk ? n - (p.quantity_on_hand ?? 0) : 0;
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="counted">Counted boxes</Label>
        <Input id="counted" type="number" min={0} step={1} className="text-right tabular-nums" value={counted} onChange={(e) => setCounted(e.target.value)} />
      </div>
      <div className="flex justify-between rounded-md bg-muted px-3 py-2">
        <span>Difference (counted − on hand)</span>
        <span className="font-semibold tabular-nums">{countedOk ? (diff > 0 ? `+${diff}` : diff) : "—"}</span>
      </div>
      {countedOk && diff === 0 && <Notice kind="hint">The count matches; nothing to adjust.</Notice>}
      <ReasonFields diff={diff} type={type} setType={setType} text={text} setText={setText} />
      <div className="flex justify-end">
        <Button
          disabled={!countedOk || diff === 0 || !reasonOk(diff, type, text) || m.isPending}
          onClick={() => m.mutate({ p_product_id: p.product_id!, p_reason_type: type as ReasonType, p_reason: text.trim(), p_counted_quantity: n })}
        >
          Save stocktake
        </Button>
      </div>
    </div>
  );
}

function ChangeForm({ p }: { p: StaffInventory }) {
  const [delta, setDelta] = useState("");
  const [type, setType] = useState<ReasonType | "">("");
  const [text, setText] = useState("");
  const m = useAdjust(() => { setDelta(""); setType(""); setText(""); });
  const n = Number(delta);
  const ok = delta.trim() !== "" && Number.isInteger(n) && n !== 0;
  const diff = ok ? n : 0;
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="delta">Change in boxes (e.g. -3 or 5)</Label>
        <Input id="delta" type="number" step={1} className="text-right tabular-nums" value={delta} onChange={(e) => setDelta(e.target.value)} />
      </div>
      {ok && <p className="text-muted-foreground">On hand after: <span className="font-medium tabular-nums text-foreground">{(p.quantity_on_hand ?? 0) + n}</span></p>}
      <ReasonFields diff={diff} type={type} setType={setType} text={text} setText={setText} />
      <div className="flex justify-end">
        <Button
          disabled={!ok || !reasonOk(diff, type, text) || m.isPending}
          onClick={() => m.mutate({ p_product_id: p.product_id!, p_reason_type: type as ReasonType, p_reason: text.trim(), p_quantity_delta: n })}
        >
          Save change
        </Button>
      </div>
    </div>
  );
}

function ReturnForm({ initialOrder }: { initialOrder?: number | undefined }) {
  const orders = useQuery({ queryKey: ["orders", "details", "SHIPPED", "all"], queryFn: () => listOrderDetails("SHIPPED", { ascending: false }) });
  const [orderId, setOrderId] = useState(initialOrder ? String(initialOrder) : "");
  const [itemId, setItemId] = useState("");
  const [boxes, setBoxes] = useState("");
  const [text, setText] = useState("");
  const m = useAdjust(() => { setBoxes(""); setText(""); });
  const order = (orders.data ?? []).find((o) => String(o.order_id) === orderId);
  const item = order?.order_item.find((i) => String(i.order_item_id) === itemId);
  const n = Number(boxes);
  const valid = !!item && Number.isInteger(n) && n > 0 && text.trim().length >= 1 && text.trim().length <= 200;
  return (
    <div className="panel max-w-2xl space-y-3 p-4">
      <Notice kind="hint">Record only boxes that came back in sellable condition. They go back into stock.</Notice>
      <div className="space-y-1.5">
        <Label>Shipped order</Label>
        <Select value={orderId} onValueChange={(v) => { setOrderId(v); setItemId(""); }}>
          <SelectTrigger><SelectValue placeholder={orders.isLoading ? "Loading…" : "Choose an order"} /></SelectTrigger>
          <SelectContent>
            {(orders.data ?? []).map((o) => (
              <SelectItem key={o.order_id} value={String(o.order_id)}>
                #{o.order_id} — {o.retailer?.company_name} · shipped {formatDate(o.shipment?.shipped_at)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {initialOrder && !orders.isLoading && !order && <p className="text-xs text-destructive">Order #{initialOrder} is not a shipped order.</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Line</Label>
        <Select value={itemId} onValueChange={setItemId} disabled={!order}>
          <SelectTrigger><SelectValue placeholder="Choose a line" /></SelectTrigger>
          <SelectContent>
            {order?.order_item.map((i) => (
              <SelectItem key={i.order_item_id} value={String(i.order_item_id)}>
                {i.product?.name} ({i.product?.product_code}) — {i.quantity} boxes shipped
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="boxes">Sellable boxes returned</Label>
        <Input id="boxes" type="number" min={1} step={1} className="text-right tabular-nums" value={boxes} onChange={(e) => setBoxes(e.target.value)} disabled={!item} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rtext">Reason <span className="text-muted-foreground">({text.trim().length}/200)</span></Label>
        <Textarea id="rtext" rows={2} maxLength={200} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button
          disabled={!valid || m.isPending}
          onClick={() =>
            m.mutate({ p_product_id: item!.product_id, p_reason_type: "RETURN", p_reason: text.trim(), p_quantity_delta: n, p_order_item_id: item!.order_item_id })
          }
        >
          Record returned goods
        </Button>
      </div>
    </div>
  );
}
