
import { useMemo } from "react";
import { JobOrder } from "@/hooks/useJobOrders";
import { Job, JobStatus } from "@/types/job";

export function useJobTransform(jobOrders: JobOrder[]): Job[] {
  return useMemo(() => {
    return jobOrders.map((order) => ({
      id: order.id,
      jobOrderNumber: order.job_order_number,
      title: order.title || order.job_order_details || `Job Order ${order.job_order_number}`,
      description: order.description || "",
      customer: order.customer?.name || "Unknown Customer",
      assignee: order.assignee || "Unassigned",
      priority: order.priority as Job["priority"],
      status: order.status as JobStatus,
      dueDate: order.due_date || new Date().toISOString().split("T")[0],
      createdAt: order.created_at.split("T")[0],
      estimatedHours: order.estimated_hours || 0,
      branch: order.branch || "",
      designer: order.designer?.name || "Unassigned",
      salesman: order.salesman?.name || "Unassigned",
      jobOrderDetails: order.job_order_details || "",
      totalValue: order.total_value || 0,
      created_by: order.created_by,
      invoiceNumber: order.invoice_number || "",
      approval_status: order.approval_status,
      deliveredAt: order.delivered_at || "",
    }));
  }, [jobOrders]);
}
