
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
import { updateJobInCache } from "@/services/syncService";
import { useGamingMode } from "@/App";
import { cn } from "@/lib/utils";

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
  const { gamingMode } = useGamingMode();
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

      const jobsWithCreators = await Promise.all(
        jobOrders.map(async (job) => {
          let createdByName = 'Unknown User';
          if (job.created_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', job.created_by)
              .single();
            if (profile?.full_name) createdByName = profile.full_name;
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
    onMutate: async ({ jobId }) => {
      await queryClient.cancelQueries({ queryKey: ['pending-approvals'] });
      await queryClient.cancelQueries({ queryKey: ['job-orders'] });
      const previousPendingJobs = queryClient.getQueryData(['pending-approvals']);
      queryClient.setQueryData(['pending-approvals'], (old: PendingJob[] | undefined) =>
        old ? old.filter(job => job.id !== jobId) : old
      );
      return { previousPendingJobs };
    },
    onSuccess: async ({ jobId }, { action }) => {
      try { await updateJobInCache(jobId); } catch (e) { console.error('Failed to update Dexie cache:', e); }
      toast({
        title: action === 'approve' ? "Job Approved" : "Job Rejected",
        description: `Job order has been ${action}d successfully.`,
      });
    },
    onError: (error, _, context) => {
      if (context?.previousPendingJobs) queryClient.setQueryData(['pending-approvals'], context.previousPendingJobs);
      console.error('Approval error:', error);
      toast({ title: "Error", description: "Failed to process approval. Please try again.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
    }
  });

  const handleApproval = (jobId: string, action: 'approve' | 'reject') => {
    approvalMutation.mutate({ jobId, action });
  };

  const handleViewJob = async (jobId: string) => {
    try {
      const { data: jobOrder, error } = await supabase.from('job_orders').select('*').eq('id', jobId).single();
      if (error) throw error;
      const [customerData, designerData, salesmanData, jobTitleData] = await Promise.all([
        supabase.from('customers').select('name').eq('id', jobOrder.customer_id).single(),
        jobOrder.designer_id ? supabase.from('profiles').select('full_name').eq('id', jobOrder.designer_id).single() : Promise.resolve({ data: null }),
        jobOrder.salesman_id ? supabase.from('profiles').select('full_name').eq('id', jobOrder.salesman_id).single() : Promise.resolve({ data: null }),
        jobOrder.job_title_id ? supabase.from('job_titles').select('job_title_id').eq('id', jobOrder.job_title_id).single() : Promise.resolve({ data: null })
      ]);
      setSelectedJob({
        id: jobOrder.id, title: jobTitleData.data?.job_title_id || 'Unknown Job Title',
        customer: customerData.data?.name || 'Unknown Customer', designer: designerData.data?.full_name || 'Unassigned',
        salesman: salesmanData.data?.full_name || 'Unassigned', assignee: jobOrder.assignee,
        jobOrderNumber: jobOrder.job_order_number, priority: jobOrder.priority, status: jobOrder.status,
        dueDate: jobOrder.due_date, estimatedHours: jobOrder.estimated_hours || 0, createdAt: jobOrder.created_at,
        branch: jobOrder.branch, jobOrderDetails: jobOrder.job_order_details, invoiceNumber: jobOrder.invoice_number,
        totalValue: jobOrder.total_value, customer_id: jobOrder.customer_id, job_title_id: jobOrder.job_title_id,
        created_by: jobOrder.created_by, approval_status: jobOrder.approval_status, deliveredAt: jobOrder.delivered_at,
        clientName: jobOrder.client_name
      });
      setIsJobDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast({ title: "Error", description: "Failed to load job details", variant: "destructive" });
    }
  };

  const g = gamingMode;

  if (isLoading) {
    return (
      <Card className={cn(
        "shadow-xl border-0 h-full flex flex-col rounded-2xl",
        g ? "bg-gray-900/80 backdrop-blur-xl border border-green-400/30" : "bg-gradient-to-br from-white to-gray-50"
      )}>
        <CardHeader className={cn("pb-3", g ? "cyber-card-header" : "bg-gradient-to-r from-blue-500 to-purple-600 text-white")}>
          <CardTitle className={cn("flex items-center gap-1 text-sm", g ? "text-green-400 font-mono tracking-wider" : "text-white")}>
            <AlertCircle className="w-6 h-5" />
            {g ? "PENDING APPROVALS" : "Pending Approvals"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className={cn("text-center", g ? "text-green-400/60 font-mono" : "text-gray-500")}>
            {g ? "SCANNING..." : "Loading approvals..."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "shadow-xl border-0 h-full flex flex-col rounded-2xl transition-all duration-500",
      g ? "bg-gray-900/80 backdrop-blur-xl border border-green-400/30 shadow-[0_0_30px_rgba(0,255,150,0.1)]" : "bg-gradient-to-br from-white to-gray-50"
    )}>
      <CardHeader className={cn(
        "pb-3 rounded-t-2xl",
        g ? "bg-gradient-to-r from-green-900/80 to-cyan-900/80 border-b border-green-400/20" : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
      )}>
        <CardTitle className={cn("flex items-center gap-1 text-sm", g ? "text-green-400 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(0,255,150,0.5)]" : "text-white")}>
          <AlertCircle className="w-5 h-6" />
          {g ? `PENDING APPROVALS [${pendingJobs.length}]` : `Pending Approvals (${pendingJobs.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {pendingJobs.length === 0 ? (
          <div className={cn("text-center py-4", g ? "text-green-400/60" : "text-gray-500")}>
            <CheckCircle className={cn("w-10 h-8 mx-auto mb-1", g ? "text-green-400 drop-shadow-[0_0_10px_rgba(0,255,150,0.5)]" : "text-green-500")} />
            <p className={cn("text-sm", g && "font-mono")}>{g ? "ALL CLEAR // NO PENDING ITEMS" : "No pending approvals"}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingJobs.map((job) => (
              <div key={job.id} className={cn(
                "p-3 rounded-lg transition-all duration-300",
                g
                  ? "bg-gray-800/60 border border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.1)] hover:border-yellow-400/60 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                  : "bg-yellow-50 border border-yellow-200"
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className={cn("font-medium text-sm", g ? "text-green-300 font-mono" : "text-gray-900")}>{job.job_order_number}</h4>
                    <p className={cn("text-xs", g ? "text-cyan-400/70" : "text-gray-600")}>{job.customer_name}</p>
                    <p className={cn("text-xs truncate", g ? "text-green-400/50" : "text-gray-500")}>{job.job_order_details}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    g
                      ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/50 shadow-[0_0_8px_rgba(250,204,21,0.3)] animate-pulse"
                      : "bg-yellow-100 text-yellow-800 border-yellow-300"
                  )}>
                    {g ? "PENDING" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className={cn("flex items-center gap-1 text-xs", g ? "text-green-400/50" : "text-gray-500")}>
                    <Clock className="w-3 h-3" />
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleViewJob(job.id)}
                      className={cn("h-6 px-2 text-xs", g ? "border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/20 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200")}>
                      <Eye className="w-3 h-3 mr-1" />View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleApproval(job.id, 'approve')} disabled={approvalMutation.isPending}
                      className={cn("h-6 px-2 text-xs", g ? "border-green-400/50 text-green-400 hover:bg-green-400/20 hover:shadow-[0_0_10px_rgba(0,255,150,0.3)]" : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200")}>
                      <CheckCircle className="w-3 h-3 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleApproval(job.id, 'reject')} disabled={approvalMutation.isPending}
                      className={cn("h-6 px-2 text-xs", g ? "border-red-400/50 text-red-400 hover:bg-red-400/20 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]" : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200")}>
                      <XCircle className="w-3 h-3 mr-1" />Reject
                    </Button>
                  </div>
                </div>
                <div className={cn("mt-2 text-xs", g ? "text-green-400/40 font-mono" : "text-gray-500")}>
                  {g ? `OPERATOR: ${job.created_by_name}` : `Created by: ${job.created_by_name}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => { setIsJobDetailsOpen(false); setSelectedJob(null); }}
        job={selectedJob}
        isEditMode={false}
        onJobUpdated={(updatedJob) => {
          if (updatedJob.approvalStatus === 'approved' || updatedJob.approvalStatus === 'rejected') {
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
