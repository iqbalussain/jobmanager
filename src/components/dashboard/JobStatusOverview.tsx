
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  Activity
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
  onStatusClick: (status: 'pending' | 'working' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active', title: string) => void;
}

export function JobStatusOverview({ stats, onStatusClick }: JobStatusOverviewProps) {
  return (
    <div className="col-span-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Overview</h3>
      <div className="grid grid-cols-2 gap-3 h-full">
        <Card 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-blue-500/50 aspect-square"
          onClick={() => onStatusClick('total', 'All')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Briefcase className="w-6 h-6 text-blue-200 mb-2" />
            <p className="text-blue-100 text-xs font-medium mb-1">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-orange-500/50 aspect-square"
          onClick={() => onStatusClick('active', 'Active')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Activity className="w-6 h-6 text-orange-200 mb-2" />
            <p className="text-orange-100 text-xs font-medium mb-1">Active</p>
            <p className="text-2xl font-bold">{stats.working + stats.designing}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-purple-500/50 aspect-square"
          onClick={() => onStatusClick('pending', 'Pending')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Clock className="w-6 h-6 text-purple-200 mb-2" />
            <p className="text-purple-100 text-xs font-medium mb-1">Pending</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-green-500/50 aspect-square"
          onClick={() => onStatusClick('completed', 'Completed')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <CheckCircle className="w-6 h-6 text-green-200 mb-2" />
            <p className="text-green-100 text-xs font-medium mb-1">Done</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
