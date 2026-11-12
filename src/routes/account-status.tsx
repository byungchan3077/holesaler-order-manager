import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AuthFrame, Notice } from "@/components/app/ui";
import { signOut } from "@/repositories/authRepo";

type S = "PENDING" | "REJECTED" | "CLOSED";
const TEXT: Record<S, string> = {
  PENDING: "Your account is awaiting staff approval",
  REJECTED: "Your registration was not approved",
  CLOSED: "This account is closed",
};

export const Route = createFileRoute("/account-status")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { s: S } => ({
    s: s["s"] === "REJECTED" || s["s"] === "CLOSED" ? s["s"] : "PENDING",
  }),
  head: () => ({
    meta: [
      { title: "Account status — HoleSaler" },
      { name: "description", content: "The current status of your HoleSaler retailer account." },
      { property: "og:title", content: "Account status — HoleSaler" },
      { property: "og:description", content: "The current status of your HoleSaler retailer account." },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const { s } = Route.useSearch();
  return (
    <AuthFrame>
      <div className="panel space-y-4 p-6">
        <h1 className="page-title">Account status</h1>
        <Notice kind={s === "PENDING" ? "hint" : "error"}>{TEXT[s]}</Notice>
        <Button asChild variant="secondary" className="w-full">
          <Link to="/login" onClick={() => void signOut()}>{s === "CLOSED" ? "Back to log in" : "Sign out"}</Link>
        </Button>
      </div>
    </AuthFrame>
  );
}
