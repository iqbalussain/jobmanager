
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  Activity,
  Palette,
  DollarSign,
  XCircle
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
  return (
    <div className="bg-white rounded-2xl shadow-xl border-0 p-6 h-full">
      <div className="grid grid-cols-3 gap-4 h-full">
        <Card 
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 rounded-xl"
          onClick={() => onStatusClick('total', 'All')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Briefcase className="w-6 h-6 text-blue-200 mb-2" />
            <p className="text-blue-100 text-xs font-medium mb-1">Total</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 rounded-xl"
          onClick={() => onStatusClick('active', 'Active')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Activity className="w-6 h-6 text-orange-200 mb-2" />
            <p className="text-orange-100 text-xs font-medium mb-1">Active</p>
            <p className="text-xl font-bold">{stats.inProgress + stats.designing}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 rounded-xl"
          onClick={() => onStatusClick('pending', 'Pending')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Clock className="w-6 h-6 text-purple-200 mb-2" />
            <p className="text-purple-100 text-xs font-medium mb-1">Pending</p>
            <p className="text-xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 rounded-xl"
          onClick={() => onStatusClick('in-progress', 'In Progress')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Activity className="w-6 h-6 text-yellow-200 mb-2" />
            <p className="text-yellow-100 text-xs font-medium mb-1">In Progress</p>
            <p className="text-xl font-bold">{stats.inProgress}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 rounded-xl"
          onClick={() => onStatusClick('designing', 'Designing')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Palette className="w-6 h-6 text-indigo-200 mb-2" />
            <p className="text-indigo-100 text-xs font-medium mb-1">Designing</p>
            <p className="text-xl font-bold">{stats.designing}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 rounded-xl"
          onClick={() => onStatusClick('completed', 'Completed')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <CheckCircle className="w-6 h-6 text-green-200 mb-2" />
            <p className="text-green-100 text-xs font-medium mb-1">Completed</p>
            <p className="text-xl font-bold">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 rounded-xl"
          onClick={() => onStatusClick('invoiced', 'Invoiced')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <DollarSign className="w-6 h-6 text-emerald-200 mb-2" />
            <p className="text-emerald-100 text-xs font-medium mb-1">Invoiced</p>
            <p className="text-xl font-bold">{stats.invoiced}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 rounded-xl"
          onClick={() => onStatusClick('cancelled', 'Cancelled')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <XCircle className="w-6 h-6 text-red-200 mb-2" />
            <p className="text-red-100 text-xs font-medium mb-1">Cancelled</p>
            <p className="text-xl font-bold">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
