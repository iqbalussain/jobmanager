
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { JobStatusModal } from "@/components/JobStatusModal";
import { JobDetails } from "@/components/JobDetails";
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  FileText,
  Palette,
  Filter,
  Eye
} from "lucide-react";

interface DashboardProps {
  jobs: Job[];
}

export function Dashboard({ jobs }: DashboardProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [salesmanFilter, setSalesmanFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    inProgress: jobs.filter(job => job.status === "in-progress").length,
    designing: jobs.filter(job => job.status === "designing").length,
    completed: jobs.filter(job => job.status === "completed").length,
    invoiced: jobs.filter(job => job.status === "invoiced").length
  };

  const handleStatusCardClick = (status: string, title: string) => {
    setSelectedStatus(status);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesCustomer = customerFilter === "" || job.customer.toLowerCase().includes(customerFilter.toLowerCase());
    const matchesSalesman = salesmanFilter === "all" || job.salesman.toLowerCase().includes(salesmanFilter.toLowerCase());
    return matchesCustomer && matchesSalesman;
  });

  // Get unique salesmen for the filter dropdown
  const uniqueSalesmen = [...new Set(jobs.map(job => job.salesman))].filter(Boolean).sort();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your job orders and performance metrics</p>
      </div>

      {/* Stats Grid - Replaced Overdue with Invoiced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => handleStatusCardClick("pending", "Pending")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-6 h-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => handleStatusCardClick("in-progress", "In Progress")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Briefcase className="w-6 h-6 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => handleStatusCardClick("designing", "Designing")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Designing</p>
                <p className="text-2xl font-bold">{stats.designing}</p>
              </div>
              <Palette className="w-6 h-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => handleStatusCardClick("completed", "Completed")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-medium">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => handleStatusCardClick("invoiced", "Invoiced")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Invoiced</p>
                <p className="text-2xl font-bold">{stats.invoiced}</p>
              </div>
              <FileText className="w-6 h-6 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Filter and Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Filter className="w-5 h-5 text-blue-600" />
            Job Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerFilter">Filter by Customer</Label>
              <Input
                id="customerFilter"
                placeholder="Search customer..."
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesmanFilter">Filter by Salesman</Label>
              <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select salesman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salesmen</SelectItem>
                  {uniqueSalesmen.map((salesman) => (
                    <SelectItem key={salesman} value={salesman}>
                      {salesman}
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono">{job.jobOrderNumber}</TableCell>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.customer}</TableCell>
                  <TableCell>{job.salesman}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(job)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Status Modal */}
      <JobStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobs={jobs}
        status={selectedStatus as any}
        title={modalTitle}
      />

      {/* Job Details Modal */}
      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />
    </div>
  );
}
