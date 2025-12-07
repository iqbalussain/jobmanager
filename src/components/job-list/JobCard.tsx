import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Eye, 
  MessageSquare,
  Calendar,
  User,
  Building,
  Briefcase,
  Lock
} from "lucide-react";
import { HighPriorityBadge } from "@/components/ui/HighPriorityBadge";

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
  onStatusChange: (jobId: string, status: string) => void;
}

export function JobCard({ job, onViewDetails, onStatusChange }: JobCardProps) {
  const isLocked = job.status === "invoiced";
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-300";
      case "out": return "bg-purple-100 text-purple-800 border-purple-300";
      case "completed": return "bg-green-100 text-green-800 border-green-300";
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "cancelled": return "bg-red-100 text-red-800 border-red-300";
      case "foc_sample": return "bg-pink-100 text-pink-800 border-pink-300";
      case "finished": return "bg-teal-100 text-teal-800 border-teal-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusOptions = () => [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "out", label: "Out" },
    { value: "completed", label: "Completed" },
    { value: "finished", label: "Finished" },
    { value: "foc_sample", label: "FOC/Sample" },
    { value: "invoiced", label: "Invoiced" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const isOverdue = new Date(job.dueDate) < new Date() && 
    job.status !== "completed" && 
    job.status !== "invoiced" && 
    job.status !== "cancelled";

  const isHighPriority = job.priority === "high";

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
      isHighPriority && isOverdue ? "ring-2 ring-red-500 animate-pulse" : 
      isHighPriority ? "ring-2 ring-orange-400" : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-bold text-gray-900">{job.title}</CardTitle>
              <HighPriorityBadge priority={job.priority} />
              {isOverdue && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-bounce">
                  OVERDUE
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">{job.jobOrderNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4" />
                <span>{job.customer}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{job.salesman}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                <Calendar className="w-4 h-4" />
                <span>{new Date(job.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="ml-4">
            <Select 
              value={job.status} 
              onValueChange={(value) => onStatusChange(job.id, value)}
            >
              <SelectTrigger className={`w-32 border-2 ${getStatusColor(job.status)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <Badge variant="outline" className={getStatusColor(option.value)}>
                      {option.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(job)}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
