
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from "lucide-react";

interface JobStats {
  total: number;
  pending: number;
  inProgress: number;
  designing: number;
  completed: number;
  invoiced: number;
  cancelled: number;
}

interface JobStatsCardsProps {
  stats: JobStats;
}

const icons = [
  { Icon: ArrowRight, color: "#3b82f6" },
  { Icon: ArrowUp, color: "#fbbf24" },
  { Icon: ArrowDown, color: "#f87171" },
  { Icon: ArrowLeft, color: "#a78bfa" },
  { Icon: ArrowUp, color: "#34d399" },
  { Icon: ArrowRight, color: "#ec4899" },
  { Icon: ArrowDown, color: "#f43f5e" },
];

export function JobStatsCards({ stats }: JobStatsCardsProps) {
  const rows = Object.entries(stats);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {rows.map(([key, value], idx) => {
        const { Icon, color } = icons[idx % icons.length];
        return (
          <Card key={key} className="bg-white/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-4 text-center">
              <span className="inline-flex items-center justify-center mb-2">
                <Icon size={22} color={color} />
              </span>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-600 capitalize">
                {key === 'inProgress' ? 'In Progress' : key}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
