
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job, JobStatus } from "@/pages/Index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Eye } from "lucide-react";

interface AdminJobManagementTableProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onView: (job: Job) => void;
  onStatusChange: (job: Job, newStatus: JobStatus) => void;
}

const statusOptions: { value: JobStatus, label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "designing", label: "Designing" },
  { value: "finished", label: "Finished" },
  { value: "completed", label: "Completed" },
  { value: "invoiced", label: "Invoiced" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
    case "in-progress": return "bg-orange-100 text-orange-800 border-orange-200";
    case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
    case "finished": return "bg-green-100 text-green-800 border-green-200";
    case "completed": return "bg-green-100 text-green-800 border-green-200";
    case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "cancelled": return "bg-gray-200 text-gray-600 border-gray-300";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function AdminJobManagementTable({ jobs, onEdit, onView, onStatusChange }: AdminJobManagementTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Order #</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Salesman</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Invoice #</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-mono">{job.jobOrderNumber}</TableCell>
            <TableCell className="font-medium">{job.title}</TableCell>
            <TableCell>{job.customer}</TableCell>
            <TableCell>{job.branch || "N/A"}</TableCell>
            <TableCell>{job.salesman}</TableCell>
            <TableCell>
              <Select
                value={job.status}
                onValueChange={val => onStatusChange(job, val as JobStatus)}
              >
                <SelectTrigger
                  className={`min-w-[8rem] ${getStatusColor(job.status)} border`}
                >
                  <SelectValue>
                    {statusOptions.find(opt => opt.value === job.status)?.label || job.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem value={opt.value} key={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <span className="text-sm text-gray-600">
                {job.invoiceNumber || "Not assigned"}
              </span>
            </TableCell>
            <TableCell className="flex gap-2">
              <Button 
                variant="ghost"
                size="icon"
                aria-label="Edit"
                onClick={() => onEdit(job)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost"
                size="icon"
                aria-label="View Details"
                onClick={() => onView(job)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
