import { useState, useEffect } from "react";
import { Job } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { exportJobOrderToPDF } from "@/utils/pdfExport";
import { useJobDropdownData } from "@/hooks/useJobDropdownData";

interface UseJobDetailsProps {
  job: Job | null;
  isEditMode: boolean;
  onClose: () => void;
}

export function useJobDetails({ job, isEditMode, onClose }: UseJobDetailsProps) {
  const [editData, setEditData] = useState<Partial<Job>>({});
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true); // For debug UI
  const { toast } = useToast();
  const { user } = useAuth();
  const { customers, designers, salesmen } = useJobDropdownData(isEditMode, job);

  // Check if user is authorized to edit invoice numbers
  const canEditInvoice = userRoles.includes('admin') || userRoles.includes('job_order_manager');

  useEffect(() => {
    if (job) {
      setEditData({
        title: job.title,
        priority: job.priority,
        dueDate: job.dueDate,
        estimatedHours: job.estimatedHours,
        branch: job.branch,
        jobOrderDetails: job.jobOrderDetails
      });
      
      // Load existing invoice number if available
      if (job.invoiceNumber) {
        setInvoiceNumber(job.invoiceNumber);
      }
    }
  }, [job]);

  useEffect(() => {
    if (user) {
      fetchUserRoles();
    }
  }, [user]);

  const fetchUserRoles = async () => {
    setRolesLoading(true);
    if (!user) {
      setUserRoles([]);
      setRolesLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        setUserRoles([]);
        console.error("Error fetching user roles:", error.message);
      } else if (data) {
        setUserRoles(data.map((row: { role: string }) => row.role));
        console.log("[DEBUG] useJobDetails roles:", data.map((row: { role: string }) => row.role), "for user:", user.id);
      } else {
        setUserRoles([]);
      }
    } catch (error: any) {
      setUserRoles([]);
      console.error("Error fetching user roles:", error?.message || error);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSave = async () => {
    if (!job) return;

    setIsLoading(true);
    try {
      const updateData: any = {
        priority: editData.priority,
        due_date: editData.dueDate,
        estimated_hours: editData.estimatedHours,
        branch: editData.branch,
        job_order_details: editData.jobOrderDetails,
        updated_at: new Date().toISOString()
      };

      // Only include invoice_number if user is authorized
      if (canEditInvoice) {
        updateData.invoice_number = invoiceNumber || null;
      }

      const { error } = await supabase
        .from('job_orders')
        .update(updateData)
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job order updated successfully",
      });
      
      onClose();
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!job) return;

    setIsExporting(true);
    try {
      // If there's an invoice number and user is authorized, save it first
      if (invoiceNumber && invoiceNumber !== job.invoiceNumber && canEditInvoice) {
        await supabase
          .from('job_orders')
          .update({ invoice_number: invoiceNumber })
          .eq('id', job.id);
      }

      await exportJobOrderToPDF(job, invoiceNumber);
      toast({
        title: "Success",
        description: "Job order exported to PDF successfully",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    editData,
    setEditData,
    invoiceNumber,
    setInvoiceNumber,
    customers,
    designers,
    salesmen,
    isLoading,
    isExporting,
    canEditInvoice,
    handleSave,
    handleExportPDF,
    userRoles, // debugging
    rolesLoading // debugging
  };
}
