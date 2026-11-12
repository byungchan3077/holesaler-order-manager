import { supabase, unwrap, type Enums, type Tables } from "./_shared";

export type Payment = Tables<"payment">;

export async function listPayments(orderId?: number): Promise<Payment[]> {
  let q = supabase.from("payment").select("*").order("transacted_at", { ascending: false });
  if (orderId) q = q.eq("order_id", orderId);
  return unwrap(await q);
}
export async function confirmPayment(a: { p_order_id: number; p_amount: number; p_method: string; p_transacted_at?: string }) {
  return unwrap(await supabase.rpc("confirm_payment", a));
}
export async function cancelPayment(a: { p_payment_id: number; p_reason: string }) {
  return unwrap(await supabase.rpc("cancel_payment", a));
}
export async function recordRefund(a: { p_order_id: number; p_reason: Enums<"refund_reason">; p_method: string; p_amount: number; p_order_item_id?: number; p_quantity?: number; p_transacted_at?: string }) {
  return unwrap(await supabase.rpc("record_refund", a));
}
export async function cancelRefund(a: { p_payment_id: number; p_reason: string }) {
  return unwrap(await supabase.rpc("cancel_refund", a));
}
