import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { updateJobOrder } from "@/services/jobOrdersApi";
import { useJobActions } from "@/hooks/useJobActions";
import type { DashboardJob, JobOrderRecord, JobStatus } from "@/types/jobOrder";

const JobDetails = lazy(() =>
  import("@/components/JobDetails").then((module) => ({ default: module.JobDetails })),
);

type WorkflowAlert = {
  id: string;
  type: "created" | "approved" | "completed";
  jobId: string;
  jobOrderNumber: string;
};

interface WorkflowAlertsUpdatedDetail {
  key: string;
  alerts: WorkflowAlert[];
}

declare global {
  interface WindowEventMap {
    "workflow-alerts-updated": CustomEvent<WorkflowAlertsUpdatedDetail>;
  }
}

const WORKFLOW_ALERTS_UPDATED_EVENT = "workflow-alerts-updated";
const DESIGNER_STATUSES: JobStatus[] = ["pending", "completed", "out", "foc_sample", "finished"];

function canApproveJobs(role: string | null): boolean {
  return role === "admin" || role === "manager" || role === "job_order_manager";
}

function getStoredAlerts(key: string): WorkflowAlert[] {
  try {
    const value = localStorage.getItem(key);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error("Workflow alert data is not an array");
    return parsed as WorkflowAlert[];
  } catch (error) {
    console.error("Failed to read saved workflow alerts:", error);
    return [];
  }
}

function persistAlerts(key: string, alerts: WorkflowAlert[]) {
  try {
    localStorage.setItem(key, JSON.stringify(alerts));
    window.dispatchEvent(
      new CustomEvent(WORKFLOW_ALERTS_UPDATED_EVENT, {
        detail: { key, alerts },
      }),
    );
  } catch (error) {
    console.error("Failed to save workflow alerts:", error);
  }
}

