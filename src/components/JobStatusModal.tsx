
import { useState } from "react";
import { Job, JobStatus } from "@/pages/Index";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface JobStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  status: JobStatus | 'total' | 'active';
  title: string;
}

export function JobStatusModal({ isOpen, onClose, jobs, status, title }: JobStatusModalProps) {
  const getFilteredJobs = () => {
    switch (status) {
      case 'total':
        return jobs;
      case 'active':
        return jobs.filter(job => job.status === 'in-progress' || job.status === 'designing');
      default:
        return jobs.filter(job => job.status === status);
    }
  };

  const filteredJobs = getFilteredJobs();

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'designing':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'invoiced':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title} Jobs ({filteredJobs.length})</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {filteredJobs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No jobs found for this status</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Order #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono">{job.jobOrderNumber}</TableCell>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.customer}</TableCell>
                    <TableCell>{job.assignee || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status === 'in-progress' ? 'In Progress' : job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant={job.priority === 'high' ? 'destructive' : job.priority === 'medium' ? 'default' : 'secondary'}>
                        {job.priority}
                      </Badge>
                    </TableCell>
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
