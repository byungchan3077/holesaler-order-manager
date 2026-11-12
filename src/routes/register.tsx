import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { AuthFrame, Notice } from "@/components/app/ui";
import { currentUser, signUp } from "@/repositories/authRepo";
import { currentRole, registerRetailer } from "@/repositories/accountRepo";
import { toUserMessage } from "@/lib/errors";

export const Route = createFileRoute("/register")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { step?: 1 | 2 | undefined } => ({
    step: Number(s["step"]) === 2 ? 2 : Number(s["step"]) === 1 ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Register — HoleSaler" },
      { name: "description", content: "Register your retail business to order packaging from HoleSaler." },
      { property: "og:title", content: "Register — HoleSaler" },
      { property: "og:description", content: "Register your retail business to order packaging from HoleSaler." },
    ],
  }),
  component: RegisterPage,
});

export const CONSENT_TEXT =
  "Your contact person, phone, address, and email are used for ordering and delivery. Order and payment records are kept for 5 years.";

function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | "confirm" | "done">(1);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const user = await currentUser();
      if (!user) return;
      const role = await currentRole();
      if (role) navigate({ to: "/" });
      else setStep(2);
    })();
  }, [navigate]);

  return (
    <AuthFrame>
      {step === 1 && <StepAccount onDone={(hasSession) => setStep(hasSession ? 2 : "confirm")} />}
      {step === 2 && <StepCompany onDone={() => setStep("done")} />}
      {step === "confirm" && (
        <div className="panel space-y-4 p-6">
          <h1 className="page-title">Check your inbox</h1>
          <Notice kind="success">Confirm your email, then log in.</Notice>
          <Button asChild className="w-full"><Link to="/login">Go to log in</Link></Button>
        </div>
      )}
      {step === "done" && (
        <div className="panel space-y-4 p-6">
          <h1 className="page-title">Thank you</h1>
          <Notice kind="success">Registration received. Staff will approve your account.</Notice>
          <Button asChild variant="secondary" className="w-full"><Link to="/">Continue</Link></Button>
        </div>
      )}
    </AuthFrame>
  );
}

function StepAccount({ onDone }: { onDone: (hasSession: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="panel space-y-4 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          onDone((await signUp(email, password)).hasSession);
        } catch (err) {
          setError(toUserMessage(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <p className="text-xs text-muted-foreground">Step 1 of 2</p>
        <h1 className="page-title">Create your account</h1>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating…" : "Continue"}</Button>
      <p className="text-center text-muted-foreground">
        Already registered? <Link to="/login" className="font-medium text-foreground underline">Log in</Link>
      </p>
    </form>
  );
}

function validate(f: { company: string; contact: string; phone: string; address: string; consent: boolean }) {
  const errs: Partial<Record<"company" | "contact" | "phone" | "address" | "consent", string>> = {};
  const c = f.company.trim(), p = f.contact.trim(), a = f.address.trim(), ph = f.phone.trim();
  if (c.length < 1 || c.length > 100) errs.company = "Enter 1–100 characters.";
  if (p.length < 1 || p.length > 50) errs.contact = "Enter 1–50 characters.";
  if (!/^[0-9+\- ]{7,20}$/.test(ph)) errs.phone = "7–20 characters: digits, +, - or space.";
  if (a.length < 1 || a.length > 200) errs.address = "Enter 1–200 characters.";
  if (!f.consent) errs.consent = "Consent is required to register.";
  return errs;
}

function StepCompany({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ company: "", contact: "", phone: "", address: "", consent: false });
  const [errs, setErrs] = useState<ReturnType<typeof validate>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const field = (k: "company" | "contact" | "phone", label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      {errs[k] && <p className="text-xs text-destructive">{errs[k]}</p>}
    </div>
  );
  return (
    <form
      className="panel space-y-4 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const v = validate(f);
        setErrs(v);
        if (Object.keys(v).length) return;
        setBusy(true);
        setError(null);
        try {
          await registerRetailer({
            p_company: f.company.trim(), p_contact: f.contact.trim(), p_phone: f.phone.trim(),
            p_address: f.address.trim(), p_consent: f.consent,
          });
          onDone();
        } catch (err) {
          setError(toUserMessage(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <p className="text-xs text-muted-foreground">Step 2 of 2</p>
        <h1 className="page-title">Business details</h1>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      {field("company", "Company name")}
      {field("contact", "Contact person")}
      {field("phone", "Phone")}
      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" rows={2} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
        {errs.address && <p className="text-xs text-destructive">{errs.address}</p>}
      </div>
      <div className="hint-box flex gap-2">
        <Checkbox id="consent" checked={f.consent} onCheckedChange={(v) => setF({ ...f, consent: v === true })} />
        <Label htmlFor="consent" className="font-normal leading-snug">{CONSENT_TEXT}</Label>
      </div>
      {errs.consent && <p className="text-xs text-destructive">{errs.consent}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Submitting…" : "Submit registration"}</Button>
    </form>
  );
}
