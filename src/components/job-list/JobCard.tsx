
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
  // Adjust badge to work on dark backgrounds
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-600/10 text-yellow-300 border-yellow-600";
      case "in-progress": return "bg-blue-600/10 text-blue-300 border-blue-600";
      case "designing": return "bg-purple-700/10 text-purple-300 border-purple-600";
      case "completed": return "bg-emerald-700/15 text-emerald-200 border-emerald-600";
      case "invoiced": return "bg-emerald-800/20 text-emerald-100 border-emerald-600";
      case "cancelled": return "bg-red-800/10 text-red-300 border-red-600";
      default: return "bg-muted/40 text-muted-foreground border-border";
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
    <div className="glass-matte mb-1 rounded-2xl transition-transform duration-300 hover:scale-104 border border-border bg-card">
      <div className="rounded-2xl relative bg-card/90 backdrop-blur border-0 shadow-lg w-full min-h-[238px]">
        <Card className="glass-matte bg-card/90 border-0 shadow w-full min-h-[238px] relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gradient mb-2">{job.title}</CardTitle>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="font-medium">{job.jobOrderNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4 text-secondary" />
                    <span>{job.customer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4 text-accent" />
                    <span>{job.salesman}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-white" />
                    <span>{new Date(job.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <Select 
                  value={job.status} 
                  onValueChange={(value) => onStatusChange(job.id, value)}
                >
                  <SelectTrigger className={`w-32 border-2 ${getStatusColor(job.status)} bg-background/80 text-foreground`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95">
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
                variant="secondary"
                onClick={() => onViewDetails(job)}
                className="flex-1 bg-primary/90 hover:bg-primary text-white border-none shadow"
              >
                <Eye className="w-4 h-4 mr-2 text-white" />
                View Details
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-secondary/95 hover:bg-secondary/80 text-black border-none shadow"
              >
                <MessageSquare className="w-4 h-4 mr-2 text-black" />
                Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
