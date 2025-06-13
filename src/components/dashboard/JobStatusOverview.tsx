
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase,
  Clock,
  Play,
  Pencil,
  CheckCircle,
  FileText,
  XCircle,
  Users,
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
  onStatusClick: (status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active' | 'cancelled', title: string) => void;
}

export function JobStatusOverview({ stats, onStatusClick }: JobStatusOverviewProps) {
  const cards = [
    {
      key: "total",
      label: "Total Jobs",
      icon: <Briefcase className="w-8 h-8 text-white/80 mb-2" />,
      value: stats.total,
      from: "from-white/10",
      to: "to-white/20",
    },
    {
      key: "pending",
      label: "Pending",
      icon: <Clock className="w-8 h-8 text-yellow-300 mb-2" />,
      value: stats.pending,
      from: "from-yellow-500/20",
      to: "to-yellow-500/30",
    },
    {
      key: "inProgress",
      label: "In Progress",
      icon: <Play className="w-8 h-8 text-blue-300 mb-2" />,
      value: stats.inProgress,
      from: "from-blue-500/20",
      to: "to-blue-500/30",
    },
    {
      key: "designing",
      label: "Designing",
      icon: <Pencil className="w-8 h-8 text-pink-300 mb-2" />,
      value: stats.designing,
      from: "from-pink-500/20",
      to: "to-pink-500/30",
    },
    {
      key: "completed",
      label: "Completed",
      icon: <CheckCircle className="w-8 h-8 text-green-300 mb-2" />,
      value: stats.completed,
      from: "from-green-500/20",
      to: "to-green-500/30",
    },
    {
      key: "invoiced",
      label: "Invoiced",
      icon: <FileText className="w-8 h-8 text-purple-300 mb-2" />,
      value: stats.invoiced,
      from: "from-purple-500/20",
      to: "to-purple-500/30",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      icon: <XCircle className="w-8 h-8 text-red-300 mb-2" />,
      value: stats.cancelled,
      from: "from-red-500/20",
      to: "to-red-500/30",
    },
    {
      key: "teamMembers",
      label: "Team Members",
      icon: <Users className="w-8 h-8 text-cyan-300 mb-2" />,
      value: stats.teamMembers,
      from: "from-cyan-500/20",
      to: "to-cyan-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {cards.map(({ key, label, icon, value, from, to }) => (
        <Card
          key={key}
          onClick={() => onStatusClick(key, label)}
          className={`
            bg-gradient-to-br ${from} ${to}
            backdrop-blur-md bg-white/20
            border border-white/30
            rounded-xl
            shadow-lg
            cursor-pointer
            transform transition-transform duration-300 ease-in-out
            hover:scale-105 hover:shadow-2xl
            h-20 w-full
            flex items-center justify-center
          `}
        >
          <CardContent className="flex flex-col items-center justify-center text-white text-center">
            {icon}
            <p className="text-sm font-semibold mb-1 drop-shadow-md">{label}</p>
            <p className="text-3xl font-bold drop-shadow-lg">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}