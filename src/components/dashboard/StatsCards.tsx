
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  FileText,
  Palette,
  Activity
} from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    designing: number;
    completed: number;
    invoiced: number;
  };
  onStatusClick: (status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active', title: string) => void;
}

export function StatsCards({ stats, onStatusClick }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card 
        className="bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all aspect-square"
        onClick={() => onStatusClick('total', 'All')}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
          <Briefcase className="w-8 h-8 text-slate-200 mb-3" />
          <p className="text-slate-100 text-sm font-medium mb-1">Total Jobs</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all aspect-square"
        onClick={() => onStatusClick('pending', 'Pending')}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
          <Clock className="w-8 h-8 text-blue-200 mb-3" />
          <p className="text-blue-100 text-sm font-medium mb-1">Pending</p>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all aspect-square"
        onClick={() => onStatusClick('in-progress', 'In Progress')}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
          <Activity className="w-8 h-8 text-orange-200 mb-3" />
          <p className="text-orange-100 text-sm font-medium mb-1">In Progress</p>
          <p className="text-3xl font-bold">{stats.inProgress}</p>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all aspect-square"
        onClick={() => onStatusClick('designing', 'Designing')}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
          <Palette className="w-8 h-8 text-purple-200 mb-3" />
          <p className="text-purple-100 text-sm font-medium mb-1">Designing</p>
          <p className="text-3xl font-bold">{stats.designing}</p>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all aspect-square"
        onClick={() => onStatusClick('completed', 'Completed')}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
          <CheckCircle className="w-8 h-8 text-green-200 mb-3" />
          <p className="text-green-100 text-sm font-medium mb-1">Completed</p>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all aspect-square"
        onClick={() => onStatusClick('invoiced', 'Invoiced')}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
          <FileText className="w-8 h-8 text-emerald-200 mb-3" />
          <p className="text-emerald-100 text-sm font-medium mb-1">Invoiced</p>
          <p className="text-3xl font-bold">{stats.invoiced}</p>
        </CardContent>
      </Card>
    </div>
  );
}
