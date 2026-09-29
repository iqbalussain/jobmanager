import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, AlertCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { JobDetails } from "@/components/JobDetails";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { updateJobInCache } from "@/services/syncService";
import type { JobOrderRecord } from "@/types/jobOrder";

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
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const activePointerId = useRef<number | null>(null);
  const wheelDeltaX = useRef(0);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`approval-job-orders-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_orders' },
        (payload: RealtimePostgresChangesPayload<JobOrderRecord>) => {
          const affectsPendingApprovals = payload.eventType === 'INSERT'
            ? payload.new.approval_status === 'pending_approval'
            : payload.eventType === 'UPDATE'
              ? payload.new.approval_status === 'pending_approval' ||
                payload.old.approval_status === 'pending_approval'
              : payload.old.approval_status === 'pending_approval';
          if (affectsPendingApprovals) {
            void queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
          }
          void queryClient.invalidateQueries({ queryKey: ['job-orders'] });
        },
      )
      .subscribe((status, error) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Approval realtime subscription failed:', error);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

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
      try {
        if (!user) throw new Error('A signed-in user is required to update the local cache');
        await updateJobInCache(jobId, user.id);
      } catch (e) { console.error('Failed to update cache:', e); }
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

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId.current || dragStartX.current === null) return;
      setDragOffset(event.clientX - dragStartX.current);
    };

    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId.current || dragStartX.current === null) return;
      const distance = event.clientX - dragStartX.current;
      if (Math.abs(distance) > 60) {
        setActiveCardIndex((index) => Math.max(0, Math.min(pendingJobs.length - 1, index + (distance < 0 ? 1 : -1))));
      }
      dragStartX.current = null;
      activePointerId.current = null;
      setDragOffset(0);
      setIsDragging(false);
    };

    const cancelDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId.current) return;
      dragStartX.current = null;
      activePointerId.current = null;
      setDragOffset(0);
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", cancelDrag);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", cancelDrag);
    };
  }, [isDragging, pendingJobs.length]);

  useEffect(() => {
    setActiveCardIndex((index) => Math.min(index, Math.max(0, pendingJobs.length - 1)));
  }, [pendingJobs.length]);

  useEffect(() => () => {
    if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.isPrimary || (event.target instanceof Element && event.target.closest("button"))) return;
    dragStartX.current = event.clientX;
    activePointerId.current = event.pointerId;
    setIsDragging(true);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLElement>) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 5) return;
    event.preventDefault();
    wheelDeltaX.current += event.deltaX;
    if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    wheelTimeout.current = setTimeout(() => {
      const direction = wheelDeltaX.current < 0 ? 1 : -1;
      if (Math.abs(wheelDeltaX.current) >= 30) {
        setActiveCardIndex((index) => Math.max(0, Math.min(pendingJobs.length - 1, index + direction)));
      }
      wheelDeltaX.current = 0;
      wheelTimeout.current = null;
    }, 80);
  };

  const activeJob = pendingJobs[activeCardIndex];

  const handleViewJob = async (jobId: string) => {
    try {
      const { data: jobOrder, error } = await supabase.from('job_orders').select('id,job_order_number,customer_id,job_title_id,designer_id,salesman_id,assignee,priority,status,due_date,estimated_hours,created_at,branch,job_order_details,invoice_number,total_value,created_by,approval_status,delivered_at,client_name').eq('id', jobId).single();
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

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-5 h-5" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">Loading approvals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="w-5 h-5" />
          Pending Approvals ({pendingJobs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingJobs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-primary/70" />
            <p className="text-sm">No pending approvals</p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl">
            <div className="relative h-[276px] sm:h-[250px]">
              {Array.from({ length: Math.min(3, pendingJobs.length) }, (_, index) => {
                const depth = Math.min(3, pendingJobs.length) - index - 1;
                return (
                  <div
                    key={`approval-card-layer-${depth}`}
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-full rounded-lg border bg-card shadow-md transition-[transform,opacity] duration-300 ease-out motion-reduce:duration-0"
                    style={{
                      zIndex: index,
                      opacity: 1 - depth * 0.18,
                      transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.025})`,
                    }}
                  />
                );
              })}
              <article
                key={activeJob?.id}
                onPointerDown={handlePointerDown}
                onWheel={handleWheel}
                className="absolute inset-x-0 top-0 z-10 h-full select-none rounded-lg border bg-card p-4 shadow-xl transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0"
                style={{
                  transform: `translateX(${dragOffset}px) rotate(${dragOffset / 30}deg)`,
                  transition: isDragging ? "none" : undefined,
                  touchAction: "pan-y",
                }}
              >
                {activeJob && (
                  <div className="flex h-full flex-col justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-foreground">{activeJob.job_order_number}</h4>
                          <p className="mt-0.5 truncate text-sm text-muted-foreground">{activeJob.customer_name}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">Pending</Badge>
                      </div>
                      <p className="max-h-10 overflow-hidden text-sm text-muted-foreground">{activeJob.job_order_details || "No job details provided."}</p>
                    </div>
                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(activeJob.created_at).toLocaleDateString()}
                        </span>
                        <span className="truncate">Created by: {activeJob.created_by_name}</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewJob(activeJob.id)} className="h-8 px-2 text-xs">
                          <Eye className="mr-1 h-3 w-3" />View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleApproval(activeJob.id, 'approve')} disabled={approvalMutation.isPending} className="h-8 px-2 text-xs">
                          <CheckCircle className="mr-1 h-3 w-3" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleApproval(activeJob.id, 'reject')} disabled={approvalMutation.isPending} className="h-8 px-2 text-xs text-destructive">
                          <XCircle className="mr-1 h-3 w-3" />Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Previous pending approval"
                onClick={() => setActiveCardIndex((index) => Math.max(0, index - 1))}
                disabled={activeCardIndex === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground" aria-live="polite">
                {activeCardIndex + 1} / {pendingJobs.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Next pending approval"
                onClick={() => setActiveCardIndex((index) => Math.min(pendingJobs.length - 1, index + 1))}
                disabled={activeCardIndex >= pendingJobs.length - 1}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
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
