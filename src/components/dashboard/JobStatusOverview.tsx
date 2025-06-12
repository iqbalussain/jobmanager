
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  Activity,
  Palette,
  FileCheck,
  DollarSign,
  XCircle,
  AlertCircle
} from "lucide-react";

interface JobStats {
  total: number;
  pending: number;
  working: number;
  designing: number;
  completed: number;
  invoiced: number;
  cancelled: number;
}

interface JobStatusOverviewProps {
  stats: JobStats;
  onStatusClick: (status: 'pending' | 'working' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active' | 'cancelled', title: string) => void;
}

export function JobStatusOverview({ stats, onStatusClick }: JobStatusOverviewProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Overview</h3>
      <div className="grid grid-cols-3 gap-3 h-full">
        <Card 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-blue-500/50"
          onClick={() => onStatusClick('total', 'All')}
        >
          <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
            <Briefcase className="w-4 h-4 text-blue-200 mb-1" />
            <p className="text-blue-100 text-xs font-medium mb-1">Total</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-orange-500/50"
          onClick={() => onStatusClick('active', 'Active')}
        >
          <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
            <Activity className="w-4 h-4 text-orange-200 mb-1" />
            <p className="text-orange-100 text-xs font-medium mb-1">Active</p>
            <p className="text-lg font-bold">{stats.working + stats.designing}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-purple-500/50"
          onClick={() => onStatusClick('pending', 'Pending')}
        >
          <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
            <Clock className="w-4 h-4 text-purple-200 mb-1" />
            <p className="text-purple-100 text-xs font-medium mb-1">Pending</p>
            <p className="text-lg font-bold">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-yellow-500/50"
          onClick={() => onStatusClick('working', 'Working')}
        >
          <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
            <Activity className="w-4 h-4 text-yellow-200 mb-1" />
            <p className="text-yellow-100 text-xs font-medium mb-1">Working</p>
            <p className="text-lg font-bold">{stats.working}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-indigo-500/50"
          onClick={() => onStatusClick('designing', 'Designing')}
        >
          <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
            <Palette className="w-4 h-4 text-indigo-200 mb-1" />
            <p className="text-indigo-100 text-xs font-medium mb-1">Designing</p>
            <p className="text-lg font-bold">{stats.designing}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-green-500/50"
          onClick={() => onStatusClick('completed', 'Completed')}
        >
          <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
            <CheckCircle className="w-4 h-4 text-green-200 mb-1" />
            <p className="text-green-100 text-xs font-medium mb-1">Completed</p>
            <p className="text-lg font-bold">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-emerald-500/50"
          onClick={() => onStatusClick('invoiced', 'Invoiced')}
        >
          <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
            <DollarSign className="w-4 h-4 text-emerald-200 mb-1" />
            <p className="text-emerald-100 text-xs font-medium mb-1">Invoiced</p>
            <p className="text-lg font-bold">{stats.invoiced}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-red-500/50"
          onClick={() => onStatusClick('cancelled', 'Cancelled')}
        >
          <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
            <XCircle className="w-4 h-4 text-red-200 mb-1" />
            <p className="text-red-100 text-xs font-medium mb-1">Cancelled</p>
            <p className="text-lg font-bold">{stats.cancelled}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-gray-500/50"
          onClick={() => onStatusClick('total', 'All Jobs')}
        >
          <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
            <AlertCircle className="w-4 h-4 text-gray-200 mb-1" />
            <p className="text-gray-100 text-xs font-medium mb-1">Overview</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
