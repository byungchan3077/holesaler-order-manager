import { currentRole, myRetailer } from "@/repositories/accountRepo";
import { currentUser, signOut } from "@/repositories/authRepo";

export type Destination =
  | { to: "/login" }
  | { to: "/staff/orders" }
  | { to: "/catalogue" }
  | { to: "/register"; step2: true }
  | { to: "/account-status"; status: "PENDING" | "REJECTED" | "CLOSED" };

/** Where a visitor belongs, based on their session, role and retailer status. */
export async function resolveDestination(): Promise<Destination> {
  const user = await currentUser();
  if (!user) return { to: "/login" };
  const role = await currentRole();
  if (role === "STAFF") return { to: "/staff/orders" };
  if (role !== "RETAILER") return { to: "/register", step2: true };
  const r = await myRetailer();
  if (r.status === "ACTIVE") return { to: "/catalogue" };
  if (r.status === "CLOSED") await signOut();
  return { to: "/account-status", status: r.status };
}
