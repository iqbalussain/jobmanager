import { memo } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobOrdersListProps {
  jobs: Job[];
  onViewDetails: (job: Job) => void;
}

export const JobOrdersList = memo(({ jobs, onViewDetails }: JobOrdersListProps) => {
  const recentJobs = jobs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      designing: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      invoiced: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="h-full border-0 shadow-none bg-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Recent Job Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px] px-6">
          {recentJobs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No job orders found
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onViewDetails(job)}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/50 hover:bg-white/80 transition-all cursor-pointer border border-gray-100 hover:shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 truncate">
                        {job.jobOrderNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {job.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">{job.assignee || "Unassigned"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

JobOrdersList.displayName = "JobOrdersList";
