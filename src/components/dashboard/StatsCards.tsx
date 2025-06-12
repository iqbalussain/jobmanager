
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
    working: number;
    designing: number;
    completed: number;
    invoiced: number;
  };
  onStatusClick: (status: 'pending' | 'working' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active', title: string) => void;
}

export function StatsCards({ stats, onStatusClick }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card 
        className="bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
        onClick={() => onStatusClick('total', 'All')}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-xs font-medium">Total Jobs</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Briefcase className="w-6 h-6 text-slate-200" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
        onClick={() => onStatusClick('pending', 'Pending')}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="w-6 h-6 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
        onClick={() => onStatusClick('working', 'Working')}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs font-medium">Working</p>
              <p className="text-2xl font-bold">{stats.working}</p>
            </div>
            <Activity className="w-6 h-6 text-orange-200" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
        onClick={() => onStatusClick('designing', 'Designing')}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium">Designing</p>
              <p className="text-2xl font-bold">{stats.designing}</p>
            </div>
            <Palette className="w-6 h-6 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
        onClick={() => onStatusClick('completed', 'Completed')}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
        onClick={() => onStatusClick('invoiced', 'Invoiced')}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-medium">Invoiced</p>
              <p className="text-2xl font-bold">{stats.invoiced}</p>
            </div>
            <FileText className="w-6 h-6 text-emerald-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
