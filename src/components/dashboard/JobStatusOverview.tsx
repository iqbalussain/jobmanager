import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase, Clock, CheckCircle, Activity, Palette, DollarSign, XCircle
} from "lucide-react";

interface JobStats {
  total: number;
  pending: number;
  inProgress: number;
  designing: number;
  completed: number;
  invoiced: number;
  cancelled: number;
}

interface JobStatusOverviewProps {
  stats: JobStats;
  onStatusClick: (
    status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active' | 'cancelled',
    title: string
  ) => void;
}

const statusConfig = [
  { key: 'total' as const, label: 'Total', icon: Briefcase, getValue: (s: JobStats) => s.total },
  { key: 'active' as const, label: 'Active', icon: Activity, getValue: (s: JobStats) => s.inProgress + s.designing },
  { key: 'pending' as const, label: 'Pending', icon: Clock, getValue: (s: JobStats) => s.pending },
  { key: 'in-progress' as const, label: 'In Progress', icon: Activity, getValue: (s: JobStats) => s.inProgress },
  { key: 'designing' as const, label: 'Designing', icon: Palette, getValue: (s: JobStats) => s.designing },
  { key: 'completed' as const, label: 'Completed', icon: CheckCircle, getValue: (s: JobStats) => s.completed },
  { key: 'invoiced' as const, label: 'Invoiced', icon: DollarSign, getValue: (s: JobStats) => s.invoiced },
  { key: 'cancelled' as const, label: 'Cancelled', icon: XCircle, getValue: (s: JobStats) => s.cancelled },
];

export function JobStatusOverview({ stats, onStatusClick }: JobStatusOverviewProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <h3 className="text-base font-semibold mb-4">Job Status Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusConfig.map(({ key, label, icon: Icon, getValue }) => (
            <button
              key={key}
              onClick={() => onStatusClick(key, label)}
              className="flex flex-col items-center justify-center p-4 rounded-md border bg-muted/30 hover:bg-muted text-center"
            >
              <Icon className="w-5 h-5 mb-2 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-bold text-foreground">{getValue(stats)}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
