import { supabase, unwrap, type Enums, type Tables, type Views } from "./_shared";

export type StaffInventory = Views<"staff_inventory">;
export type StockHistory = Views<"stock_history">;
export type ProductionLog = Tables<"production_log">;

export async function staffInventory(): Promise<StaffInventory[]> {
  return unwrap(await supabase.from("staff_inventory").select("*").order("product_code"));
}
export async function stockHistory(productId: number): Promise<StockHistory[]> {
  return unwrap(await supabase.from("stock_history").select("*").eq("product_id", productId).order("happened_at", { ascending: false }));
}
export async function productionLog(): Promise<ProductionLog[]> {
  return unwrap(await supabase.from("production_log").select("*").order("recorded_at", { ascending: false }));
}
export async function staffNames(): Promise<{ user_id: string; name: string }[]> {
  return unwrap(await supabase.from("app_user").select("user_id, name"));
}
export async function recordProduction(a: { p_product_id: number; p_quantity: number; p_produced_at: string }) {
  return unwrap(await supabase.rpc("record_production", a));
}
export async function adjustStock(a: { p_product_id: number; p_reason_type: Enums<"adjustment_reason">; p_reason: string; p_counted_quantity?: number; p_quantity_delta?: number; p_order_item_id?: number }) {
  return unwrap(await supabase.rpc("adjust_stock", a));
}
export async function checkInvariants() {
  return unwrap(await supabase.rpc("check_invariants"));
}
