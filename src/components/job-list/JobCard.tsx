
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  MessageSquare,
  Calendar,
  User,
  Building,
  Briefcase
} from "lucide-react";

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
  onStatusChange: (jobId: string, status: string) => void;
}

export function JobCard({ job, onViewDetails, onStatusChange }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-300";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-300";
      case "completed": return "bg-green-100 text-green-800 border-green-300";
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusOptions = () => [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "designing", label: "Designing" },
    { value: "completed", label: "Completed" },
    { value: "invoiced", label: "Invoiced" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <Card
      className="relative flex flex-row items-center min-h-[164px] bg-white/95 dark:bg-slate-950/80 border-0 shadow-xl px-0 py-0 transition-all duration-300 overflow-hidden group neon-radium-card"
    >
      {/* Radium animated border */}
      <div className="pointer-events-none absolute inset-0 z-[2] neon-border" aria-hidden="true"></div>
      {/* Content */}
      <div className="flex w-full h-full">
        <div className="w-[76px] hidden md:flex flex-col items-center justify-center bg-gradient-to-b from-blue-600/60 to-blue-800/80 text-white px-3 py-2 shadow-inner">
          <Briefcase className="w-8 h-8 mb-1" />
          <div className="font-bold text-lg tracking-wide">{job.jobOrderNumber}</div>
        </div>
        <div className="flex flex-1 flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full p-6">
          {/* Left: Details */}
          <div className="flex flex-col gap-1 flex-1">
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
              {job.title}
            </CardTitle>
            <div className="flex flex-wrap gap-4 mt-1 text-base text-gray-700 dark:text-gray-200">
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4 opacity-80" />
                <span className="truncate">{job.customer}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 opacity-80" />
                <span>{job.salesman}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 opacity-80" />
                <span>{new Date(job.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          {/* Right: Status & Actions */}
          <div className="flex flex-col md:items-end gap-2 md:gap-4 min-w-[180px]">
            <Select 
              value={job.status} 
              onValueChange={(value) => onStatusChange(job.id, value)}
            >
              <SelectTrigger className={`w-36 border-2 ${getStatusColor(job.status)} text-base font-semibold`}>
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
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => onViewDetails(job)}
                className="flex-1 bg-blue-600/90 hover:bg-blue-700 transition-colors text-white shadow-md"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-blue-50 text-blue-700 border-blue-200 transition-colors"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

