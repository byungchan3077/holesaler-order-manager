import { describe, expect, it } from "vitest";
import { validateProduct } from "./productRules";

const ok = { code: "CUP-12", name: "Cup", category: "CUP", specification: "", unit_price: "1", order_unit: "1", safety_stock: "0" };

describe("validateProduct", () => {
  it("accepts a valid product", () => expect(validateProduct(ok, true)).toEqual({}));
  it("code needs 4-20 letters, digits or hyphens", () => {
    expect(validateProduct({ ...ok, code: "AB1" }, true).code).toBeDefined();
    expect(validateProduct({ ...ok, code: "AB_1" }, true).code).toBeDefined();
  });
  it("code is not checked when editing", () => expect(validateProduct({ ...ok, code: "x" }, false).code).toBeUndefined());
  it("price per box 1 to 10,000,000", () => {
    expect(validateProduct({ ...ok, unit_price: "0" }, true).unit_price).toBeDefined();
    expect(validateProduct({ ...ok, unit_price: "10000001" }, true).unit_price).toBeDefined();
    expect(validateProduct({ ...ok, unit_price: "10000000" }, true).unit_price).toBeUndefined();
  });
  it("pieces per box 1 to 10,000", () => expect(validateProduct({ ...ok, order_unit: "10001" }, true).order_unit).toBeDefined());
  it("safety stock 0 to 10,000", () => expect(validateProduct({ ...ok, safety_stock: "-1" }, true).safety_stock).toBeDefined());
  it("specification up to 30", () => expect(validateProduct({ ...ok, specification: "x".repeat(31) }, true).specification).toBeDefined());
});
