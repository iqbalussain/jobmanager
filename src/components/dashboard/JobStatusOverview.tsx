
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

const STATUS_COLOR_MAP: Record<StatusKey, string> = {
  total: "bg-yellow-700 text-white",
  pending: "bg-blue-600 text-white",
  "in-progress": "bg-orange-500 text-white",
  designing: "bg-purple-600 text-white",
  completed: "bg-green-600 text-white",
  invoiced: "bg-emerald-700 text-white",
  cancelled: "bg-red-600 text-white",
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

const cardBase =
  "flex flex-col items-center justify-center w-full h-24 sm:h-28 md:h-31 rounded-xl shadow-lg cursor-pointer " +
  "transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl select-none " +
  "focus:outline-none focus:ring-4 focus:ring-blue-300 animate-[fade-in_0.3s_ease-in]";

export function JobStatusOverview({
  stats,
  onStatusClick,
}: JobStatusOverviewProps) {
  const statusKeys: StatusKey[] = [
    "total",
    "pending",
    "in-progress",
    "designing",
    "completed",
    "invoiced",
    "cancelled",
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-2">
      {statusKeys.map((key) => (
        <Card
          key={key}
          role="button"
          tabIndex={0}
          aria-label={`Show ${STATUS_NAME_MAP[key]} jobs`}
          onClick={() => onStatusClick(key, STATUS_NAME_MAP[key])}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onStatusClick(key, STATUS_NAME_MAP[key]); }}
          className={cardBase + " " + STATUS_COLOR_MAP[key]}
        >
          <CardContent className="flex flex-col items-center justify-center text-center gap-2 p-3 w-full h-full">
            <span className="flex items-center justify-center text-xs sm:text-sm md:text-base font-medium">
              {ICON_MAP[key]}
              <span className="inline-block">{STATUS_NAME_MAP[key]}</span>
            </span>
            <span
              className="font-bold text-xl sm:text-2xl md:text-4xl lg:text-5xl leading-tight"
              style={{ lineHeight: "1" }}
            >
              {stats[key]}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
