import type { Job } from "@/pages/Index";
import { formatOmaniRial } from "@/utils/currency";
import { Activity, AlertTriangle, Receipt, Wallet } from "lucide-react";

const ACTIVE = new Set(["pending", "in-progress", "designing", "out", "foc_sample"]);

export function KpiStrip({ jobs }: { jobs: Job[] }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const invoiced = jobs.filter((j) => j.status === "invoiced");
  const invoicedMonth = invoiced.filter((j) => new Date(j.createdAt).getTime() >= monthStart);
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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, hint, icon: Icon, alert }) => (
        <div key={label} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
            <Icon className={alert ? "h-4 w-4 text-destructive" : "h-4 w-4"} />
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        </div>
      ))}
    </div>
  );
}
