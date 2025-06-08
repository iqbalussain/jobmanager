
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JobStatusModal } from "@/components/JobStatusModal";
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Palette,
  Filter
} from "lucide-react";

interface DashboardProps {
  jobs: Job[];
}

export function Dashboard({ jobs }: DashboardProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [designerFilter, setDesignerFilter] = useState("all");
  const [salesmanFilter, setSalesmanFilter] = useState("all");

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    inProgress: jobs.filter(job => job.status === "in-progress").length,
    designing: jobs.filter(job => job.status === "designing").length,
    finished: jobs.filter(job => job.status === "finished").length,
    completed: jobs.filter(job => job.status === "completed").length,
    overdue: jobs.filter(job => 
      new Date(job.dueDate) < new Date() && !["completed", "finished"].includes(job.status)
    ).length
  };

  const handleStatusCardClick = (status: string, title: string) => {
    setSelectedStatus(status);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const filteredJobs = jobs.filter(job => {
    return (
      (customerFilter === "" || job.customer.toLowerCase().includes(customerFilter.toLowerCase())) &&
      (designerFilter === "all" || job.designer === designerFilter) &&
      (salesmanFilter === "all" || job.salesman === salesmanFilter)
    );
  });

  const uniqueCustomers = [...new Set(jobs.map(job => job.customer))];
  const uniqueDesigners = [...new Set(jobs.map(job => job.designer))];
  const uniqueSalesmen = [...new Set(jobs.map(job => job.salesman))];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "finished": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "overdue": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your job orders and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
          className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => handleStatusCardClick("finished", "Finished")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Finished</p>
                <p className="text-2xl font-bold">{stats.finished}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-200" />
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
          className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => handleStatusCardClick("overdue", "Overdue")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs font-medium">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-200" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              <Label htmlFor="designerFilter">Filter by Designer</Label>
              <Select value={designerFilter} onValueChange={setDesignerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All designers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All designers</SelectItem>
                  {uniqueDesigners.map((designer) => (
                    <SelectItem key={designer} value={designer}>{designer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salesmanFilter">Filter by Salesman</Label>
              <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All salesmen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All salesmen</SelectItem>
                  {uniqueSalesmen.map((salesman) => (
                    <SelectItem key={salesman} value={salesman}>{salesman}</SelectItem>
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
                <TableHead>Designer</TableHead>
                <TableHead>Salesman</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell>
                    <Badge className={getPriorityColor(job.priority)}>
                      {job.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(job.dueDate).toLocaleDateString()}</TableCell>
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
    </div>
  );

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "finished": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "overdue": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }
}
