import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { JobDetails } from "@/components/JobDetails";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Filter, Calendar as CalendarIcon } from "lucide-react";

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

  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);

  const [uniqueSalesmen, setUniqueSalesmen] = useState([]);
  const [uniqueCustomers, setUniqueCustomers] = useState([]);
  const [uniqueBranches, setUniqueBranches] = useState([]);

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

  const buildFilters = () => {
    const filters = [];
    if (salesmanFilter !== "all") filters.push({ field: "salesman", op: "ilike", value: `%${salesmanFilter}%` });
    if (statusFilter !== "all") filters.push({ field: "status", op: "eq", value: statusFilter });
    if (customerFilter !== "all") filters.push({ field: "customer", op: "ilike", value: `%${customerFilter}%` });
    if (branchFilter !== "all") filters.push({ field: "branch", op: "ilike", value: `%${branchFilter}%` });
    return filters;
  };

  const loadJobs = async () => {
    let query = supabase.from("job_orders").select("*", { count: "exact" });

    const filters = buildFilters();
    filters.forEach(({ field, op, value }) => {
      query = query[op](field, value);
    });

    if (dateFilter?.from) {
      query = query.gte("createdAt", dateFilter.from.toISOString());
    }
    if (dateFilter?.to) {
      query = query.lte("createdAt", dateFilter.to.toISOString());
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to).order("createdAt", { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setJobs(data || []);
    setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
  };

  const loadUniqueFields = async () => {
    const { data, error } = await supabase.from("job_orders").select("salesman, customer, branch");
    if (!error && data) {
      setUniqueSalesmen([...new Set(data.map((j) => j.salesman).filter(Boolean))]);
      setUniqueCustomers([...new Set(data.map((j) => j.customer).filter(Boolean))]);
      setUniqueBranches([...new Set(data.map((j) => j.branch).filter(Boolean))]);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadJobs();
      loadUniqueFields();
    }
  }, [isAdmin, page, salesmanFilter, statusFilter, customerFilter, branchFilter, dateFilter]);

  if (!isAdmin) return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
      <p className="text-gray-600">You don't have access to this page.</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Job Management</h1>
          <p className="text-gray-600">Manage jobs with full control</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle><Filter className="inline-block w-5 h-5 mr-2" />Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
              <SelectTrigger><SelectValue placeholder="Salesman" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueSalesmen.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger><SelectValue placeholder="Customer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueCustomers.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger><SelectValue placeholder="Branch" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueBranches.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start", !dateFilter && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4" />{dateFilter?.from ? format(dateFilter.from, "LLL dd, y") + (dateFilter.to ? ` - ${format(dateFilter.to, "LLL dd, y")}` : '') : "Pick Date Range"}</Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0 z-50 max-w-full">
                <Calendar
                  mode="range"
                  selected={dateFilter || undefined}
                  onSelect={setDateFilter}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.jobOrderNumber}</TableCell>
                  <TableCell>{job.customer}</TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => {
                      setSelectedJob(job);
                      setIsJobDetailsOpen(true);
                    }}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <span>Page {page} of {totalPages}</span>
        <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>

      {/* Job Details Modal */}
      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />
    </div>
  );
}
