
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { 
  Settings,
  Filter,
  Eye,
  FileText,
  Download
} from "lucide-react";

interface AdminJobManagementProps {
  jobs: Job[];
  onStatusUpdate: (jobId: string, status: any) => void;
}

export function AdminJobManagement({ jobs, onStatusUpdate }: AdminJobManagementProps) {
  const [salesmanFilter, setSalesmanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [invoiceNumbers, setInvoiceNumbers] = useState<Record<string, string>>({});

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "designing", label: "Designing" },
    { value: "completed", label: "Completed" },
    { value: "invoiced", label: "Invoiced" }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSalesman = salesmanFilter === "" || job.salesman.toLowerCase().includes(salesmanFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSalesman && matchesStatus;
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    onStatusUpdate(jobId, newStatus);
  };

  const handleInvoiceNumberChange = (jobId: string, invoiceNumber: string) => {
    setInvoiceNumbers(prev => ({
      ...prev,
      [jobId]: invoiceNumber
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const exportToPDF = () => {
    // Create a styled print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Job Orders Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              color: #1e293b;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              margin-bottom: 30px;
              box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
            }
            .header h1 {
              font-size: 2.5rem;
              font-weight: 700;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .header p {
              font-size: 1.1rem;
              opacity: 0.9;
            }
            .icon {
              width: 32px;
              height: 32px;
              fill: currentColor;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .stat-card {
              background: white;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              border-left: 4px solid #3b82f6;
            }
            .stat-value {
              font-size: 2rem;
              font-weight: 700;
              color: #3b82f6;
              margin-bottom: 4px;
            }
            .stat-label {
              font-size: 0.875rem;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .table-container {
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              padding: 16px;
              text-align: left;
              font-weight: 600;
              color: #475569;
              border-bottom: 2px solid #e2e8f0;
            }
            td {
              padding: 16px;
              border-bottom: 1px solid #f1f5f9;
            }
            tr:hover {
              background: #f8fafc;
            }
            .status-badge {
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .status-pending { background: #dbeafe; color: #1e40af; }
            .status-in-progress { background: #fed7aa; color: #ea580c; }
            .status-designing { background: #e9d5ff; color: #7c3aed; }
            .status-completed { background: #dcfce7; color: #166534; }
            .status-invoiced { background: #d1fae5; color: #047857; }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #64748b;
              font-size: 0.875rem;
            }
            @media print {
              body { background: white; }
              .header { background: #3b82f6 !important; -webkit-print-color-adjust: exact; }
              .stat-card { box-shadow: none; border: 1px solid #e2e8f0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              JobFlow - Work Orders Report
            </h1>
            <p>Complete job management overview</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${filteredJobs.length}</div>
              <div class="stat-label">Total Jobs</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${filteredJobs.filter(j => j.status === 'pending').length}</div>
              <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${filteredJobs.filter(j => j.status === 'in-progress').length}</div>
              <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${filteredJobs.filter(j => j.status === 'completed').length}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Job Order #</th>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Salesman</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Branch</th>
                  <th>Invoice #</th>
                </tr>
              </thead>
              <tbody>
                ${filteredJobs.map(job => `
                  <tr>
                    <td style="font-family: monospace; font-weight: 600;">${job.jobOrderNumber}</td>
                    <td style="font-weight: 600;">${job.title}</td>
                    <td>${job.customer}</td>
                    <td>${job.salesman}</td>
                    <td>
                      <span class="status-badge status-${job.status.replace('-', '')}">${job.status.replace('-', ' ')}</span>
                    </td>
                    <td>${new Date(job.dueDate).toLocaleDateString()}</td>
                    <td>${job.branch || 'N/A'}</td>
                    <td>${invoiceNumbers[job.id] || 'Not Invoiced'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Admin Job Management
          </h1>
          <p className="text-gray-600">Complete control over job orders and invoicing</p>
        </div>
        <Button onClick={exportToPDF} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Filter className="w-5 h-5 text-blue-600" />
            Job Orders Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salesmanFilter">Filter by Salesman</Label>
              <Input
                id="salesmanFilter"
                placeholder="Search salesman..."
                value={salesmanFilter}
                onChange={(e) => setSalesmanFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jobs Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Order #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Salesman</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono font-medium">{job.jobOrderNumber}</TableCell>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.customer}</TableCell>
                  <TableCell>{job.salesman}</TableCell>
                  <TableCell>
                    <Select 
                      value={job.status} 
                      onValueChange={(value) => handleStatusChange(job.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="designing">Designing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="invoiced">Invoiced</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{new Date(job.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{job.branch || 'N/A'}</TableCell>
                  <TableCell>
                    <Input
                      placeholder="Invoice #"
                      value={invoiceNumbers[job.id] || ''}
                      onChange={(e) => handleInvoiceNumberChange(job.id, e.target.value)}
                      className="w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(job)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Job Details Modal */}
      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />
    </div>
  );
}
