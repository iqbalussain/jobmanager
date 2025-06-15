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

const statusColorMap: Record<JobStatus, { trigger: string; item: string; text: string }> = {
  pending: {
    trigger: "bg-gradient-to-r from-blue-900 via-blue-700 to-blue-800 border-blue-600 text-blue-300",
    item: "bg-blue-900 hover:bg-blue-800",
    text: "text-blue-100",
  },
  "in-progress": {
    trigger: "bg-gradient-to-r from-orange-900 via-orange-800 to-yellow-800 border-orange-600 text-orange-200",
    item: "bg-orange-900 hover:bg-orange-800",
    text: "text-orange-100",
  },
  designing: {
    trigger: "bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 border-purple-600 text-purple-200",
    item: "bg-purple-900 hover:bg-purple-800",
    text: "text-purple-100",
  },
  finished: {
    trigger: "bg-gradient-to-r from-green-900 via-green-800 to-emerald-800 border-green-700 text-green-200",
    item: "bg-green-900 hover:bg-green-800",
    text: "text-green-100",
  },
  completed: {
    trigger: "bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-700 border-emerald-700 text-emerald-200",
    item: "bg-emerald-900 hover:bg-emerald-800",
    text: "text-emerald-100",
  },
  invoiced: {
    trigger: "bg-gradient-to-r from-emerald-900 via-emerald-800 to-cyan-800 border-emerald-700 text-emerald-200",
    item: "bg-emerald-900 hover:bg-emerald-800",
    text: "text-emerald-100",
  },
  cancelled: {
    trigger: "bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 border-gray-600 text-gray-200",
    item: "bg-gray-900 hover:bg-gray-800",
    text: "text-gray-100",
  },
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
        {jobs.map((job) => {
          // fallback just in case
          const color = statusColorMap[job.status as JobStatus] ??
            statusColorMap["pending"];
          return (
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
                    className={`min-w-[8rem] ${color.trigger} border font-semibold shadow-md`}
                  >
                    <SelectValue>
                      <span className={color.text}>
                        {statusOptions.find(opt => opt.value === job.status)?.label || job.status}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    className="z-50 rounded-xl p-1 mt-2 border border-border shadow-2xl"
                    style={{
                      background: "linear-gradient(138deg, #1e293b 60%, #0f172a 100%)", // dark blue/gray gradient
                      color: "#e0e7ef",
                    }}
                  >
                    {statusOptions.map(opt => {
                      const optColor = statusColorMap[opt.value as JobStatus] ?? statusColorMap["pending"];
                      return (
                        <SelectItem
                          value={opt.value}
                          key={opt.value}
                          className={`
                            ${optColor.item} ${optColor.text}
                            font-medium px-3 py-2 rounded
                            transition-colors duration-150
                            data-[state=checked]:ring-2 data-[state=checked]:ring-primary
                          `}
                          style={{
                            backgroundImage: "none",
                            fontWeight: 600,
                            letterSpacing: 0.02,
                          }}
                        >
                          {opt.label}
                        </SelectItem>
                      );
                    })}
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
          )
        })}
      </TableBody>
    </Table>
  )
}
