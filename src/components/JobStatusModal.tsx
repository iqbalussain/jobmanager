
import { Job, JobStatus } from "@/pages/Index";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
                  <TableHead>Job Title</TableHead>
                  <TableHead>Customer Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono">{job.jobOrderNumber}</TableCell>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.customer}</TableCell>
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
