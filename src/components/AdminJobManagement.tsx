import { useState, useEffect } from "react";
import { Job, JobStatus } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { 
  Filter,
  Plus,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminJobManagementProps {
  jobs: Job[];
  onStatusUpdate: (jobId: string, status: JobStatus) => void;
}

export function AdminJobManagement({ jobs, onStatusUpdate }: AdminJobManagementProps) {
  const [salesmanFilter, setSalesmanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [jobsWithInvoices, setJobsWithInvoices] = useState<Job[]>(jobs);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user is admin
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

  // Fetch fresh job data with invoice numbers
  useEffect(() => {
    const fetchJobsWithInvoices = async () => {
      try {
        const { data, error } = await supabase
          .from('job_orders')
          .select(`
            *,
            customer:customers(id, name),
            job_title:job_titles(id, job_title_id)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform the data to match Job interface
        const transformedJobs = await Promise.all(data.map(async (jobOrder) => {
          let designer = null;
          let salesman = null;
          
          if (jobOrder.designer_id) {
            const { data: designerData } = await supabase
              .from('profiles')
              .select('id, full_name, phone')
              .eq('id', jobOrder.designer_id)
              .single();
            
            if (designerData) {
              designer = {
                id: designerData.id,
                name: designerData.full_name || 'Unknown Designer',
                phone: designerData.phone
              };
            }
          }
          
          if (jobOrder.salesman_id) {
            const { data: salesmanData } = await supabase
              .from('profiles')
              .select('id, full_name, email, phone')
              .eq('id', jobOrder.salesman_id)
              .single();
            
            if (salesmanData) {
              salesman = {
                id: salesmanData.id,
                name: salesmanData.full_name || 'Unknown Salesman',
                email: salesmanData.email,
                phone: salesmanData.phone
              };
            }
          }
          
          // Create the title from available data
          const title = jobOrder.job_title?.job_title_id || 
                       jobOrder.job_order_details || 
                       `Job Order ${jobOrder.job_order_number}`;
          
          return {
            id: jobOrder.id,
            jobOrderNumber: jobOrder.job_order_number,
            title: title,
            customer: jobOrder.customer?.name || "Unknown Customer",
            assignee: jobOrder.assignee || "Unassigned",
            priority: jobOrder.priority as "low" | "medium" | "high",
            status: jobOrder.status as JobStatus,
            dueDate: jobOrder.due_date || new Date().toISOString().split('T')[0],
            createdAt: jobOrder.created_at.split('T')[0],
            estimatedHours: jobOrder.estimated_hours || 0,
            branch: jobOrder.branch || "",
            designer: designer?.name || "Unassigned",
            salesman: salesman?.name || "Unassigned",
            jobOrderDetails: jobOrder.job_order_details || "",
            invoiceNumber: jobOrder.invoice_number || ""
          };
        }));
        
        setJobsWithInvoices(transformedJobs);
      } catch (error) {
        console.error('Error fetching jobs with invoices:', error);
        setJobsWithInvoices(jobs);
      }
    };
    
    fetchJobsWithInvoices();
  }, [jobs]);

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin job management panel.</p>
        </div>
      </div>
    );
  }

  const filteredJobs = jobsWithInvoices.filter(job => {
    const matchesSalesman = salesmanFilter === "all" || job.salesman.toLowerCase().includes(salesmanFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesCustomer = customerFilter === "all" || job.customer.toLowerCase().includes(customerFilter.toLowerCase());
    const matchesBranch = branchFilter === "all" || (job.branch && job.branch.toLowerCase().includes(branchFilter.toLowerCase()));
    return matchesSalesman && matchesStatus && matchesCustomer && matchesBranch;
  });

  // Get unique values for filter dropdowns
  const uniqueSalesmen = [...new Set(jobsWithInvoices.map(job => job.salesman))].filter(Boolean).sort();
  const uniqueCustomers = [...new Set(jobsWithInvoices.map(job => job.customer))].filter(Boolean).sort();
  const uniqueBranches = [...new Set(jobsWithInvoices.map(job => job.branch))].filter(Boolean).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      case "working": return "bg-orange-100 text-orange-800 border-orange-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "finished": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
    setIsEditMode(true);
  };

  return (
    <div className="space-y-6">
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
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="branchFilter">Filter by Branch</Label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {uniqueBranches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
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
                <TableHead>Status</TableHead>
                <TableHead>Invoice #</TableHead>
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
                  <TableCell>{job.salesman}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status === 'working' ? 'Working' : job.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {job.invoiceNumber || "Not assigned"}
                    </span>
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
        onClose={() => {
          setIsJobDetailsOpen(false);
          // Refresh data when closing modal to get latest invoice numbers
          const fetchJobs = async () => {
            try {
              const { data, error } = await supabase
                .from('job_orders')
                .select(`
                  *,
                  customer:customers(id, name),
                  job_title:job_titles(id, job_title_id)
                `)
                .order('created_at', { ascending: false });
              
              if (error) throw error;
              
              const transformedJobs = await Promise.all(data.map(async (jobOrder) => {
                let designer = null;
                let salesman = null;
                
                if (jobOrder.designer_id) {
                  const { data: designerData } = await supabase
                    .from('profiles')
                    .select('id, full_name, phone')
                    .eq('id', jobOrder.designer_id)
                    .single();
                  
                  if (designerData) {
                    designer = {
                      id: designerData.id,
                      name: designerData.full_name || 'Unknown Designer',
                      phone: designerData.phone
                    };
                  }
                }
                
                if (jobOrder.salesman_id) {
                  const { data: salesmanData } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, phone')
                    .eq('id', jobOrder.salesman_id)
                    .single();
                  
                  if (salesmanData) {
                    salesman = {
                      id: salesmanData.id,
                      name: salesmanData.full_name || 'Unknown Salesman',
                      email: salesmanData.email,
                      phone: salesmanData.phone
                    };
                  }
                }
                
                // Create the title from available data
                const title = jobOrder.job_title?.job_title_id || 
                             jobOrder.job_order_details || 
                             `Job Order ${jobOrder.job_order_number}`;
                
                return {
                  id: jobOrder.id,
                  jobOrderNumber: jobOrder.job_order_number,
                  title: title,
                  customer: jobOrder.customer?.name || "Unknown Customer",
                  assignee: jobOrder.assignee || "Unassigned",
                  priority: jobOrder.priority as "low" | "medium" | "high",
                  status: jobOrder.status as JobStatus,
                  dueDate: jobOrder.due_date || new Date().toISOString().split('T')[0],
                  createdAt: jobOrder.created_at.split('T')[0],
                  estimatedHours: jobOrder.estimated_hours || 0,
                  branch: jobOrder.branch || "",
                  designer: designer?.name || "Unassigned",
                  salesman: salesman?.name || "Unassigned",
                  jobOrderDetails: jobOrder.job_order_details || "",
                  invoiceNumber: jobOrder.invoice_number || ""
                };
              }));
              
              setJobsWithInvoices(transformedJobs);
            } catch (error) {
              console.error('Error refreshing jobs:', error);
            }
          };
          fetchJobs();
        }}
        job={selectedJob}
        isEditMode={isEditMode}
      />
    </div>
  );
}
