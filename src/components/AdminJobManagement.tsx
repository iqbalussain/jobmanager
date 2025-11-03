import { useState, useEffect } from "react";
import { Job, JobStatus } from "@/types/jobOrder";
import { format } from "date-fns";
import { Filter, Calendar as CalendarIcon, X, Pencil, Eye, RotateCcw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { isWithinInterval } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { JobDetails } from "@/components/JobDetails";

interface AdminJobManagementProps {
  onViewDetails?: (job: Job) => void;
  onStatusChange?: (jobId: string, status: string) => void;
  onStatusUpdate?: (jobId: string, status: JobStatus) => void;
  onJobDataUpdate?: (jobData: { id: string; [key: string]: any }) => void;
}

const PAGE_SIZE = 50;

export function AdminJobManagement({ onStatusUpdate, onJobDataUpdate }: AdminJobManagementProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [salesmanFilter, setSalesmanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<{ from: Date | undefined; to?: Date | undefined } | null>(null);


  const [uniqueSalesmen, setUniqueSalesmen] = useState([]);
  const [uniqueCustomers, setUniqueCustomers] = useState([]);
  const [uniqueBranches, setUniqueBranches] = useState([]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [editingTotalValue, setEditingTotalValue] = useState<{ [key: string]: string }>({});
  const [userRole, setUserRole] = useState<string>("employee");

  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      setIsAdmin(!!data);
    };
    checkRole();
  }, [user]);

  const loadJobs = async () => {
    try {
      const filters = {
        status: statusFilter,
        branch: branchFilter,
        salesman: salesmanFilter,
        customer: customerFilter,
        search: searchFilter,
        dateFrom: dateFilter?.from?.toISOString(),
        dateTo: dateFilter?.to?.toISOString()
      };

      const { fetchJobOrdersPaginated } = await import('@/services/jobOrdersApi');
      const result = await fetchJobOrdersPaginated(page, PAGE_SIZE, filters);
      
      // Transform data to match component expectations
      const transformedJobs = result.data.map(job => ({
        ...job,
        customer_name: job.customer?.name || "Unknown Customer",
        salesman_name: job.salesman?.name || "Unassigned", 
        designer_name: job.designer?.name || "Unassigned",
        job_title: job.job_title?.job_title_id || "No Title",
        // Transform to Job interface format for JobDetails component
        id: job.id,
        jobOrderNumber: job.job_order_number,
        title: job.job_title?.job_title_id || "No Title",
        customer: job.customer?.name || "Unknown Customer",
        designer: job.designer?.name || "Unassigned",
        salesman: job.salesman?.name || "Unassigned",
        assignee: job.assignee,
        priority: job.priority,
        status: job.status,
        dueDate: job.due_date,
        estimatedHours: job.estimated_hours || 0,
        createdAt: job.created_at,
        branch: job.branch,
        jobOrderDetails: job.job_order_details,
        invoiceNumber: job.invoice_number,
        totalValue: job.total_value,
        customer_id: job.customer_id,
        job_title_id: job.job_title_id,
        created_by: job.created_by,
        approval_status: job.approval_status,
        deliveredAt: job.delivered_at,
        clientName: job.client_name
      }));

      setJobs(transformedJobs);
      setTotalPages(result.totalPages);
      
      console.log(`Admin Job Management - Loaded ${transformedJobs.length} jobs of ${result.totalCount} total`);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({ title: "Error loading jobs", description: error.message, variant: "destructive" });
    }
  };

  const loadFilterOptions = async () => {
    try {
      // Get all job orders with their related data, applying current filters
      let query = supabase.from("job_orders").select(`
        id,
        salesman_id,
        customer_id,
        branch,
        status,
        job_order_number,
        job_order_details,
        client_name,
        assignee,
        created_at
      `);

      // Apply existing filters to get context-aware options
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }
      if (branchFilter !== "all") {
        query = query.eq("branch", branchFilter);
      }
      if (searchFilter) {
        query = query.or(`job_order_number.ilike.%${searchFilter}%,job_order_details.ilike.%${searchFilter}%,client_name.ilike.%${searchFilter}%,assignee.ilike.%${searchFilter}%`);
      }
      if (dateFilter?.from) {
        query = query.gte("created_at", dateFilter.from.toISOString());
      }
      if (dateFilter?.to) {
        query = query.lte("created_at", dateFilter.to.toISOString());
      }

      const { data: filteredJobs, error } = await query;
      
      if (error) {
        console.error("Error loading filter options:", error);
        return;
      }

      if (!filteredJobs) return;

      // Get unique IDs for batch fetching
      const salesmanIds = [...new Set(filteredJobs.map(job => job.salesman_id).filter(Boolean))];
      const customerIds = [...new Set(filteredJobs.map(job => job.customer_id).filter(Boolean))];
      const branches = [...new Set(filteredJobs.map(job => job.branch).filter(Boolean))];

      // Fetch salesman names
      const salesmenSet = new Set();
      if (salesmanIds.length > 0) {
        const { data: salesmenData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", salesmanIds);

        if (salesmenData) {
          salesmenData.forEach(salesman => {
            if (salesman.full_name && (salesmanFilter === "all" || salesman.full_name === salesmanFilter)) {
              salesmenSet.add(salesman.full_name);
            }
          });
        }
      }

      // Fetch customer names
      const customersSet = new Set();
      if (customerIds.length > 0) {
        const { data: customersData } = await supabase
          .from("customers")
          .select("id, name")
          .in("id", customerIds);

        if (customersData) {
          customersData.forEach(customer => {
            if (customer.name && (customerFilter === "all" || customer.name === customerFilter)) {
              customersSet.add(customer.name);
            }
          });
        }
      }

      // Set unique branches
      const branchesSet = new Set();
      branches.forEach(branch => {
        if (branch && (branchFilter === "all" || branch === branchFilter)) {
          branchesSet.add(branch);
        }
      });

      setUniqueSalesmen(Array.from(salesmenSet).sort());
      setUniqueCustomers(Array.from(customersSet).sort());
      setUniqueBranches(Array.from(branchesSet).sort());
      
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

  const clearAllFilters = () => {
    setSalesmanFilter("all");
    setCustomerFilter("all");
    setBranchFilter("all");
    setStatusFilter("all");
    setSearchFilter("");
    setDateFilter(null);
    setPage(1);
  };

  const hasActiveFilters = () => {
    return salesmanFilter !== "all" || 
           customerFilter !== "all" || 
           branchFilter !== "all" || 
           statusFilter !== "all" || 
           searchFilter !== "" || 
           dateFilter !== null;
  };

  const handleStatusChange = async (jobId, newStatus) => {
    const { error } = await supabase.from("job_orders").update({ status: newStatus }).eq("id", jobId);
    if (!error) loadJobs();
  };

  const handleTotalValueUpdate = async (jobId, newValue) => {
    const { error } = await supabase.from("job_orders").update({ total_value: parseFloat(newValue) }).eq("id", jobId);
    if (!error) {
      toast({ title: "Updated" });
      setEditingTotalValue(prev => {
        const newState = { ...prev };
        delete newState[jobId];
        return newState;
      });
      loadJobs();
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadJobs();
    }
  }, [isAdmin, page, salesmanFilter, customerFilter, branchFilter, statusFilter, searchFilter, dateFilter]);

  // Load filter options when admin status changes or when filters change (to get context-aware options)
  useEffect(() => {
    if (isAdmin) {
      loadFilterOptions();
    }
  }, [isAdmin, salesmanFilter, customerFilter, branchFilter, statusFilter, searchFilter, dateFilter]);

  if (!isAdmin) return <div className="p-6">Access Denied</div>;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Job Management</h1>
      
      {/* Jobs Count Info */}
      <Card className="mb-4">
        <CardContent className="py-4">
          <div className="text-lg font-semibold text-gray-700">
            Showing {jobs.length} jobs (Page {page} of {totalPages})
          </div>
        </CardContent>
      </Card>

      {/* Filter Panel */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-900">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Job Orders Management
              {hasActiveFilters() && (
                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Filters Active
                </span>
              )}
            </div>
            {hasActiveFilters() && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All Filters
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Field */}
          <div className="mb-4">
            <Label>Search Job Orders</Label>
            <Input
              placeholder="Search by job number, details, client name, or assignee..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Salesman Filter */}
            <div className="space-y-2">
              <Label>Filter by Salesman</Label>
              <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
                <SelectTrigger><SelectValue placeholder="Select salesman" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueSalesmen.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Filter */}
            <div className="space-y-2">
              <Label>Filter by Customer</Label>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueCustomers.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Branch Filter */}
            <div className="space-y-2">
              <Label>Filter by Branch</Label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueBranches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="designing">Designing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="invoiced">Invoiced</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-auto justify-start text-left font-normal", !dateFilter && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter?.from
                    ? `${format(dateFilter.from, "LLL dd, y")}${dateFilter?.to ? ` - ${format(dateFilter.to, "LLL dd, y")}` : ""}`
                    : "Filter by date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="range"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {dateFilter && (
              <Button variant="ghost" size="sm" onClick={() => setDateFilter(null)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Order #</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Salesman</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono">{job.job_order_number || "N/A"}</TableCell>
                  <TableCell className="font-medium">{job.job_title || "N/A"}</TableCell>
                  <TableCell>{job.customer_name || "N/A"}</TableCell>
                  <TableCell>{job.branch || "N/A"}</TableCell>
                  <TableCell>{job.salesman_name || 'Unassigned'}</TableCell>
                  <TableCell>{job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell>
                    <Select value={job.status} onValueChange={(val) => handleStatusChange(job.id, val)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="designing">Designing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                        <SelectItem value="invoiced">Invoiced</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {editingTotalValue[job.id] !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingTotalValue[job.id]}
                          onChange={(e) =>
                            setEditingTotalValue(prev => ({ ...prev, [job.id]: e.target.value }))
                          }
                          className="w-24"
                        />
                        <Button size="sm" onClick={() => handleTotalValueUpdate(job.id, editingTotalValue[job.id])}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          const updated = { ...editingTotalValue };
                          delete updated[job.id];
                          setEditingTotalValue(updated);
                        }}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>${job.total_value?.toFixed(2) || "0.00"}</span>
                        <Button size="sm" variant="ghost" onClick={() =>
                          setEditingTotalValue(prev => ({
                            ...prev,
                            [job.id]: job.total_value?.toString() || "0"
                          }))
                        }>
                          Edit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{job.invoice_number || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedJob(job);
                        setIsJobDetailsOpen(true);
                        setIsEditMode(false);
                      }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedJob(job);
                        setIsJobDetailsOpen(true);
                        setIsEditMode(true);
                      }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span>Page {page} of {totalPages}</span>
        <Button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>

      {/* Job Details Modal */}
      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
        isEditMode={isEditMode}
      />
    </div>
  );
}
