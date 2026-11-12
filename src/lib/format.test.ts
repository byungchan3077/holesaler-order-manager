import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatWon } from "./format";

describe("format", () => {
  it("money as won with separators", () => expect(formatWon(52000)).toBe("₩52,000"));
  it("dates in Seoul time", () => expect(formatDate("2026-01-01T16:00:00Z")).toBe("2026-01-02"));
  it("times as HH:mm in Seoul", () => expect(formatDateTime("2026-01-01T16:05:00Z")).toBe("2026-01-02 01:05"));
});
