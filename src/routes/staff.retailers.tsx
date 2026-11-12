import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageHeader } from "@/components/app/ui";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { closeRetailer, decideRegistration, listRetailers, updateRetailer, type Retailer } from "@/repositories/accountRepo";
import { toUserMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { validateRetailer } from "@/lib/retailerRules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/staff/retailers")({
  head: () => ({
    meta: [
      { title: "Retailers — HoleSaler" },
      { name: "description", content: "Approve registrations and manage retailer accounts." },
      { property: "og:title", content: "Retailers — HoleSaler" },
      { property: "og:description", content: "Approve registrations and manage retailer accounts." },
    ],
  }),
  component: RetailersPage,
});

type Status = Retailer["status"];
const STATUS: Record<Status, [string, string]> = {
  PENDING: ["Pending", "bg-status-amber-bg text-status-amber"],
  ACTIVE: ["Active", "bg-status-green-bg text-status-green"],
  REJECTED: ["Rejected", "bg-status-grey-bg text-status-grey"],
  CLOSED: ["Closed", "bg-status-grey-bg text-status-grey"],
};

function RetailersPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<"ALL" | Status>("ALL");
  const [editing, setEditing] = useState<Retailer | null>(null);
  const q = useQuery({ queryKey: ["retailers"], queryFn: listRetailers });
  const done = () => qc.invalidateQueries({ queryKey: ["retailers"] });
  const decide = useMutation({
    mutationFn: (a: { id: number; approve: boolean }) => decideRegistration({ p_retailer_id: a.id, p_approve: a.approve }),
    onSuccess: (_d, a) => toast.success(a.approve ? "Registration approved" : "Registration rejected"),
    onError: (e) => toast.error(toUserMessage(e)),
    onSettled: done,
  });
  const close = useMutation({
    mutationFn: (id: number) => closeRetailer({ p_retailer_id: id }),
    onSuccess: () => toast.success("Account closed and anonymized"),
    onError: (e) => toast.error(toUserMessage(e, { OPEN_ORDERS: "Finish or cancel this retailer's open orders first." })),
    onSettled: done,
  });
  if (q.error) toast.error(toUserMessage(q.error), { id: "retailers-error" });
  const rows = (q.data ?? [])
    .filter((r) => status === "ALL" || r.status === status)
    .sort((a, b) => (a.status === "PENDING" ? 0 : 1) - (b.status === "PENDING" ? 0 : 1) || b.created_at.localeCompare(a.created_at));

  return (
    <>
      <PageHeader title="Retailers" description="Approve registrations and manage retailer accounts." />
      <div className="mb-3">
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {Object.entries(STATUS).map(([v, [l]]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="panel max-h-[calc(100vh-220px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Decided</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.retailer_id} className={cn(r.status === "CLOSED" && "text-muted-foreground")}>
                <TableCell className="font-medium">{r.company_name}</TableCell>
                <TableCell>{r.contact_person}</TableCell>
                <TableCell className="tabular-nums">{r.phone}</TableCell>
                <TableCell className="max-w-56 truncate" title={r.address}>{r.address}</TableCell>
                <TableCell><span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", STATUS[r.status][1])}>{STATUS[r.status][0]}</span></TableCell>
                <TableCell className="tabular-nums">{formatDate(r.created_at)}</TableCell>
                <TableCell className="tabular-nums">{formatDate(r.decided_at)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5 whitespace-nowrap">
                    {r.status === "PENDING" && (
                      <>
                        <Button size="sm" disabled={decide.isPending} onClick={() => decide.mutate({ id: r.retailer_id, approve: true })}>Approve</Button>
                        <Button size="sm" variant="secondary" disabled={decide.isPending} onClick={() => decide.mutate({ id: r.retailer_id, approve: false })}>Reject</Button>
                      </>
                    )}
                    {r.status !== "CLOSED" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => setEditing(r)}>Edit</Button>
                        <ConfirmButton
                          size="sm"
                          label="Close and anonymize"
                          title={`Close ${r.company_name}?`}
                          description="Their contact details are anonymized and they can no longer sign in. This cannot be undone. All open orders must be finished or cancelled first."
                          confirmLabel="Close and anonymize"
                          disabled={close.isPending}
                          onConfirm={() => close.mutate(r.retailer_id)}
                        />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {q.isLoading && <EmptyState>Loading…</EmptyState>}
        {!q.isLoading && rows.length === 0 && <EmptyState>No retailers match.</EmptyState>}
      </div>
      {editing && <EditDialog key={editing.retailer_id} r={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function EditDialog({ r, onClose }: { r: Retailer; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ company: r.company_name, contact: r.contact_person, phone: r.phone, address: r.address, consent: true });
  const [errs, setErrs] = useState<ReturnType<typeof validateRetailer>>({});
  const m = useMutation({
    mutationFn: () => updateRetailer({ p_retailer_id: r.retailer_id, p_company: f.company.trim(), p_contact: f.contact.trim(), p_phone: f.phone.trim(), p_address: f.address.trim() }),
    onSuccess: () => { toast.success("Retailer saved"); onClose(); },
    onError: (e) => toast.error(toUserMessage(e)),
    onSettled: () => qc.invalidateQueries({ queryKey: ["retailers"] }),
  });
  const field = (k: "company" | "contact" | "phone", label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      {errs[k] && <p className="text-xs text-destructive">{errs[k]}</p>}
    </div>
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {r.company_name}</DialogTitle>
          <DialogDescription>Contact details used for ordering and delivery.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {field("company", "Company name")}
          {field("contact", "Contact person")}
          {field("phone", "Phone")}
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" rows={2} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
            {errs.address && <p className="text-xs text-destructive">{errs.address}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={m.isPending} onClick={() => { const e = validateRetailer(f); setErrs(e); if (!Object.keys(e).length) m.mutate(); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
