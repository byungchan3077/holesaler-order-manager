import { supabase, unwrap, type Enums, type Tables } from "./_shared";

export type Retailer = Tables<"retailer">;
export type Role = Enums<"user_role">;

export async function currentRole(): Promise<Role | null> {
  return unwrap(await supabase.rpc("current_app_role")) ?? null;
}
export async function myRetailer(): Promise<Retailer> {
  return unwrap(await supabase.from("retailer").select("*").single());
}
/** Name and email of the signed-in user (read-only). */
export async function myProfile(): Promise<{ name: string; email: string } | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const res = await supabase.from("app_user").select("name, email").eq("user_id", u.user.id).maybeSingle();
  if (res.error) throw res.error;
  return res.data;
}
export async function listRetailers(): Promise<Retailer[]> {
  return unwrap(await supabase.from("retailer").select("*").order("created_at", { ascending: false }));
}
export async function registerRetailer(a: { p_company: string; p_contact: string; p_phone: string; p_address: string; p_consent: boolean }) {
  return unwrap(await supabase.rpc("register_retailer", a));
}
export async function decideRegistration(a: { p_retailer_id: number; p_approve: boolean }) {
  return unwrap(await supabase.rpc("decide_registration", a));
}
export async function updateRetailer(a: { p_retailer_id: number; p_company: string; p_contact: string; p_phone: string; p_address: string }) {
  return unwrap(await supabase.rpc("update_retailer", a));
}
export async function closeRetailer(a: { p_retailer_id: number }) {
  return unwrap(await supabase.rpc("close_retailer", a));
}
