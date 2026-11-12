const TZ = "Asia/Seoul";

function parts(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

/** YYYY-MM-DD in Asia/Seoul. Plain date strings (YYYY-MM-DD) pass through. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return parts(value).date;
}

/** YYYY-MM-DD HH:mm in Asia/Seoul. */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const p = parts(value);
  return `${p.date} ${p.time}`;
}

export function formatWon(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value < 0 ? "-" : ""}₩${Math.abs(value).toLocaleString("en-US")}`;
}

export function formatBoxes(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toLocaleString("en-US")} boxes`;
}

export const ORDER_STATUS_LABEL = {
  PENDING_PAYMENT: "Awaiting payment",
  READY_TO_SHIP: "Preparing shipment",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS_LABEL;

/** Today's date in Asia/Seoul as YYYY-MM-DD. */
export function seoulToday(): string {
  return formatDate(new Date());
}
/** Adds days to a YYYY-MM-DD date. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const CATEGORY_LABEL = {
  CUP: "Cup",
  LID: "Lid",
  CONTAINER: "Container",
  SLEEVE: "Sleeve",
  OTHER: "Other",
} as const;

export const REFUND_REASON_LABEL: Record<string, string> = {
  ORDER_CANCELLED: "Order cancelled",
  RETURN: "Return",
  TRANSIT_ISSUE: "Transit issue",
  OVERCHARGE: "Overcharge",
};
