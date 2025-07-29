
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Truck, 
  Search, 
  Filter, 
  Download, 
  Plus,
  Settings,
  Calendar,
  MapPin,
  Users,
  Package
} from "lucide-react";
import { useJobOrders } from "@/hooks/useJobOrders";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobStatus } from "@/types/jobOrder";

const deliveryLocations = [
  "Head Office",
  "Wajihat",
  "Ruwi Branch",
  "Ghobra",
  "Direct Customer"
];

const statusOptions = [
  { value: "completed" as JobStatus, label: "Completed", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "invoiced" as JobStatus, label: "Invoiced", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "finished" as JobStatus, label: "Delivered", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "in-progress" as JobStatus, label: "In Transit", color: "bg-orange-100 text-orange-800 border-orange-200" }
];

const PAGE_SIZE = 50;

export function DeliveryRecord() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [salesmanFilter, setSalesmanFilter] = useState("all");
  const [customLocations, setCustomLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const { jobOrders, isLoading, updateJobData } = useJobOrders();

  const { user } = useAuth();
  const { toast } = useToast();

  const allLocations = [...deliveryLocations, ...customLocations];

  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_orders')
        .update({ status: newStatus as JobStatus })
        .eq('id', jobId);

      if (error) throw error;

      updateJobData({ id: jobId, status: newStatus as JobStatus });
      toast({
        title: "Status Updated",
        description: "Delivery status has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeliveryLocationUpdate = async (jobId: string, location: string) => {
    try {
      const { error } = await supabase
        .from('job_orders')
        .update({ delivered_at: location })
        .eq('id', jobId);

      if (error) throw error;

      updateJobData({ id: jobId, delivered_at: location });
      toast({
        title: "Location Updated",
        description: "Delivery location has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery location. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addCustomLocation = () => {
    if (newLocation.trim() && !allLocations.includes(newLocation.trim())) {
      setCustomLocations([...customLocations, newLocation.trim()]);
      setNewLocation("");
      setIsAddLocationOpen(false);
      toast({
        title: "Location Added",
        description: "New delivery location has been added successfully.",
      });
    }
  };

  const filteredJobs = jobOrders.filter(job => {
    const matchesSearch = job.job_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.job_order_details && job.job_order_details.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesSalesman = salesmanFilter === "all" || 
                           (job.salesman && job.salesman.name?.toLowerCase().includes(salesmanFilter.toLowerCase()));
    
    return matchesSearch && matchesStatus && matchesSalesman;
  });

  const uniqueSalesmen = [...new Set(jobOrders.map(job => job.salesman?.name).filter(Boolean))];

  const getStatusBadgeStyle = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              Delivery Record
            </h1>
            <p className="text-gray-600 text-lg">Track and manage job order deliveries</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Delivery Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newLocation">Location Name</Label>
                    <Input
                      id="newLocation"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Enter new delivery location"
                    />
                  </div>
                  <Button onClick={addCustomLocation} className="w-full">
                    Add Location
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="shadow-md">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{jobOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {jobOrders.filter(job => job.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Invoiced</p>
                <p className="text-3xl font-bold text-blue-600">
                  {jobOrders.filter(job => job.status === 'invoiced').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-3xl font-bold text-orange-600">
                  {jobOrders.filter(job => job.status === 'in-progress').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Filter className="w-5 h-5 text-indigo-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by order number or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusFilter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesmanFilter">Filter by Salesman</Label>
              <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Salesmen" />
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

            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setSalesmanFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Records Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Package className="w-5 h-5 text-indigo-600" />
            Delivery Records ({filteredJobs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Job Order #</TableHead>
                    <TableHead className="font-semibold">Job Title</TableHead>
                    <TableHead className="font-semibold">Salesman</TableHead>
                    <TableHead className="font-semibold">Delivery Location</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-white/50">
                      <TableCell className="font-mono font-medium">
                        {job.job_order_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {job.job_order_details || `Job ${job.job_order_number}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          {job.salesman?.name || 'Unassigned'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={job.delivered_at || ""}
                          onValueChange={(value) => handleDeliveryLocationUpdate(job.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select location">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{job.delivered_at || 'Not set'}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {allLocations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={job.status}
                          onValueChange={(value) => handleStatusUpdate(job.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              <Badge 
                                variant="outline" 
                                className={`${getStatusBadgeStyle(job.status)} border-2`}
                              >
                                {statusOptions.find(s => s.value === job.status)?.label || job.status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                <Badge variant="outline" className={`${status.color} border-2`}>
                                  {status.label}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span>Page {page} of {totalPages}</span>
        <Button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
