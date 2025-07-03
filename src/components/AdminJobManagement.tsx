import { useState } from "react";
import { Job, JobStatus } from "@/types/job";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnapprovedJobsList } from "@/components/job-management/UnapprovedJobsList";
import { ApprovedJobsList } from "@/components/job-management/ApprovedJobsList";
import { useAuth } from "@/hooks/useAuth";
import { useJobOrders } from "@/hooks/useJobOrders";
import { useJobTransform } from "@/hooks/useJobTransform";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users } from "lucide-react";

export function AdminJobManagement() {
  const { user } = useAuth();
  const { jobOrders, isLoading, updateStatus, refetch } = useJobOrders();
  const transformedJobs = useJobTransform(jobOrders);
  
  // Filter jobs based on approval status
  const unapprovedJobs = transformedJobs.filter(job => 
    job.approval_status === 'pending' || !job.approval_status
  );
  
  const approvedJobs = transformedJobs.filter(job => 
    job.approval_status === 'approved'
  );

  const handleStatusUpdate = (jobId: string, status: JobStatus) => {
    updateStatus({ id: jobId, status });
  };

  const handleJobApproved = () => {
    refetch(); // Refresh job orders after approval
  };

  const stats = {
    total: transformedJobs.length,
    unapproved: unapprovedJobs.length,
    approved: approvedJobs.length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Management</h1>
          <p className="text-gray-600">Manage and approve job orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unapproved}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different job lists */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Job Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unapproved" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unapproved" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Approval
                {stats.unapproved > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.unapproved}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Approved Jobs
                {stats.approved > 0 && (
                  <Badge variant="default" className="ml-2">
                    {stats.approved}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="unapproved" className="mt-6">
              <UnapprovedJobsList 
                jobs={unapprovedJobs}
                userRole={user?.role || ''}
                onJobApproved={handleJobApproved}
              />
            </TabsContent>
            
            <TabsContent value="approved" className="mt-6">
              <ApprovedJobsList 
                jobs={approvedJobs}
                onStatusUpdate={handleStatusUpdate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