function createChimeDataUrl(): string {
  const sampleRate = 8000;
  const sampleCount = 1600;
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index++) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, sampleCount * 2, true);

  for (let index = 0; index < sampleCount; index++) {
    const progress = index / sampleCount;
    const sample = Math.sin(2 * Math.PI * 880 * index / sampleRate) * (1 - progress);
    view.setInt16(44 + index * 2, Math.round(sample * 5000), true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `data:audio/wav;base64,${btoa(binary)}`;
}

const chimeDataUrl = createChimeDataUrl();

export function WorkflowAlertManager() {
  const { user } = useAuth();
  const userId = user?.id;
  const { setJobStatus } = useJobActions();
  const [role, setRole] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<WorkflowAlert[]>([]);
  const [temporarilyDismissedCompletionAlerts, setTemporarilyDismissedCompletionAlerts] =
    useState<Set<string>>(() => new Set());
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | "">("");
  const [viewJob, setViewJob] = useState<DashboardJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const alertKey = useMemo(
    () => userId ? `jobmanager:workflow-alerts:${userId}` : null,
    [userId],
  );
  const legacySnapshotKey = useMemo(
    () => userId ? `jobmanager:workflow-snapshot:${userId}` : null,
    [userId],
  );
  const activeAlert = alerts.find(
    (alert) =>
      (role === "admin" || alert.type !== "completed") &&
      !(alert.type === "completed" && temporarilyDismissedCompletionAlerts.has(alert.id)),
  ) || null;
  const isCompletionAlert = activeAlert?.type === "completed";

  useEffect(() => {
    if (!userId || !alertKey) {
      setRole(null);
      setAlerts([]);
      setTemporarilyDismissedCompletionAlerts(new Set());
      return;
    }

    setRole(null);
    setAlerts(getStoredAlerts(alertKey));
    setTemporarilyDismissedCompletionAlerts(new Set());
    try {
      if (legacySnapshotKey) localStorage.removeItem(legacySnapshotKey);
    } catch (error) {
      console.error("Failed to remove the legacy workflow snapshot:", error);
    }
    let active = true;

    const startRealtimeAlerts = async () => {
      const { data: profile, error: roleError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!active) return;
      if (roleError) {
        console.error("Failed to load workflow alert role:", roleError);
        return;
      }

      const currentRole = profile?.role || "";
      setRole(currentRole);
      if (!["designer", "salesman", "admin", "manager", "job_order_manager"].includes(currentRole)) return;

      const addAlerts = (addedAlerts: WorkflowAlert[]) => {
        if (!active || addedAlerts.length === 0) return;
        const existingAlerts = getStoredAlerts(alertKey);
        const knownIds = new Set(existingAlerts.map((alert) => alert.id));
        addedAlerts = addedAlerts.filter((alert) => !knownIds.has(alert.id));
        if (addedAlerts.length > 0) {
          const updatedAlerts = [...existingAlerts, ...addedAlerts];
          persistAlerts(alertKey, updatedAlerts);
          setAlerts(updatedAlerts);
          if (document.visibilityState !== "visible" && "Notification" in window && Notification.permission === "granted") {
            addedAlerts.forEach((alert) => {
              try {
                new Notification(
                  alert.type === "completed" ? "Invoice required" : "Job order update",
                  { body: `Job ${alert.jobOrderNumber} ${alert.type === "completed" ? "is completed and needs an invoice." : alert.type === "approved" ? "has been approved." : "was created."}` },
                );
              } catch (notificationError) {
                console.error("Failed to display desktop workflow alert:", notificationError);
              }
            });
          }
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            void audioRef.current.play().catch((error: unknown) => {
              console.info("Workflow notification sound could not play:", error);
            });
          }
        }
      };

      const channel = supabase
        .channel(`workflow-job-alerts-${userId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "job_orders" },
          (payload: RealtimePostgresChangesPayload<JobOrderRecord>) => {
            if (!active || payload.eventType === "DELETE") return;
            const job = payload.new;
            const previousJob = payload.old;
            const addedAlerts: WorkflowAlert[] = [];

            if (payload.eventType === "INSERT") {
              addedAlerts.push({
                id: `created:${job.id}:${job.created_at}`,
                type: "created",
                jobId: job.id,
                jobOrderNumber: job.job_order_number,
              });
            }
            if (
              currentRole === "designer" &&
              job.designer_id === userId &&
              job.approval_status === "approved" &&
              job.approved_at &&
              (previousJob.approval_status !== "approved" || previousJob.approved_at !== job.approved_at)
            ) {
              addedAlerts.push({
                id: `approved:${job.id}:${job.approved_at}`,
                type: "approved",
                jobId: job.id,
                jobOrderNumber: job.job_order_number,
              });
            }
            if (
              currentRole === "admin" &&
              job.status === "completed" &&
              previousJob.status !== "completed"
            ) {
              addedAlerts.push({
                id: `completed:${job.id}`,
                type: "completed",
                jobId: job.id,
                jobOrderNumber: job.job_order_number,
              });
            }

            addAlerts(addedAlerts);
          },
        )
        .subscribe((status, error) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("Workflow alert realtime subscription failed:", error);
          }
        });
      return () => {
        void supabase.removeChannel(channel);
      };
    };

    let removeChannel: (() => void) | undefined;
    void startRealtimeAlerts().then((cleanup) => {
      removeChannel = cleanup;
      if (!active) cleanup?.();
    }).catch((error: unknown) => {
      console.error("Failed to initialize workflow realtime alerts:", error);
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === alertKey) setAlerts(getStoredAlerts(alertKey));
    };
    const handleSameTabUpdate = (
      event: WindowEventMap["workflow-alerts-updated"],
    ) => {
      if (event.detail?.key === alertKey && Array.isArray(event.detail.alerts)) {
        setAlerts(event.detail.alerts);
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(WORKFLOW_ALERTS_UPDATED_EVENT, handleSameTabUpdate);

    return () => {
      active = false;
      removeChannel?.();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(WORKFLOW_ALERTS_UPDATED_EVENT, handleSameTabUpdate);
    };
  }, [alertKey, legacySnapshotKey, userId]);

  useEffect(() => {
    setInvoiceNumber("");
    setSelectedStatus("");
    setSubmitError(null);
  }, [activeAlert?.id]);

  const dismissActiveAlert = () => {
    if (!activeAlert || !alertKey) return;
    let currentAlerts = alerts;
    try {
      if (localStorage.getItem(alertKey) !== null) {
        currentAlerts = getStoredAlerts(alertKey);
      }
    } catch (error) {
      console.error("Failed to read workflow alerts before dismissal:", error);
    }
    const updatedAlerts = currentAlerts.filter((alert) => alert.id !== activeAlert.id);
    persistAlerts(alertKey, updatedAlerts);
    setAlerts(updatedAlerts);
  };

  const submitInvoice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeAlert || activeAlert.type !== "completed") return;
    const normalizedInvoiceNumber = invoiceNumber.trim();
    if (!normalizedInvoiceNumber) {
      setSubmitError("Enter an invoice number to mark this job as invoiced.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await updateJobOrder(activeAlert.jobId, {
        status: "invoiced",
        invoice_number: normalizedInvoiceNumber,
        updated_at: new Date().toISOString(),
      });
      dismissActiveAlert();
    } catch (error) {
      console.error("Failed to save invoice and update job status:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to save the invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveNewJob = async () => {
    if (!userId || !activeAlert || activeAlert.type !== "created" || !canApproveJobs(role)) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { data, error } = await supabase
        .from("job_orders")
        .update({
          approval_status: "approved",
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", activeAlert.jobId)
        .eq("approval_status", "pending_approval")
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("This job is no longer awaiting approval.");
      dismissActiveAlert();
    } catch (error) {
      console.error("Failed to approve new job order:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to approve the job order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openJobDetails = async () => {
    if (!activeAlert) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { data: jobOrder, error } = await supabase
        .from("job_orders")
        .select("id,job_order_number,customer_id,job_title_id,designer_id,salesman_id,assignee,priority,status,due_date,estimated_hours,created_at,branch,job_order_details,invoice_number,total_value,created_by,approval_status,delivered_at,client_name")
        .eq("id", activeAlert.jobId)
        .single();
      if (error) throw error;

      const [customerResult, designerResult, salesmanResult, jobTitleResult] = await Promise.all([
        supabase.from("customers").select("name").eq("id", jobOrder.customer_id).single(),
        jobOrder.designer_id
          ? supabase.from("profiles").select("full_name").eq("id", jobOrder.designer_id).single()
          : Promise.resolve({ data: null, error: null }),
        jobOrder.salesman_id
          ? supabase.from("profiles").select("full_name").eq("id", jobOrder.salesman_id).single()
          : Promise.resolve({ data: null, error: null }),
        jobOrder.job_title_id
          ? supabase.from("job_titles").select("job_title_id").eq("id", jobOrder.job_title_id).single()
          : Promise.resolve({ data: null, error: null }),
      ]);
      const lookupError = customerResult.error || designerResult.error || salesmanResult.error || jobTitleResult.error;
      if (lookupError) throw lookupError;

      setViewJob({
        id: jobOrder.id,
        title: jobTitleResult.data?.job_title_id || "Unknown Job Title",
        customer: customerResult.data?.name || "Unknown Customer",
        designer: designerResult.data?.full_name || "Unassigned",
        salesman: salesmanResult.data?.full_name || "Unassigned",
        assignee: jobOrder.assignee || undefined,
        jobOrderNumber: jobOrder.job_order_number,
        priority: jobOrder.priority,
        status: jobOrder.status,
        dueDate: jobOrder.due_date || "",
        estimatedHours: jobOrder.estimated_hours || 0,
        createdAt: jobOrder.created_at,
        branch: jobOrder.branch || undefined,
        jobOrderDetails: jobOrder.job_order_details || undefined,
        invoiceNumber: jobOrder.invoice_number || undefined,
        totalValue: jobOrder.total_value || undefined,
        customer_id: jobOrder.customer_id,
        job_title_id: jobOrder.job_title_id || undefined,
        created_by: jobOrder.created_by,
        approval_status: jobOrder.approval_status,
        deliveredAt: jobOrder.delivered_at || undefined,
        clientName: jobOrder.client_name || undefined,
      });
    } catch (error) {
      console.error("Failed to load job order details:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to load job details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDesignerStatus = async () => {
    if (!activeAlert || activeAlert.type !== "approved" || !selectedStatus) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await setJobStatus(activeAlert.jobId, selectedStatus);
      if (!result.success) {
        throw new Error(result.error || "The job status was not updated.");
      }
      dismissActiveAlert();
    } catch (error) {
      console.error("Failed to update approved job status:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to update the job status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) return <audio ref={audioRef} src={chimeDataUrl} preload="auto" className="hidden" />;

  return (
    <>
      <audio ref={audioRef} src={chimeDataUrl} preload="auto" className="hidden" />
      <Dialog
        open={!!activeAlert}
        onOpenChange={(open) => {
          if (!open && activeAlert) {
            if (isCompletionAlert) {
              setTemporarilyDismissedCompletionAlerts((previous) => {
                const dismissed = new Set(previous);
                alerts
                  .filter((alert) => alert.type === "completed")
                  .forEach((alert) => dismissed.add(alert.id));
                return dismissed;
              });
            } else {
              dismissActiveAlert();
            }
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <div className="mx-auto rounded-full bg-primary/10 p-3">
              {isCompletionAlert ? <FileText className="h-6 w-6 text-primary" /> : activeAlert?.type === "approved" ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <AlertTriangle className="h-6 w-6 text-primary" />}
            </div>
            <DialogTitle className="text-center">
              {isCompletionAlert ? "Invoice required" : activeAlert?.type === "approved" ? "Job approved" : "New job order"}
            </DialogTitle>
            <DialogDescription className="text-center">
              Job order {activeAlert?.jobOrderNumber}
              {isCompletionAlert
                ? " is completed. Enter the invoice number to mark it as invoiced."
                : activeAlert?.type === "approved"
                  ? " has been approved."
                  : " has been created."}
            </DialogDescription>
          </DialogHeader>

          {isCompletionAlert ? (
            <form onSubmit={submitInvoice} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-invoice-number">Invoice number</Label>
                <Input
                  id="workflow-invoice-number"
                  autoFocus
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || !invoiceNumber.trim()}>
                  {isSubmitting ? "Saving..." : "Save invoice and close"}
                </Button>
              </DialogFooter>
            </form>
          ) : activeAlert?.type === "created" ? (
            <>
              {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
              <DialogFooter>
                <Button variant="outline" onClick={openJobDetails} disabled={isSubmitting}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                {canApproveJobs(role) && (
                  <Button onClick={approveNewJob} disabled={isSubmitting}>
                    {isSubmitting ? "Approving..." : "Approve"}
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : activeAlert?.type === "approved" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-job-status">Update job status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => {
                    if (DESIGNER_STATUSES.includes(value as JobStatus)) {
                      setSelectedStatus(value as JobStatus);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="workflow-job-status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGNER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "foc_sample" ? "FOC Sample" : status === "out" ? "Out" : status.replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
              <DialogFooter>
                <Button onClick={saveDesignerStatus} disabled={isSubmitting || !selectedStatus}>
                  {isSubmitting ? "Saving..." : "Save status"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogFooter>
              <Button onClick={dismissActiveAlert}>Got it</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      <Suspense fallback={null}>
        <JobDetails
          isOpen={!!viewJob}
          onClose={() => setViewJob(null)}
          job={viewJob}
        />
      </Suspense>
    </>
  );
}
