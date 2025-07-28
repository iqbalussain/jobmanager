// AdminJobManagement.tsx

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Button, Input, Label,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Popover, PopoverTrigger, PopoverContent
} from "@/components/ui";
import { Calendar } from "@/components/ui/calendar";
import { Filter, Calendar as CalendarIcon, X, Pencil } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { JobDetails } from "@/components/JobDetails";

const PAGE_SIZE = 50;

export function AdminJobManagement() {
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
  const [dateFilter, setDateFilter] = useState(null);

  const [editingTotalValue, setEditingTotalValue] = useState({});
  const [uniqueSalesmen, setUniqueSalesmen] = useState([]);
  const [uniqueCustomers, setUniqueCustomers] = useState([]);
  const [uniqueBranches, setUniqueBranches] = useState([]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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

          {/* Date Filter */}
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
                  <TableCell>{job.jobOrderNumber}</TableCell>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.customer}</TableCell>
                  <TableCell>{job.branch || "N/A"}</TableCell>
                  <TableCell>{job.salesman || "Unassigned"}</TableCell>
                  <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
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
                  <TableCell>{job.invoiceNumber || "Not Assigned"}</TableCell>
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
                        <span>${job.totalValue?.toFixed(2) || "0.00"}</span>
                        <Button size="sm" variant="ghost" onClick={() =>
                          setEditingTotalValue(prev => ({
                            ...prev,
                            [job.id]: job.totalValue?.toString() || "0"
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

      {/* Modal */}
      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
        isEditMode={isEditMode}
      />
    </div>
  );
}
