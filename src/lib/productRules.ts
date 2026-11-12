export type ProductForm = {
  code: string; name: string; category: string; specification: string;
  unit_price: string; order_unit: string; safety_stock: string;
};

const intIn = (v: string, min: number, max: number) => {
  const n = Number(v);
  return v.trim() !== "" && Number.isInteger(n) && n >= min && n <= max;
};

/** Product field rules for the create/edit dialog. */
export function validateProduct(f: ProductForm, creating: boolean) {
  const e: Partial<Record<keyof ProductForm, string>> = {};
  if (creating && !/^[A-Za-z0-9-]{4,20}$/.test(f.code.trim())) e.code = "4–20 letters, digits or hyphens.";
  if (f.name.trim().length < 1 || f.name.trim().length > 50) e.name = "Enter 1–50 characters.";
  if (!["CUP", "LID", "CONTAINER", "SLEEVE", "OTHER"].includes(f.category)) e.category = "Choose a category.";
  if (f.specification.trim().length > 30) e.specification = "Up to 30 characters.";
  if (!intIn(f.unit_price, 1, 10_000_000)) e.unit_price = "Whole won, 1 to 10,000,000.";
  if (!intIn(f.order_unit, 1, 10_000)) e.order_unit = "1 to 10,000.";
  if (!intIn(f.safety_stock, 0, 10_000)) e.safety_stock = "0 to 10,000.";
  return e;
}
