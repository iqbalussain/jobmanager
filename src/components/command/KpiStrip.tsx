import type { Job } from "@/pages/Index";
import { formatOmaniRial } from "@/utils/currency";
import { Activity, AlertTriangle, Receipt, Wallet } from "lucide-react";

const ACTIVE = new Set(["pending", "in-progress", "designing", "out", "foc_sample"]);

export function KpiStrip({ jobs }: { jobs: Job[] }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const invoiced = jobs.filter((j) => j.status === "invoiced");
  const invoicedMonth = invoiced.filter((j) => new Date(j.invoicedAt ?? j.createdAt).getTime() >= monthStart);
  const toBill = jobs.filter((j) => j.status === "completed" || j.status === "finished");
  const active = jobs.filter((j) => ACTIVE.has(j.status));
  const urgent = active.filter((j) => j.priority === "high");
  const sum = (list: Job[]) => list.reduce((t, j) => t + (Number(j.totalValue) || 0), 0);

  const cards = [
    { label: "Invoiced this month", value: formatOmaniRial(sum(invoicedMonth)), hint: `${invoicedMonth.length} jobs`, icon: Wallet },
    { label: "Waiting for invoice", value: formatOmaniRial(sum(toBill)), hint: `${toBill.length} jobs ready to bill`, icon: Receipt },
    { label: "Active on the floor", value: String(active.length), hint: "pending, design, production", icon: Activity },
    { label: "High priority", value: String(urgent.length), hint: "need attention", icon: AlertTriangle, alert: urgent.length > 0 },
  ];

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map(({ label, value, hint, icon: Icon, alert }) => (
        <div key={label} className="min-w-0 rounded-lg border bg-card p-2.5 shadow-sm">
          <div className="flex items-start justify-between gap-1 text-[11px] font-medium text-muted-foreground">
            <span>{label}</span>
            <Icon className={alert ? "h-3.5 w-3.5 shrink-0 text-destructive" : "h-3.5 w-3.5 shrink-0"} />
          </div>
          <div className="mt-1 break-all font-mono text-base font-semibold tabular-nums lg:text-xl">{value}</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">{hint}</div>
        </div>
      ))}
    </div>
  );
}
