import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { updateJobOrder } from "@/services/jobOrdersApi";

type WorkflowJob = {
  id: string;
  job_order_number: string;
  status: string;
  approval_status: string;
};

type WorkflowAlert = {
  id: string;
  type: "created" | "approved" | "completed";
  jobId: string;
  jobOrderNumber: string;
};

type JobSnapshot = Record<string, WorkflowJob>;

const POLL_INTERVAL = 20_000;
const JOB_SELECT = "id,job_order_number,status,approval_status";

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
  const [role, setRole] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<WorkflowAlert[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const alertKey = useMemo(
    () => userId ? `jobmanager:workflow-alerts:${userId}` : null,
    [userId],
  );
  const snapshotKey = useMemo(
    () => userId ? `jobmanager:workflow-snapshot:${userId}` : null,
    [userId],
  );
  const activeAlert = alerts.find((alert) => role === "admin" || alert.type !== "completed") || null;
  const isCompletionAlert = activeAlert?.type === "completed";

  useEffect(() => {
    if (!userId || !alertKey) {
      setRole(null);
      setAlerts([]);
      return;
    }

    setRole(null);
    setAlerts(getStoredAlerts(alertKey));
    let active = true;
    let interval: ReturnType<typeof setInterval> | undefined;

    const startPolling = async () => {
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
      if (!["designer", "salesman", "admin"].includes(currentRole)) return;

      let snapshot: JobSnapshot = {};
      let hasBaseline = false;
      try {
        const storedSnapshot = snapshotKey ? localStorage.getItem(snapshotKey) : null;
        if (storedSnapshot !== null) {
          snapshot = JSON.parse(storedSnapshot) as JobSnapshot;
          hasBaseline = true;
        }
      } catch (error) {
        console.error("Failed to read workflow polling snapshot:", error);
      }

      const poll = async () => {
        const { count, error: countError } = await supabase
          .from("job_orders")
          .select("id", { count: "exact", head: true });

        if (!active) return;
        if (countError) {
          console.error("Workflow alert polling failed:", countError);
          return;
        }

        const jobs: WorkflowJob[] = [];
        const batchSize = 1000;
        const batchCount = Math.ceil((count || 0) / batchSize);
        for (let batch = 0; batch < batchCount; batch++) {
          const { data, error } = await supabase
            .from("job_orders")
            .select(JOB_SELECT)
            .order("id", { ascending: true })
            .range(batch * batchSize, (batch + 1) * batchSize - 1);

          if (error) {
            console.error("Workflow alert polling failed:", error);
            return;
          }
          jobs.push(...(data || []));
        }
        if (!active) return;

        const nextSnapshot: JobSnapshot = Object.fromEntries(
          jobs.map((job) => [job.id, job]),
        );

        if (hasBaseline && alertKey) {
          const nextAlerts: WorkflowAlert[] = [];
          for (const job of Object.values(nextSnapshot)) {
            const previous = snapshot[job.id];
            if (!previous) {
              nextAlerts.push({
                id: `created:${job.id}`,
                type: "created",
                jobId: job.id,
                jobOrderNumber: job.job_order_number,
              });
              continue;
            }

            if (previous.approval_status !== "approved" && job.approval_status === "approved") {
              nextAlerts.push({
                id: `approved:${job.id}`,
                type: "approved",
                jobId: job.id,
                jobOrderNumber: job.job_order_number,
              });
            }

            if (currentRole === "admin" && previous.status !== "completed" && job.status === "completed") {
              nextAlerts.push({
                id: `completed:${job.id}`,
                type: "completed",
                jobId: job.id,
                jobOrderNumber: job.job_order_number,
              });
            }
          }

          if (nextAlerts.length > 0) {
            const existingAlerts = getStoredAlerts(alertKey);
            const knownIds = new Set(existingAlerts.map((alert) => alert.id));
            const addedAlerts = nextAlerts.filter((alert) => !knownIds.has(alert.id));
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
          }
        }

        snapshot = nextSnapshot;
        hasBaseline = true;
        if (snapshotKey) {
          try {
            localStorage.setItem(snapshotKey, JSON.stringify(snapshot));
          } catch (storageError) {
            console.error("Failed to save workflow polling snapshot:", storageError);
          }
        }
      };

      await poll();
      if (active) {
        interval = setInterval(() => {
          void poll().catch((error: unknown) => {
            console.error("Workflow alert polling failed:", error);
          });
        }, POLL_INTERVAL);
      }
    };

    void startPolling().catch((error: unknown) => {
      console.error("Failed to initialize workflow alerts:", error);
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === alertKey) setAlerts(getStoredAlerts(alertKey));
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      active = false;
      if (interval) clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [alertKey, snapshotKey, userId]);

  useEffect(() => {
    setInvoiceNumber("");
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

  if (!userId) return <audio ref={audioRef} src={chimeDataUrl} preload="auto" className="hidden" />;

  return (
    <>
      <audio ref={audioRef} src={chimeDataUrl} preload="auto" className="hidden" />
      <Dialog
        open={!!activeAlert}
        onOpenChange={(open) => {
          if (!open && !isCompletionAlert) dismissActiveAlert();
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
          ) : (
            <DialogFooter>
              <Button onClick={dismissActiveAlert}>Got it</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
