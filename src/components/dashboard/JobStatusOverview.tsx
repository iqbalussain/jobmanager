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
  total: "bg-primary text-primary-foreground",
  pending: "bg-secondary text-secondary-foreground",
  "in-progress": "bg-accent text-accent-foreground",
  designing: "bg-muted text-foreground",
  completed: "bg-green-600 text-white",
  invoiced: "bg-purple-500 text-white",
  cancelled: "bg-destructive text-destructive-foreground",
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
  "focus:outline-none focus:ring-4 focus:ring-ring animate-[fade-in_0.3s_ease-in]";

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
    <div className="
      grid
      grid-cols-2
      sm:grid-cols-3
      md:grid-cols-4
      lg:grid-cols-3
      gap-2
      p-1
      sm:gap-2
      md:gap-3
      lg:gap-4
    ">
      {statusKeys.map((key) => (
        <Card
          key={key}
          role="button"
          tabIndex={0}
          aria-label={`Show ${STATUS_NAME_MAP[key]} jobs`}
          onClick={() => onStatusClick(key, STATUS_NAME_MAP[key])}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onStatusClick(key, STATUS_NAME_MAP[key]); }}
          className={
            cardBase +
            " " +
            STATUS_COLOR_MAP[key] +
            " min-h-[80px] sm:min-h-[96px] md:min-h-[104px] lg:min-h-[124px] p-1 sm:p-2"
          }
          style={{ maxWidth: "100%", width: "100%" }}
        >
          <CardContent className="
            flex flex-col items-center justify-center text-center gap-1 sm:gap-2
            w-full h-full p-2 sm:p-3 md:p-4
          ">
            <span className="
              flex items-center justify-center
              text-[11px] sm:text-xs md:text-base font-medium
              leading-tight
            ">
              {ICON_MAP[key]}
              <span className="inline-block truncate max-w-[80px] sm:max-w-[120px] md:max-w-full">
                {STATUS_NAME_MAP[key]}
              </span>
            </span>
            <span
              className="
                font-bold
                text-lg
                sm:text-xl
                md:text-2xl
                lg:text-4xl
                leading-tight
                truncate
                max-w-[60px] sm:max-w-[90px] md:max-w-full
              "
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
