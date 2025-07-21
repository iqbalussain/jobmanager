
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Job } from "@/pages/Index";

interface PendingJob {
  id: string;
  job_order_number: string;
  customer_name: string;
  created_at: string;
  job_order_details: string;
  created_by_name: string;
  title: string;
  priority: "low" | "medium" | "high";
  status: string;
  due_date: string;
  estimated_hours: number;
  branch: string;
  assignee: string;
  designer_name: string;
  salesman_name: string;
  total_value: number;
  invoice_number: string;
  delivered_at: string;
}

interface ApprovalBoxProps {
  onViewJob?: (job: Job) => void;
}

export function ApprovalBox({ onViewJob }: ApprovalBoxProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
          title,
          priority,
          status,
          due_date,
          estimated_hours,
          branch,
          assignee,
          total_value,
          invoice_number,
          delivered_at,
          customer:customers!fk_job_orders_customer(name),
          designer:profiles!job_orders_designer_id_fkey(full_name),
          salesman:profiles!job_orders_salesman_id_fkey(full_name)
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
            created_by_name: createdByName,
            title: job.title || job.job_order_details || `Job Order ${job.job_order_number}`,
            priority: job.priority as "low" | "medium" | "high",
            status: job.status,
            due_date: job.due_date || new Date().toISOString().split("T")[0],
            estimated_hours: job.estimated_hours || 0,
            branch: job.branch || '',
            assignee: job.assignee || 'Unassigned',
            designer_name: job.designer?.full_name || 'Unassigned',
            salesman_name: job.salesman?.full_name || 'Unassigned',
            total_value: job.total_value || 0,
            invoice_number: job.invoice_number || '',
            delivered_at: job.delivered_at || ''
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

  const handleViewJob = (pendingJob: PendingJob) => {
    if (onViewJob) {
      const job: Job = {
        id: pendingJob.id,
        jobOrderNumber: pendingJob.job_order_number,
        title: pendingJob.title,
        customer: pendingJob.customer_name,
        assignee: pendingJob.assignee,
        designer: pendingJob.designer_name,
        salesman: pendingJob.salesman_name,
        priority: pendingJob.priority,
        status: pendingJob.status as any,
        dueDate: pendingJob.due_date,
        estimatedHours: pendingJob.estimated_hours,
        createdAt: pendingJob.created_at.split("T")[0],
        branch: pendingJob.branch,
        jobOrderDetails: pendingJob.job_order_details,
        totalValue: pendingJob.total_value,
        invoiceNumber: pendingJob.invoice_number,
        deliveredAt: pendingJob.delivered_at,
        approval_status: 'pending_approval'
      };
      onViewJob(job);
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
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
        <CardTitle className="flex items-center gap-2 text-white text-base lg:text-lg">
          <AlertCircle className="w-5 h-5" />
          Pending Approvals ({pendingJobs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-6 px-6 flex-1 overflow-hidden">
        {pendingJobs.length === 0 ? (
          <div className="text-center text-gray-500 py-8 flex-1 flex flex-col justify-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-base">No pending approvals</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-4">
              {pendingJobs.map((job) => (
                <div key={job.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-sm text-gray-900">{job.job_order_number}</h4>
                    <p className="text-sm text-gray-600">{job.customer_name}</p>
                    <p className="text-sm text-gray-500 truncate">{job.job_order_details}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 shrink-0">
                    Pending
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      onClick={() => handleViewJob(job)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-sm bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      onClick={() => handleApproval(job.id, 'approve')}
                      disabled={approvalMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-sm bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      onClick={() => handleApproval(job.id, 'reject')}
                      disabled={approvalMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Created by: {job.created_by_name}
                </div>
              </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
