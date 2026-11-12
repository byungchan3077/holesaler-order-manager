import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Destructive action that needs a typed reason and a confirmation. */
export function ReasonDialog({
  label, title, description, warning, confirmLabel, onConfirm, pending, size,
}: {
  label: string; title: string; description?: ReactNode; warning?: ReactNode; confirmLabel: string;
  onConfirm: (reason: string) => Promise<unknown>; pending?: boolean; size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setReason(""); }}>
      <DialogTrigger asChild>
        <Button variant="destructive" size={size ?? "default"}>{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {warning && <div className="error-box">{warning}</div>}
        <div className="space-y-1.5">
          <Label htmlFor="reason">Reason (required)</Label>
          <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Keep</Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || pending}
            onClick={async () => {
              try { await onConfirm(reason.trim()); setOpen(false); setReason(""); } catch { /* toast shown by caller */ }
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
