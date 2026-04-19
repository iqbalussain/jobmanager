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
  Lock,
} from "lucide-react";
import { HighPriorityBadge } from "@/components/ui/HighPriorityBadge";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
  onStatusChange: (jobId: string, status: string) => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "out", label: "Out" },
  { value: "completed", label: "Completed" },
  { value: "finished", label: "Finished" },
  { value: "foc_sample", label: "FOC/Sample" },
  { value: "invoiced", label: "Invoiced" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "completed":
    case "finished":
    case "invoiced":
      return "default";
    case "cancelled":
      return "destructive";
    case "pending":
    case "in-progress":
    case "designing":
      return "secondary";
    default:
      return "outline";
  }
};

export function JobCard({ job, onViewDetails, onStatusChange }: JobCardProps) {
  const isLocked = job.status === "invoiced";

  const handleStatusChange = (value: string) => {
    if (isLocked) return;
    onStatusChange(job.id, value);
  };

  const isOverdue =
    new Date(job.dueDate) < new Date() &&
    job.status !== "completed" &&
    job.status !== "invoiced" &&
    job.status !== "cancelled";

  return (
    <Card className={cn("transition-shadow hover:shadow-md", isOverdue && "border-destructive/40")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle className="text-base font-semibold text-foreground">{job.title}</CardTitle>
              <HighPriorityBadge priority={job.priority} />
              {isLocked && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This job is invoiced and locked for editing</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="text-[10px]">OVERDUE</Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span className="font-medium text-foreground">{job.jobOrderNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>{job.customer}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{job.salesman}</span>
              </div>
              <div className={cn("flex items-center gap-2", isOverdue && "text-destructive font-medium")}>
                <Calendar className="w-4 h-4" />
                <span>{new Date(job.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div>
            {isLocked ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="default" className="cursor-not-allowed">
                      <Lock className="w-3 h-3 mr-1" />
                      Invoiced
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Status locked - job has been invoiced</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Select value={job.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={getStatusBadgeVariant(job.status)}>
            {job.status.replace("-", " ")}
          </Badge>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onViewDetails(job)}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
