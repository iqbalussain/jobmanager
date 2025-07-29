import { useState, useEffect } from "react";
import { Job, JobStatus } from "@/pages/Index";
import { format } from "date-fns";
import { Filter, Calendar as CalendarIcon, X, Pencil } from "lucide-react";

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
  jobs: Job;
  onViewDetails: (job: Job) => void;
  onStatusChange: (jobId: string, status: string) => void;
  onStatusUpdate: (jobId: string, status: JobStatus) => void;
  onJobDataUpdate?: (jobData: { id: string; [key: string]: any }) => void;
}

const PAGE_SIZE = 50;

export function AdminJobManagement({onStatusUpdate, onJobDataUpdate }: AdminJobManagementProps) {
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
    let query = supabase.from("job_orders").select("*", { count: "exact" });

    if (salesmanFilter !== "all") query = query.ilike("salesman", `%${salesmanFilter}%`);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (customerFilter !== "all") query = query.ilike("customer", `%${customerFilter}%`);
    if (branchFilter !== "all") query = query.ilike("branch", `%${branchFilter}%`);

    if (dateFilter?.from) query = query.gte("created_at", dateFilter.from.toISOString());
    if (dateFilter?.to) query = query.lte("created_at", dateFilter.to.toISOString());

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await query.range(from, to).order("created_at", { ascending: false });

    if (error) {

      toast({ title: "Error loading jobs", description: error.message, variant: "destructive" });
    } else {
      console.log("Jobs loaded from Supabase:", data); // 🔥 This is important!
      setJobs(data || []);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    }
  };

  const loadFilterOptions = async () => {
    const { data, error } = await supabase.from("job_orders").select("salesman, customer, branch");
    if (!error && data) {
      setUniqueSalesmen([...new Set(data.map((j) => j.salesman).filter(Boolean))]);
      setUniqueCustomers([...new Set(data.map((j) => j.customer).filter(Boolean))]);
      setUniqueBranches([...new Set(data.map((j) => j.branch).filter(Boolean))]);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    const { error } = await supabase.from("job_orders").update({ status: newStatus }).eq("id", jobId);
    if (!error) loadJobs();
  };

  const handleTotalValueUpdate = async (jobId, newValue) => {
    const { error } = await supabase.from("job_orders").update({ totalValue: parseFloat(newValue) }).eq("id", jobId);
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
      loadFilterOptions();
    }
  }, [isAdmin, page, salesmanFilter, customerFilter, branchFilter, statusFilter, dateFilter]);

  if (!isAdmin) return <div className="p-6">Access Denied</div>;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Job Management</h1>

      {/* Filter Panel */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Filter className="w-5 h-5 text-blue-600" />
            Job Orders Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Salesman Filter */}
            <div className="space-y-2">
              <Label>Filter by Salesman</Label>
              <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
                <SelectTrigger><SelectValue placeholder="All Salesmen" /></SelectTrigger>
                <SelectContent>
                 <SelectItem value="all">All Salesmen</SelectItem>
                  {uniqueSalesmen.map((salesman) => (
                    <SelectItem key={salesman} value={salesman || ''}>
                      {salesman || 'Unassigned'}
                  </SelectItem>)}
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
                  <SelectItem value="invoiced">Invoiced</SelectItem>
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
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono">{job.job_order_number || "N/A"}</TableCell>
                  <TableCell className="font-medium">{job.title || "N/A"}</TableCell>
                  <TableCell>{job.customer?.name || "N/A"}</TableCell>
                  <TableCell>{job.branch || "N/A"}</TableCell>
                  <TableCell>{job.salesman?.name || 'Unassigned'}</TableCell>
                  <TableCell>{job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell>{job.invoice_number || "Not Assigned"}</TableCell>
                  <TableCell>${job.total_value?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    <Select value={job.status} onValueChange={(val) => handleStatusChange(job.id, val)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="designing">Designing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="invoiced">Invoiced</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{job.invoice_Number || "Not Assigned"}</TableCell>
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
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => {
                      setSelectedJob(job);
                      setIsJobDetailsOpen(true);
                      setIsEditMode(true);
                    }}>
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
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
