
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/ui/ThemeContext";
import {
  Briefcase,
  Clock,
  Play,
  Pencil,
  CheckCircle,
  FileText,
  XCircle,
} from "lucide-react";

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

// Light mode colors - clean and modern
const LIGHT_STATUS_COLOR_MAP: Record<StatusKey, string> = {
  total: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border border-blue-200",
  pending: "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg border border-amber-200",
  "in-progress": "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg border border-emerald-200",
  designing: "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border border-purple-200",
  completed: "bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg border border-green-200",
  invoiced: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg border border-indigo-200",
  cancelled: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg border border-red-200",
};

// Dark mode colors - glassy effects with neon accents
const DARK_STATUS_COLOR_MAP: Record<StatusKey, string> = {
  total: "glass-gaming-strong neon-trace-card gaming-pulse text-gaming-glow bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-400/30",
  pending: "glass-gaming-strong neon-trace-card gaming-pulse text-gaming-glow bg-gradient-to-br from-amber-400/20 to-amber-500/30 border-amber-400/30",
  "in-progress": "glass-gaming-strong neon-trace-card gaming-pulse text-gaming-glow bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-400/30",
  designing: "glass-gaming-strong neon-trace-card gaming-pulse text-gaming-glow bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-400/30",
  completed: "glass-gaming-strong neon-trace-card gaming-pulse text-gaming-glow bg-gradient-to-br from-green-600/20 to-green-700/30 border-green-400/30",
  invoiced: "glass-gaming-strong neon-trace-card gaming-pulse text-gaming-glow bg-gradient-to-br from-indigo-500/20 to-indigo-600/30 border-indigo-400/30",
  cancelled: "glass-gaming-strong neon-trace-card gaming-pulse text-gaming-glow bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-400/30",
};

const ICON_MAP: Record<StatusKey, JSX.Element> = {
  total: <Briefcase className="w-4 h-4 inline-block mr-2 -mt-1" />,
  pending: <Clock className="w-4 h-4 inline-block mr-2 -mt-1" />,
  "in-progress": <Play className="w-4 h-4 inline-block mr-2 -mt-1" />,
  designing: <Pencil className="w-4 h-4 inline-block mr-2 -mt-1" />,
  completed: <CheckCircle className="w-4 h-4 inline-block mr-2 -mt-1" />,
  invoiced: <FileText className="w-4 h-4 inline-block mr-2 -mt-1" />,
  cancelled: <XCircle className="w-4 h-4 inline-block mr-2 -mt-1" />,
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

  const getCardStyling = (key: StatusKey) => {
    const baseClasses = `
      flex flex-col items-center justify-center w-full h-24 sm:h-28 md:h-31 rounded-xl cursor-pointer
      transition-all duration-300 ease-in-out hover:scale-105 select-none
      focus:outline-none focus:ring-4 focus:ring-ring animate-[fade-in_0.3s_ease-in]
      min-h-[80px] sm:min-h-[96px] md:min-h-[104px] lg:min-h-[124px] p-1 sm:p-2
    `;
    
    const themeClasses = isDark 
      ? DARK_STATUS_COLOR_MAP[key]
      : LIGHT_STATUS_COLOR_MAP[key];
    
    const hoverEffects = isDark 
      ? "hover:shadow-2xl hover:shadow-blue-500/20 neon-animate"
      : "hover:shadow-2xl hover:shadow-black/10";
    
    return `${baseClasses} ${themeClasses} ${hoverEffects}`;
  };

  return (
    <div className="
      grid
      grid-cols-1
      sm:grid-cols-1
      md:grid-cols-2
      lg:grid-cols-3
      gap-2
      p-1
      sm:gap-1
      md:gap-2
      lg:gap-3
    ">
      {statusKeys.map((key) => (
        <Card
          key={key}
          role="button"
          tabIndex={0}
          aria-label={`Show ${STATUS_NAME_MAP[key]} jobs`}
          onClick={() => onStatusClick(key, STATUS_NAME_MAP[key])}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onStatusClick(key, STATUS_NAME_MAP[key]); }}
          className={getCardStyling(key)}
          style={{ maxWidth: "100%", width: "100%" }}
        >
          <CardContent className="
            flex flex-col items-center justify-center text-center gap-1 sm:gap-2
            w-full h-full p-2 sm:p-3 md:p-4
          ">
            <span className={`
              flex items-center justify-center
              text-[11px] sm:text-xs md:text-base font-medium
              leading-tight
              ${isDark ? 'text-gaming-glow neon-text' : 'text-white'}
            `}>
              <span className={isDark ? 'neon-icon' : ''}>
                {ICON_MAP[key]}
              </span>
              <span className="inline-block truncate max-w-[80px] sm:max-w-[120px] md:max-w-full">
                {STATUS_NAME_MAP[key]}
              </span>
            </span>
            <span
              className={`
                font-bold
                text-lg
                sm:text-xl
                md:text-2xl
                lg:text-4xl
                leading-tight
                truncate
                max-w-[60px] sm:max-w-[90px] md:max-w-full
                ${isDark ? 'text-gaming-glow neon-text' : 'text-white'}
              `}
              style={{ lineHeight: "1.13" }}
            >
              {stats[key]}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
