import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFrame, Notice } from "@/components/app/ui";
import { signIn } from "@/repositories/authRepo";
import { toUserMessage } from "@/lib/errors";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — HoleSaler" },
      { name: "description", content: "Log in to HoleSaler to order packaging or manage operations." },
      { property: "og:title", content: "Log in — HoleSaler" },
      { property: "og:description", content: "Log in to HoleSaler to order packaging or manage operations." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate({ to: "/" });
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame>
      <form onSubmit={submit} className="panel space-y-4 p-6">
        <div>
          <h1 className="page-title">Log in</h1>
          <p className="text-muted-foreground">Use the email you registered with.</p>
        </div>
        {error && <Notice kind="error">{error}</Notice>}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </Button>
        <p className="text-center text-muted-foreground">
          New retailer?{" "}
          <Link to="/register" search={{ step: 1 }} className="font-medium text-foreground underline">
            Register
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
