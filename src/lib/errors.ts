type ErrLike = { code?: string; message?: string; name?: string } | null | undefined;

/** Turns a Supabase/database error into a short message for the user. */
export function toUserMessage(error: unknown, overrides: Record<string, string> = {}): string {
  const e = error as ErrLike;
  const message = e?.message ?? (typeof error === "string" ? error : "");
  if (e?.code === "42501") return "You do not have permission for this action";
  if (e?.code === "23505") return "This value is already used";
  if (e?.code === "23514") return "A field is outside its allowed format or range";
  const m = /^([A-Z][A-Z0-9_]*):\s*(.*)$/s.exec(message);
  if (m) return overrides[m[1] ?? ""] ?? (m[2] ?? "").trim();
  if (
    error instanceof TypeError ||
    /failed to fetch|networkerror|network request failed|load failed/i.test(message)
  )
    return "Could not reach the server; try again.";
  return message || "Something went wrong; try again.";
}
