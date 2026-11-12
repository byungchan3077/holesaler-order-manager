import { supabase, unwrap, type Enums, type Tables } from "./_shared";

export type Product = Tables<"product">;
export type ProductCategory = Enums<"product_category">;

export async function catalogue() {
  return unwrap(await supabase.rpc("catalogue"));
}
export async function listProducts(): Promise<Product[]> {
  return unwrap(await supabase.from("product").select("*").order("product_code"));
}
export async function createProduct(a: { p_code: string; p_name: string; p_category: ProductCategory; p_specification: string; p_unit_price: number; p_order_unit: number; p_safety_stock: number }) {
  return unwrap(await supabase.rpc("create_product", a));
}
export async function updateProduct(a: { p_product_id: number; p_name: string; p_category: ProductCategory; p_specification: string; p_unit_price: number; p_order_unit: number; p_safety_stock: number }) {
  return unwrap(await supabase.rpc("update_product", a));
}
export async function setProductActive(a: { p_product_id: number; p_active: boolean }) {
  return unwrap(await supabase.rpc("set_product_active", a));
}
