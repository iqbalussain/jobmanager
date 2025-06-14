
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight 
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

export function JobStatusOverview({ stats, onStatusClick }: JobStatusOverviewProps) {
  // Status cards with distinct colorful icons (using allowed icons only)
  const statusKeys = [
    "total",
    "pending",
    "inProgress",
    "designing",
    "completed",
    "invoiced",
    "cancelled",
  ] as const;

  const iconProps = [
    { Icon: ArrowRight, color: "#7e3ff2", bg: "bg-violet-100" },
    { Icon: ArrowDown, color: "#ef4444", bg: "bg-red-100" },
    { Icon: ArrowLeft, color: "#3b82f6", bg: "bg-blue-100" },
    { Icon: ArrowUp, color: "#f59e42", bg: "bg-orange-100" },
    { Icon: ArrowUp, color: "#22c55e", bg: "bg-green-100" },
    { Icon: ArrowRight, color: "#a21caf", bg: "bg-purple-100" },
    { Icon: ArrowDown, color: "#7f1d1d", bg: "bg-pink-100" },
  ];

  const cards = [
    {
      key: "total",
      label: "Total",
      value: stats.total,
      from: "from-[#f9e6ff]",
      to: "to-[#e0e7ff]",
      iconIdx: 0,
    },
    {
      key: "pending",
      label: "Pending",
      value: stats.pending,
      from: "from-[#ffefe3]",
      to: "to-[#ffe3e8]",
      iconIdx: 1,
    },
    {
      key: "inProgress",
      label: "In Progress",
      value: stats.inProgress,
      from: "from-[#e3fcff]",
      to: "to-[#d0e6ff]",
      iconIdx: 2,
    },
    {
      key: "designing",
      label: "Designing",
      value: stats.designing,
      from: "from-[#fff9e3]",
      to: "to-[#ffeccf]",
      iconIdx: 3,
    },
    {
      key: "completed",
      label: "Completed",
      value: stats.completed,
      from: "from-[#e3ffe9]",
      to: "to-[#cffaea]",
      iconIdx: 4,
    },
    {
      key: "invoiced",
      label: "Invoiced",
      value: stats.invoiced,
      from: "from-[#fce3ff]",
      to: "to-[#eed4ff]",
      iconIdx: 5,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: stats.cancelled,
      from: "from-[#ffe3e3]",
      to: "to-[#ffdede]",
      iconIdx: 6,
    }
  ];

  const statusMap: Record<typeof statusKeys[number], 'pending' | 'in-progress' | 'designing' | 'completed' | 'invoiced' | 'cancelled' | 'total'> = {
    total: 'total',
    pending: 'pending',
    inProgress: 'in-progress',
    designing: 'designing',
    completed: 'completed',
    invoiced: 'invoiced',
    cancelled: 'cancelled',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-4">
      {cards.map((item, idx) => {
        const { Icon, color, bg } = iconProps[item.iconIdx];
        return (
          <Card
            key={item.key}
            onClick={() => onStatusClick(statusMap[item.key as typeof statusKeys[number]], item.label)}
            className={`
              bg-gradient-to-br ${item.from} ${item.to}
              border border-white/60
              rounded-xl
              shadow-lg
              cursor-pointer
              transform transition-transform duration-200
              hover:scale-105 hover:shadow-2xl
              h-30 w-full flex items-center justify-center
            `}
          >
            <CardContent className="flex flex-col items-center justify-center text-gray-800 text-center">
              <span className={`mb-2 p-2 rounded-full shadow ${bg}`}>
                <Icon size={26} color={color} />
              </span>
              <p className="text-sm font-semibold mb-1">{item.label}</p>
              <p className="text-3xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
