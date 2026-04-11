
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, Clock, CheckCircle, Activity, Palette, DollarSign, XCircle
} from "lucide-react";
import { useGamingMode } from "@/App";
import { cn } from "@/lib/utils";

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
  onStatusClick: (status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active' | 'cancelled', title: string) => void;
}

const statusConfig = [
  { key: 'total' as const, label: 'Total', icon: Briefcase, color: 'blue', getValue: (s: JobStats) => s.total },
  { key: 'active' as const, label: 'Active', icon: Activity, color: 'orange', getValue: (s: JobStats) => s.inProgress + s.designing },
  { key: 'pending' as const, label: 'Pending', icon: Clock, color: 'purple', getValue: (s: JobStats) => s.pending },
  { key: 'in-progress' as const, label: 'In Progress', icon: Activity, color: 'yellow', getValue: (s: JobStats) => s.inProgress },
  { key: 'designing' as const, label: 'Designing', icon: Palette, color: 'indigo', getValue: (s: JobStats) => s.designing },
  { key: 'completed' as const, label: 'Completed', icon: CheckCircle, color: 'green', getValue: (s: JobStats) => s.completed },
  { key: 'invoiced' as const, label: 'Invoiced', icon: DollarSign, color: 'emerald', getValue: (s: JobStats) => s.invoiced },
  { key: 'cancelled' as const, label: 'Cancelled', icon: XCircle, color: 'red', getValue: (s: JobStats) => s.cancelled },
];

const neonColors: Record<string, { border: string; text: string; glow: string; icon: string }> = {
  blue: { border: 'border-blue-400/50', text: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]', icon: 'text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.6)]' },
  orange: { border: 'border-orange-400/50', text: 'text-orange-400', glow: 'shadow-[0_0_15px_rgba(251,146,60,0.3)]', icon: 'text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]' },
  purple: { border: 'border-purple-400/50', text: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]', icon: 'text-purple-400 drop-shadow-[0_0_6px_rgba(192,132,252,0.6)]' },
  yellow: { border: 'border-yellow-400/50', text: 'text-yellow-400', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]', icon: 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]' },
  indigo: { border: 'border-indigo-400/50', text: 'text-indigo-400', glow: 'shadow-[0_0_15px_rgba(129,140,248,0.3)]', icon: 'text-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.6)]' },
  green: { border: 'border-green-400/50', text: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(74,222,128,0.3)]', icon: 'text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]' },
  emerald: { border: 'border-emerald-400/50', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]', icon: 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]' },
  red: { border: 'border-red-400/50', text: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(248,113,113,0.3)]', icon: 'text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.6)]' },
};

export function JobStatusOverview({ stats, onStatusClick }: JobStatusOverviewProps) {
  const { gamingMode } = useGamingMode();
  const g = gamingMode;

  return (
    <div className={cn(
      "rounded-2xl shadow-xl border-0 p-6 h-full transition-all duration-500",
      g ? "bg-gray-900/80 backdrop-blur-xl border border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.1)] scanline-overlay" : "bg-white"
    )}>
      <div className="grid grid-cols-3 gap-4 h-full">
        {statusConfig.map(({ key, label, icon: Icon, color, getValue }) => {
          const neon = neonColors[color];
          return (
            <Card
              key={key}
              className={cn(
                "border-0 shadow-lg transition-all duration-300 cursor-pointer rounded-xl",
                g
                  ? `bg-gray-800/60 backdrop-blur-sm border ${neon.border} ${neon.glow} hover:scale-105 hover:shadow-lg`
                  : `bg-gradient-to-br from-${color}-500 to-${color}-600 text-white hover:shadow-xl hover:scale-105`
              )}
              onClick={() => onStatusClick(key, label)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <Icon className={cn("w-6 h-6 mb-2", g ? neon.icon : `text-${color}-200`)} />
                <p className={cn("text-xs font-medium mb-1", g ? `${neon.text} font-mono tracking-wider` : `text-${color}-100`)}>
                  {g ? label.toUpperCase() : label}
                </p>
                <p className={cn(
                  "text-xl font-bold",
                  g && `${neon.text} drop-shadow-[0_0_10px_currentColor]`
                )}>
                  {getValue(stats)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
