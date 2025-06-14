
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job, JobStatus } from "@/pages/Index";

interface AdminJobManagementTableProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
}
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
    case "in-progress": return "bg-orange-100 text-orange-800 border-orange-200";
    case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
    case "finished": return "bg-green-100 text-green-800 border-green-200";
    case "completed": return "bg-green-100 text-green-800 border-green-200";
    case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function AdminJobManagementTable({ jobs, onEdit }: AdminJobManagementTableProps) {
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
              <Badge className={getStatusColor(job.status)}>
                {job.status === 'in-progress' ? 'In Progress' : job.status.replace('-', ' ')}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="text-sm text-gray-600">
                {job.invoiceNumber || "Not assigned"}
              </span>
            </TableCell>
            <TableCell>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(job)}
              >
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

