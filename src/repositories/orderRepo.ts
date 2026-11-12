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
export type OrderDetail = Awaited<ReturnType<typeof getOrder>>;

/** Orders of one status with retailer, lines, shipment and payments (read-only). */
export async function listOrderDetails(status: Enums<"order_status">, opts: { ascending?: boolean; limit?: number } = {}) {
  let q = supabase
    .from("purchase_order")
    .select("*, retailer(company_name), order_item(*, product(name, product_code)), shipment(*), payment(*)")
    .eq("status", status)
    .order("ordered_at", { ascending: opts.ascending ?? true });
  if (opts.limit) q = q.limit(opts.limit);
  return unwrap(await q);
}
export type OrderWithDetails = Awaited<ReturnType<typeof listOrderDetails>>[number];

export async function placeOrder(lines: { product_id: number; quantity: number }[]) {
  return unwrap(await supabase.rpc("place_order", { p_lines: lines }));
}
export async function cancelOrder(orderId: number, reason?: string) {
  return unwrap(await supabase.rpc("cancel_order", reason ? { p_order_id: orderId, p_reason: reason } : { p_order_id: orderId }));
}
export async function shipOrder(orderId: number, trackingRef: string) {
  return unwrap(await supabase.rpc("ship_order", { p_order_id: orderId, p_tracking_ref: trackingRef }));
}
