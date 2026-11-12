import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/app/ui";
import { summary, type Grain } from "@/repositories/summaryRepo";
import { toUserMessage } from "@/lib/errors";
import { addDays, formatDate, formatWon, seoulToday } from "@/lib/format";
import { cn } from "@/lib/utils";

const GRAINS: { value: Grain; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

/** Totals by period; reused by retailer and staff summary pages (RLS scopes the numbers). */
export function SummaryView() {
  const today = seoulToday();
  const [grain, setGrain] = useState<Grain>("day");
  const [from, setFrom] = useState(addDays(today, -29));
  const [to, setTo] = useState(today);
  const [applied, setApplied] = useState({ from, to });

  const q = useQuery({
    queryKey: ["summary", grain, applied.from, applied.to],
    queryFn: () => summary(grain, applied.from, applied.to),
  });
  if (q.error) toast.error(toUserMessage(q.error), { id: "summary-error" });
  const rows = q.data ?? [];

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-end gap-4 p-4">
        <div className="space-y-1.5">
          <Label>Period</Label>
          <div className="flex overflow-hidden rounded-md border border-border">
            {GRAINS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGrain(g.value)}
                className={cn(
                  "h-9 px-4 text-sm",
                  grain === g.value ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from">From</Label>
          <Input id="from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">To</Label>
          <Input id="to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button onClick={() => setApplied({ from, to })} disabled={!from || !to || from > to}>Apply</Button>
      </div>

      {rows.length > 0 && (
        <div className="panel p-4">
          <h2 className="section-title mb-3">Net amount</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows.map((r) => ({ period: formatDate(r.period_start), net: r.net_amount }))}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={80} tickFormatter={(v: number) => formatWon(v)} />
                <Tooltip formatter={(v: number) => formatWon(v)} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="net" name="Net" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="panel max-h-[520px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period start</TableHead>
              <TableHead className="num">Orders</TableHead>
              <TableHead className="num">Order amount</TableHead>
              <TableHead className="num">Payments</TableHead>
              <TableHead className="num">Refunds</TableHead>
              <TableHead className="num">Net</TableHead>
              <TableHead className="num">Shipped boxes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.period_start}>
                <TableCell>{formatDate(r.period_start)}</TableCell>
                <TableCell className="num">{r.order_count.toLocaleString("en-US")}</TableCell>
                <TableCell className="num">{formatWon(r.order_amount)}</TableCell>
                <TableCell className="num">{formatWon(r.paid_amount)}</TableCell>
                <TableCell className="num">{formatWon(r.refund_amount)}</TableCell>
                <TableCell className="num font-medium">{formatWon(r.net_amount)}</TableCell>
                <TableCell className="num">{r.shipped_boxes.toLocaleString("en-US")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!q.isLoading && rows.length === 0 && <EmptyState>No activity in this period</EmptyState>}
        {q.isLoading && <EmptyState>Loading…</EmptyState>}
      </div>
    </div>
  );
}
