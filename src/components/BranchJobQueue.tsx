
import { useState, useMemo } from "react";
import { Job } from "@/types/jobOrder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Clock, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Eye,
  Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BranchJobQueueProps {
  jobs: Job[];
  onViewJob: (job: Job) => void;
}

export function BranchJobQueue({ jobs, onViewJob }: BranchJobQueueProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const branches = useMemo(() => {
    const branchSet = new Set(jobs.map(job => job.branch).filter(Boolean));
    return Array.from(branchSet).sort();
  }, [jobs]);

  const branchData = useMemo(() => {
    const data: Record<string, {
      jobs: Job[];
      pending: number;
      inProgress: number;
      completed: number;
      totalValue: number;
    }> = {};

    jobs.forEach(job => {
      const branch = job.branch || "No Branch";
      if (!data[branch]) {
        data[branch] = {
          jobs: [],
          pending: 0,
          inProgress: 0,
          completed: 0,
          totalValue: 0
        };
      }

      // Apply filters
      const matchesBranch = selectedBranch === "all" || job.branch === selectedBranch;
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;

      if (matchesBranch && matchesStatus) {
        data[branch].jobs.push(job);
        data[branch].totalValue += job.totalValue || 0;

        switch (job.status) {
          case "pending":
            data[branch].pending++;
            break;
          case "in-progress":
            data[branch].inProgress++;
            break;
          case "completed":
          case "finished":
            data[branch].completed++;
            break;
        }
      }
    });

    return data;
  }, [jobs, selectedBranch, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed": 
      case "finished": return "bg-green-100 text-green-800 border-green-200";
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Branch Job Queue
            </h1>
            <p className="text-gray-600">Monitor job progress across all branches</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="designing">Designing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="invoiced">Invoiced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(branchData).map(([branchName, data]) => (
          <Card key={branchName} className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5" />
                  {branchName}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{data.jobs.length} Jobs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>${data.totalValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Status Summary */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-600">Pending</span>
                  </div>
                  <div className="text-xl font-bold text-yellow-700">{data.pending}</div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">Active</span>
                  </div>
                  <div className="text-xl font-bold text-blue-700">{data.inProgress}</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Done</span>
                  </div>
                  <div className="text-xl font-bold text-green-700">{data.completed}</div>
                </div>
              </div>

              {/* Job List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.jobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No jobs found</p>
                  </div>
                ) : (
                  data.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {job.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">#{job.jobOrderNumber}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onViewJob(job)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs px-2 py-1 ${getStatusColor(job.status)}`}>
                          {job.status}
                        </Badge>
                        <Badge className={`text-xs px-2 py-1 ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{job.customer}</span>
                        <span>{job.salesman}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
