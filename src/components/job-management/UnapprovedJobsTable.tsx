
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobDetails } from "@/components/JobDetails";
import { JobListHeader } from "@/components/job-list/JobListHeader";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Eye, Calendar, Building, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobOrders } from "@/hooks/useJobOrders";
import { isWithinInterval } from "date-fns";

interface UnapprovedJobsTableProps {
  jobs: Job[];
  userRole: string;
  onJobApproved?: () => void;
}

export function UnapprovedJobsTable({ jobs, userRole, onJobApproved }: UnapprovedJobsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in-progress" | "designing" | "completed" | "invoiced" | "cancelled">("all");
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date } | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const { toast } = useToast();
  const { approveJob, isApprovingJob } = useJobOrders();

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter?.from) {
      const jobDate = new Date(job.createdAt);
      if (dateFilter.to) {
        matchesDate = isWithinInterval(jobDate, { start: dateFilter.from, end: dateFilter.to });
      } else {
        matchesDate = jobDate >= dateFilter.from;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  const handleApproveJob = (jobId: string) => {
    if (!['admin', 'manager'].includes(userRole)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to approve jobs.",
        variant: "destructive",
      });
      return;
    }

    // Approval is handled via the approval box component
    
    if (onJobApproved) {
      onJobApproved();
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as "all" | "pending" | "in-progress" | "designing" | "completed" | "invoiced" | "cancelled");
  };

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

  const canApprove = ['admin', 'manager'].includes(userRole);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Unapproved Jobs</h1>
          <p className="text-gray-600">Jobs pending approval</p>
        </div>
      </div>

      <JobListHeader
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={handleStatusFilterChange}
        onDateFilterChange={setDateFilter}
      />

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Pending Approvals ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Order #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Salesman</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{job.jobOrderNumber}</TableCell>
                  <TableCell className="max-w-xs truncate">{job.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      {job.customer}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      {job.salesman}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      job.priority === 'high' ? 'border-red-300 text-red-700' :
                      job.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-green-300 text-green-700'
                    }>
                      {job.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {new Date(job.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(job)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {canApprove && (
                        <Button
                          size="sm"
                          onClick={() => handleApproveJob(job.id)}
                          disabled={isApprovingJob}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {isApprovingJob ? 'Approving...' : 'Approve'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />
    </div>
  );
}
