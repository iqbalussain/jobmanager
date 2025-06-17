
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Clock,
  Play,
  Pencil,
  CheckCircle,
  FileText,
  XCircle,
} from "lucide-react";
import { useTheme } from "@/components/ui/ThemeContext";

interface JobStats {
  total: number;
  pending: number;
  "in-progress": number;
  designing: number;
  completed: number;
  invoiced: number;
  cancelled: number;
}

type StatusKey =
  | "total"
  | "pending"
  | "in-progress"
  | "designing"
  | "completed"
  | "invoiced"
  | "cancelled";

const STATUS_NAME_MAP: Record<StatusKey, string> = {
  total: "Total",
  pending: "Pending",
  "in-progress": "In Progress",
  designing: "Designing",
  completed: "Completed",
  invoiced: "Invoiced",
  cancelled: "Cancelled",
};

const LIGHT_MODE_COLORS: Record<StatusKey, string> = {
  total: "bg-gradient-to-br from-blue-100 to-purple-100 text-gray-800 border-blue-200",
  pending: "bg-gradient-to-br from-yellow-100 to-orange-100 text-gray-800 border-yellow-200",
  "in-progress": "bg-gradient-to-br from-cyan-100 to-blue-100 text-gray-800 border-cyan-200",
  designing: "bg-gradient-to-br from-purple-100 to-pink-100 text-gray-800 border-purple-200",
  completed: "bg-gradient-to-br from-green-100 to-emerald-100 text-gray-800 border-green-200",
  invoiced: "bg-gradient-to-br from-indigo-100 to-purple-100 text-gray-800 border-indigo-200",
  cancelled: "bg-gradient-to-br from-red-100 to-pink-100 text-gray-800 border-red-200",
};

const DARK_MODE_COLORS: Record<StatusKey, string> = {
  total: "glass-gaming-strong neon-trace-card bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border-blue-400/30",
  pending: "glass-gaming-strong neon-trace-card bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-white border-yellow-400/30",
  "in-progress": "glass-gaming-strong neon-trace-card bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-white border-cyan-400/30",
  designing: "glass-gaming-strong neon-trace-card bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white border-purple-400/30",
  completed: "glass-gaming-strong neon-trace-card bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-white border-green-400/30",
  invoiced: "glass-gaming-strong neon-trace-card bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-white border-indigo-400/30",
  cancelled: "glass-gaming-strong neon-trace-card bg-gradient-to-br from-red-500/20 to-pink-500/20 text-white border-red-400/30",
};

const ICON_MAP: Record<StatusKey, JSX.Element> = {
  total: <Briefcase className="w-5 h-5 inline-block mr-2 -mt-1" />,
  pending: <Clock className="w-5 h-5 inline-block mr-2 -mt-1" />,
  "in-progress": <Play className="w-5 h-5 inline-block mr-2 -mt-1" />,
  designing: <Pencil className="w-5 h-5 inline-block mr-2 -mt-1" />,
  completed: <CheckCircle className="w-5 h-5 inline-block mr-2 -mt-1" />,
  invoiced: <FileText className="w-5 h-5 inline-block mr-2 -mt-1" />,
  cancelled: <XCircle className="w-5 h-5 inline-block mr-2 -mt-1" />,
};

interface JobStatusOverviewProps {
  stats: JobStats;
  onStatusClick: (
    status: StatusKey,
    title: string
  ) => void;
}

export function JobStatusOverview({
  stats,
  onStatusClick,
}: JobStatusOverviewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const statusKeys: StatusKey[] = [
    "total",
    "pending",
    "in-progress",
    "designing",
    "completed",
    "invoiced",
    "cancelled",
  ];

  const getCardStyles = (key: StatusKey) => {
    const baseStyles = "relative overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl cursor-pointer border-2 backdrop-blur-md";
    const colorStyles = isDark ? DARK_MODE_COLORS[key] : LIGHT_MODE_COLORS[key];
    const hoverStyles = isDark 
      ? "hover:gaming-pulse hover:animate-glow" 
      : "hover:shadow-lg hover:brightness-105";
    
    return `${baseStyles} ${colorStyles} ${hoverStyles}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2 p-1 sm:gap-2 md:gap-3 lg:gap-4">
      {statusKeys.map((key) => (
        <Card
          key={key}
          role="button"
          tabIndex={0}
          aria-label={`Show ${STATUS_NAME_MAP[key]} jobs`}
          onClick={() => onStatusClick(key, STATUS_NAME_MAP[key])}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onStatusClick(key, STATUS_NAME_MAP[key]); }}
          className={getCardStyles(key)}
          style={{
            minHeight: "80px",
          }}
        >
          <CardContent className="flex flex-col items-center justify-center text-center gap-1 sm:gap-2 w-full h-full p-2 sm:p-3 md:p-4">
            <span className="flex items-center justify-center text-[11px] sm:text-xs md:text-base font-medium leading-tight">
              {ICON_MAP[key]}
              <span className="inline-block truncate max-w-[80px] sm:max-w-[120px] md:max-w-full">
                {STATUS_NAME_MAP[key]}
              </span>
            </span>
            <span className="font-bold text-lg sm:text-xl md:text-2xl lg:text-4xl leading-tight truncate max-w-[60px] sm:max-w-[90px] md:max-w-full">
              {stats[key]}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
