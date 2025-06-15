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

// Map for light, mac-like UI palette
const statusColorMap: Record<JobStatus, { trigger: string; item: string; text: string }> = {
  pending: {
    trigger: "bg-blue-100 border border-blue-300 text-blue-800",
    item: "bg-blue-50 hover:bg-blue-100",
    text: "text-blue-900 font-medium",
  },
  "in-progress": {
    trigger: "bg-orange-100 border border-orange-300 text-orange-800",
    item: "bg-orange-50 hover:bg-orange-100",
    text: "text-orange-900 font-medium",
  },
  designing: {
    trigger: "bg-purple-100 border border-purple-300 text-purple-800",
    item: "bg-purple-50 hover:bg-purple-100",
    text: "text-purple-900 font-medium",
  },
  finished: {
    trigger: "bg-green-100 border border-green-300 text-green-800",
    item: "bg-green-50 hover:bg-green-100",
    text: "text-green-900 font-medium",
  },
  completed: {
    trigger: "bg-emerald-100 border border-emerald-300 text-emerald-800",
    item: "bg-emerald-50 hover:bg-emerald-100",
    text: "text-emerald-900 font-medium",
  },
  invoiced: {
    trigger: "bg-cyan-100 border border-cyan-300 text-cyan-800",
    item: "bg-cyan-50 hover:bg-cyan-100",
    text: "text-cyan-900 font-medium",
  },
  cancelled: {
    trigger: "bg-gray-100 border border-gray-300 text-gray-800",
    item: "bg-gray-50 hover:bg-gray-100",
    text: "text-gray-900 font-medium",
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
          const color = statusColorMap[job.status as JobStatus] ?? statusColorMap["pending"];
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
                    className={`min-w-[8rem] ${color.trigger} rounded-lg shadow-sm transition-all duration-150 border font-semibold h-9 px-4 flex items-center justify-between`}
                    style={{
                      boxShadow: '0 1px 4px 0 rgba(31,34,37,0.04)',
                    }}
                  >
                    <SelectValue>
                      <span className={color.text} style={{ fontWeight: 600 }}>
                        {statusOptions.find(opt => opt.value === job.status)?.label || job.status}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    className="z-[999] rounded-xl p-1 mt-2 border border-border shadow-2xl"
                    style={{
                      background: "linear-gradient(150deg, #fff 60%, #f8fafc 100%)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                      color: "#212733",
                      minWidth: '8rem',
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
                            rounded-md transition-colors duration-100 px-4 py-2 cursor-pointer
                            font-semibold text-base
                            data-[state=checked]:ring-2 data-[state=checked]:ring-indigo-400
                          `}
                          style={{
                            letterSpacing: 0.01,
                            WebkitFontSmoothing: 'antialiased',
                            fontWeight: 600,
                            minHeight: '2.25rem',
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
