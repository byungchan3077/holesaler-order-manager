import { supabase, unwrap, type Enums, type Views } from "./_shared";

export type OrderOverview = Views<"order_overview">;
export type OrderFilters = { status?: Enums<"order_status">; retailerId?: number; from?: string; to?: string; unpaidOnly?: boolean; refundNeededOnly?: boolean };

export async function listOrders(f: OrderFilters = {}): Promise<OrderOverview[]> {
  let q = supabase.from("order_overview").select("*").order("ordered_at", { ascending: false });
  if (f.status) q = q.eq("status", f.status);
  if (f.retailerId) q = q.eq("retailer_id", f.retailerId);
  if (f.from) q = q.gte("ordered_at", `${f.from}T00:00:00+09:00`);
  if (f.to) q = q.lte("ordered_at", `${f.to}T23:59:59.999+09:00`);
  if (f.unpaidOnly) q = q.eq("unpaid_flag", true);
  if (f.refundNeededOnly) q = q.eq("refund_needed", true);
  return unwrap(await q);
}
export async function getOrder(id: number) {
  return unwrap(
    await supabase
      .from("purchase_order")
      .select("*, order_item(*, product(name, product_code)), shipment(*), payment(*)")
      .eq("order_id", id)
      .single(),
  );
}
export async function placeOrder(lines: { product_id: number; quantity: number }[]) {
  return unwrap(await supabase.rpc("place_order", { p_lines: lines }));
}
export async function cancelOrder(a: { p_order_id: number; p_reason: string }) {
  return unwrap(await supabase.rpc("cancel_order", a));
}
export async function shipOrder(a: { p_order_id: number; p_tracking_ref: string }) {
  return unwrap(await supabase.rpc("ship_order", a));
}
