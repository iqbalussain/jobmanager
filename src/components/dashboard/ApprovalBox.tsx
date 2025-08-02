
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobDetails } from "@/components/JobDetails";
import { useState } from "react";

interface PendingJob {
  id: string;
  job_order_number: string;
  customer_name: string;
  created_at: string;
  job_order_details: string;
  created_by_name: string;
}

export function ApprovalBox() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);

  const { data: pendingJobs = [], isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async (): Promise<PendingJob[]> => {
      const { data: jobOrders, error } = await supabase
        .from('job_orders')
        .select(`
          id,
          job_order_number,
          job_order_details,
          created_at,
          created_by,
          customer:customers!fk_job_orders_customer(name)
        `)
        .eq('approval_status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch creator names separately
      const jobsWithCreators = await Promise.all(
        jobOrders.map(async (job) => {
          let createdByName = 'Unknown User';
          
          if (job.created_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', job.created_by)
              .single();
            
            if (profile?.full_name) {
              createdByName = profile.full_name;
            }
          }

          return {
            id: job.id,
            job_order_number: job.job_order_number,
            customer_name: job.customer?.name || 'Unknown Customer',
            created_at: job.created_at,
            job_order_details: job.job_order_details || '',
            created_by_name: createdByName
          };
        })
      );

      return jobsWithCreators;
    },
    enabled: !!user
  });

  const approvalMutation = useMutation({
    mutationFn: async ({ jobId, action }: { jobId: string; action: 'approve' | 'reject' }) => {
      const { error } = await supabase
        .from('job_orders')
        .update({
          approval_status: action === 'approve' ? 'approved' : 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;
      return { jobId, action };
    },
    
    onMutate: async ({ jobId, action }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['pending-approvals'] });
      await queryClient.cancelQueries({ queryKey: ['job-orders'] });
      
      // Snapshot the previous values
      const previousPendingJobs = queryClient.getQueryData(['pending-approvals']);
      
      // Optimistically remove from pending approvals
      queryClient.setQueryData(['pending-approvals'], (old: PendingJob[] | undefined) => {
        if (!old) return old;
        return old.filter(job => job.id !== jobId);
      });
      
      return { previousPendingJobs };
    },
    
    onSuccess: (_, { action }) => {
      toast({
        title: action === 'approve' ? "Job Approved" : "Job Rejected",
        description: `Job order has been ${action}d successfully.`,
      });
    },
    
    onError: (error, _, context) => {
      // Roll back optimistic updates
      if (context?.previousPendingJobs) {
        queryClient.setQueryData(['pending-approvals'], context.previousPendingJobs);
      }
      console.error('Approval error:', error);
      toast({
        title: "Error",
        description: "Failed to process approval. Please try again.",
        variant: "destructive",
      });
    },
    
    onSettled: () => {
      // Always refetch to sync with server state
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
    }
  });

  const handleApproval = (jobId: string, action: 'approve' | 'reject') => {
    approvalMutation.mutate({ jobId, action });
  };

  const handleViewJob = async (jobId: string) => {
    try {
      // Fetch full job details separately to avoid complex joins
      const { data: jobOrder, error } = await supabase
        .from('job_orders')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      // Fetch related data separately
      const [customerData, designerData, salesmanData, jobTitleData] = await Promise.all([
        supabase.from('customers').select('name').eq('id', jobOrder.customer_id).single(),
        jobOrder.designer_id ? supabase.from('profiles').select('full_name').eq('id', jobOrder.designer_id).single() : Promise.resolve({ data: null }),
        jobOrder.salesman_id ? supabase.from('profiles').select('full_name').eq('id', jobOrder.salesman_id).single() : Promise.resolve({ data: null }),
        jobOrder.job_title_id ? supabase.from('job_titles').select('job_title_id').eq('id', jobOrder.job_title_id).single() : Promise.resolve({ data: null })
      ]);

      // Transform to match the expected Job interface
      const transformedJob = {
        id: jobOrder.id,
        title: jobTitleData.data?.job_title_id || 'Unknown Job Title',
        customer: customerData.data?.name || 'Unknown Customer',
        designer: designerData.data?.full_name || 'Unassigned',
        salesman: salesmanData.data?.full_name || 'Unassigned',
        assignee: jobOrder.assignee,
        jobOrderNumber: jobOrder.job_order_number,
        priority: jobOrder.priority,
        status: jobOrder.status,
        dueDate: jobOrder.due_date,
        estimatedHours: jobOrder.estimated_hours || 0,
        createdAt: jobOrder.created_at,
        branch: jobOrder.branch,
        jobOrderDetails: jobOrder.job_order_details,
        invoiceNumber: jobOrder.invoice_number,
        totalValue: jobOrder.total_value,
        customer_id: jobOrder.customer_id,
        job_title_id: jobOrder.job_title_id,
        created_by: jobOrder.created_by,
        approval_status: jobOrder.approval_status,
        deliveredAt: jobOrder.delivered_at,
        clientName: jobOrder.client_name
      };

      setSelectedJob(transformedJob);
      setIsJobDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 h-full flex flex-col rounded-2xl">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-1 text-white text-sm">
            <AlertCircle className="w-6 h-5" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="text-center text-gray-500">Loading approvals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 h-full flex flex-col rounded-2xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-1 text-white text-sm">
          <AlertCircle className="w-5 h-6" />
          Pending Approvals ({pendingJobs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {pendingJobs.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <CheckCircle className="w-10 h-8 mx-auto mb-1 text-green-500" />
            <p className="text-sm">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingJobs.map((job) => (
              <div key={job.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{job.job_order_number}</h4>
                    <p className="text-xs text-gray-600">{job.customer_name}</p>
                    <p className="text-xs text-gray-500 truncate">{job.job_order_details}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Pending
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      onClick={() => handleViewJob(job.id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      onClick={() => handleApproval(job.id, 'approve')}
                      disabled={approvalMutation.isPending}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      onClick={() => handleApproval(job.id, 'reject')}
                      disabled={approvalMutation.isPending}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Created by: {job.created_by_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Job Details Modal */}
      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => {
          setIsJobDetailsOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        isEditMode={false}
        onJobUpdated={(updatedJob) => {
          // Handle approval from within job details
          if (updatedJob.approvalStatus === 'approved' || updatedJob.approvalStatus === 'rejected') {
            // Refresh the pending approvals list
            queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['job-orders'] });
            setIsJobDetailsOpen(false);
            setSelectedJob(null);
          }
        }}
      />
    </Card>
  );
}
