
import { Job, JobStatus } from "@/pages/Index";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface JobStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  status: JobStatus;
  title: string;
}

export function JobStatusModal({ isOpen, onClose, jobs, status, title }: JobStatusModalProps) {
  const filteredJobs = jobs.filter(job => job.status === status);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title} Jobs</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {filteredJobs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No jobs found with status: {status}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Order #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Designer</TableHead>
                  <TableHead>Salesman</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono">{job.jobOrderNumber}</TableCell>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.customer}</TableCell>
                    <TableCell>{job.designer}</TableCell>
                    <TableCell>{job.salesman}</TableCell>
                    <TableCell>{job.assignee}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(job.priority)}>
                        {job.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(job.dueDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
