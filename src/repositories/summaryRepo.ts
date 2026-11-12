import { supabase, unwrap } from "./_shared";

export type Grain = "day" | "week" | "month";
export async function summary(grain: Grain, from: string, to: string) {
  return unwrap(await supabase.rpc("summary", { p_grain: grain, p_from: from, p_to: to }));
}
