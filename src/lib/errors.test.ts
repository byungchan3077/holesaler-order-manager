import { describe, expect, it } from "vitest";
import { toUserMessage } from "./errors";

describe("toUserMessage", () => {
  it("maps permission errors", () => {
    expect(toUserMessage({ code: "42501", message: "x" })).toBe("You do not have permission for this action");
  });
  it("maps unique violations", () => {
    expect(toUserMessage({ code: "23505", message: "x" })).toBe("This value is already used");
  });
  it("maps check violations", () => {
    expect(toUserMessage({ code: "23514", message: "x" })).toBe("A field is outside its allowed format or range");
  });
  it("shows text after CODE: by default", () => {
    expect(toUserMessage({ code: "P0001", message: "OUT_OF_STOCK: Not enough stock" })).toBe("Not enough stock");
  });
  it("uses an override for the CODE", () => {
    expect(toUserMessage({ message: "OUT_OF_STOCK: x" }, { OUT_OF_STOCK: "Sold out" })).toBe("Sold out");
  });
  it("maps network failures", () => {
    expect(toUserMessage(new TypeError("Failed to fetch"))).toBe("Could not reach the server; try again.");
  });
});
