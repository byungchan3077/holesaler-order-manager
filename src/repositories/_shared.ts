import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export { supabase };
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Views<T extends keyof Database["public"]["Views"]> = Database["public"]["Views"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

/** Throws the Supabase error so callers (react-query) can show toUserMessage. */
export function unwrap<T>(res: { data: T; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data;
}
