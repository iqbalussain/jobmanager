import { useState, useEffect } from "react";
import { Job, JobStatus } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { JobDetails } from "@/components/JobDetails";
import { 
  Filter,
  Plus,
  Settings,
  Calendar as CalendarIcon,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { isWithinInterval } from "date-fns";

interface AdminJobManagementProps {
  jobs: Job[];
  onStatusUpdate: (jobId: string, status: JobStatus) => void;
  onJobDataUpdate?: (jobData: { id: string; [key: string]: any }) => void;
}

export function AdminJobManagement({ jobs, onStatusUpdate, onJobDataUpdate }: AdminJobManagementProps) {
  const [salesmanFilter, setSalesmanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date } | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingTotalValue, setEditingTotalValue] = useState<{ [key: string]: string }>({});
  const [userRole, setUserRole] = useState<string>("employee");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        setIsAdmin(!!data);
      }
    };
    checkAdminRole();
  }, [user]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (data?.role) setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRole();
  }, [user]);

  const handleTotalValueUpdate = async (jobId: string, totalValue: string) => {
    try {
      const numericValue = parseFloat(totalValue) || 0;
      const { error } = await supabase
        .from('job_orders')
        .update({ total_value: numericValue })
        .eq('id', jobId);
      if (error) throw error;

      toast({ title: "Success", description: "Total value updated successfully" });

      if (onJobDataUpdate) {
        onJobDataUpdate({ id: jobId, totalValue: numericValue });
      }

      setEditingTotalValue(prev => {
        const newState = { ...prev };
        delete newState[jobId];
        return newState;
      });
    } catch (error) {
      console.error('Error updating total value:', error);
      toast({ title: "Error", description: "Failed to update total value", variant: "destructive" });
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await onStatusUpdate(jobId, newStatus as JobStatus);
      toast({ title: "Status Updated", description: "Job order status has been updated successfully." });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: "Error", description: "Failed to update job order status. Please try again.", variant: "destructive" });
    }
  };

  const handleEditJob = (job: Job) => {
    if (userRole === 'salesman') {
      toast({ title: "Access Denied", description: "You don't have permission to edit job orders.", variant: "destructive" });
      return;
    }
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
    setIsEditMode(true);
  };

  const handleJobUpdated = (updatedJobData: { id: string; [key: string]: any }) => {
    if (onJobDataUpdate) {
      onJobDataUpdate(updatedJobData);
    }
  };

  const clearDateFilter = () => setDateFilter(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSalesman = salesmanFilter === "all" || job.salesman?.toLowerCase().includes(salesmanFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesCustomer = customerFilter === "all" || job.customer.toLowerCase().includes(customerFilter.toLowerCase());
    const matchesBranch = branchFilter === "all" || (job.branch && job.branch.toLowerCase().includes(branchFilter.toLowerCase()));
    let matchesDate = true;
    if (dateFilter?.from) {
      const jobDate = new Date(job.createdAt);
      matchesDate = dateFilter.to
        ? isWithinInterval(jobDate, { start: dateFilter.from, end: dateFilter.to })
        : jobDate >= dateFilter.from;
    }
    return matchesSalesman && matchesStatus && matchesCustomer && matchesBranch && matchesDate;
  });

  const uniqueSalesmen = [...new Set(jobs.map(job => job.salesman))].filter(Boolean).sort();
  const uniqueCustomers = [...new Set(jobs.map(job => job.customer))].filter(Boolean).sort();
  const uniqueBranches = [...new Set(jobs.map(job => job.branch))].filter(Boolean).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "finished":
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

return (
  <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
    {!isAdmin ? (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          You don't have permission to access the admin job management panel.
        </p>
      </div>
    ) : (
      <>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Job Management</h1>
            <p className="text-gray-600">Manage all job orders with admin privileges</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Jobs Filter and Table */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Filter className="w-5 h-5 text-blue-600" />
              Job Orders Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Date Filter */}
            <div className="mb-4 flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-auto justify-start text-left font-normal",
                      !dateFilter && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter?.from ? (
                      dateFilter.to ? (
                        <>
                          {format(dateFilter.from, "LLL dd, y")} -{" "}
                          {format(dateFilter.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateFilter.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Filter by date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateFilter?.from}
                    selected={
                      dateFilter
                        ? { from: dateFilter.from, to: dateFilter.to }
                        : undefined
                    }
                    onSelect={(range) => {
                      if (range) {
                        setDateFilter({
                          from: range.from,
                          to: range.to,
                        });
                      } else {
                        setDateFilter(null);
                      }
                    }}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {dateFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateFilter}
                  className="h-8 px-2 lg:px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Salesman Filter */}
              <div className="space-y-2">
                <Label htmlFor="salesmanFilter">Filter by Salesman</Label>
                <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salesman" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Salesmen</SelectItem>
                    {uniqueSalesmen.map((salesman) => (
                      <SelectItem key={salesman} value={salesman || ''}>
                        {salesman || 'Unassigned'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Filter */}
              <div className="space-y-2">
                <Label htmlFor="customerFilter">Filter by Customer</Label>
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {uniqueCustomers.map((customer) => (
                      <SelectItem key={customer} value={customer}>
                        {customer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch Filter */}
              <div className="space-y-2">
                <Label htmlFor="branchFilter">Filter by Branch</Label>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {uniqueBranches.map((branch) => (
                      <SelectItem key={branch} value={branch || ''}>
                        {branch || 'No Branch'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="statusFilter">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="designing">Designing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="invoiced">Invoiced</SelectItem>
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
                  <TableHead>Branch</TableHead>
                  <TableHead>Salesman</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono">{job.jobOrderNumber}</TableCell>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.customer}</TableCell>
                    <TableCell>{job.branch || "N/A"}</TableCell>
                    <TableCell>{job.salesman || "Unassigned"}</TableCell>
                    <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        value={job.status}
                        onValueChange={(value) => handleStatusChange(job.id, value)}
                      >
                        <SelectTrigger className={`w-32 border-2 ${getStatusColor(job.status)}`}>
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
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {job.invoiceNumber || "Not assigned"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingTotalValue[job.id] !== undefined ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingTotalValue[job.id]}
                            onChange={(e) =>
                              setEditingTotalValue((prev) => ({
                                ...prev,
                                [job.id]: e.target.value,
                              }))
                            }
                            className="w-24"
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              handleTotalValueUpdate(job.id, editingTotalValue[job.id])
                            }
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingTotalValue((prev) => {
                                const newState = { ...prev };
                                delete newState[job.id];
                                return newState;
                              })
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            ${job.totalValue?.toFixed(2) || "0.00"}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setEditingTotalValue((prev) => ({
                                ...prev,
                                [job.id]: job.totalValue?.toString() || "0",
                              }))
                            }
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        Edit
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
          isEditMode={isEditMode}
          onJobUpdated={handleJobUpdated}
        />
      </>
    )}
  </div>
);
}