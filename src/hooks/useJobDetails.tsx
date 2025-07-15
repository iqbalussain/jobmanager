
import { useState, useEffect } from "react";
import { Job } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { exportJobOrderToPDF } from "@/utils/pdfExport";
import { shareJobOrderViaWhatsApp } from "@/utils/whatsappShare";

interface UseJobDetailsProps {
  job: Job | null;
  isEditMode: boolean;
  onClose: () => void;
  onJobUpdated?: (jobData: { id: string; [key: string]: any }) => void;
}

export function useJobDetails({ job, isEditMode, onClose, onJobUpdated }: UseJobDetailsProps) {
  const [editData, setEditData] = useState<Partial<Job>>({});
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user is authorized to edit invoice numbers
  const canEditInvoice = userRole === 'admin' || userRole === 'manager' || userRole === 'job_order_manager';

  useEffect(() => {
    if (job) {
      setEditData({
        title: job.title,
        priority: job.priority,
        dueDate: job.dueDate,
        estimatedHours: job.estimatedHours,
        branch: job.branch,
        jobOrderDetails: job.jobOrderDetails,
        customer_id: job.customer_id,
        job_title_id: job.job_title_id,
        deliveredAt: job.deliveredAt
      });
      
      // Load existing invoice number if available
      if (job.invoiceNumber) {
        setInvoiceNumber(job.invoiceNumber);
      }
    }
  }, [job]);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      if (data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleSave = async () => {
    if (!job) return;

    setIsLoading(true);
    
    // Optimistic update - show changes immediately
    const updateData: any = {
      priority: editData.priority,
      due_date: editData.dueDate,
      estimated_hours: editData.estimatedHours,
      branch: editData.branch,
      job_order_details: editData.jobOrderDetails,
      delivered_at: editData.deliveredAt,
      updated_at: new Date().toISOString()
    };

    // Include customer_id and job_title_id if they were changed
    if (editData.customer_id) {
      updateData.customer_id = editData.customer_id;
    }
    if (editData.job_title_id) {
      updateData.job_title_id = editData.job_title_id;
    }

    // Only include invoice_number if user is authorized
    if (canEditInvoice) {
      updateData.invoice_number = invoiceNumber || null;
    }

    // Call the callback to update the parent component's state immediately
    if (onJobUpdated) {
      onJobUpdated({ id: job.id, ...updateData });
    }

    try {
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
    } catch (error) {
      console.error('Error updating job:', error);
      
      // Revert the optimistic update on error
      if (onJobUpdated) {
        onJobUpdated({ 
          id: job.id, 
          priority: job.priority,
          due_date: job.dueDate,
          estimated_hours: job.estimatedHours,
          branch: job.branch,
          job_order_details: job.jobOrderDetails,
          delivered_at: job.deliveredAt,
          invoice_number: job.invoiceNumber
        });
      }
      
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
        
        // Update parent state as well
        if (onJobUpdated) {
          onJobUpdated({ id: job.id, invoice_number: invoiceNumber });
        }
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

  const handleShareWhatsApp = async () => {
    if (!job) return;

    setIsSharing(true);
    try {
      // If there's an invoice number and user is authorized, save it first
      if (invoiceNumber && invoiceNumber !== job.invoiceNumber && canEditInvoice) {
        await supabase
          .from('job_orders')
          .update({ invoice_number: invoiceNumber })
          .eq('id', job.id);
        
        // Update parent state as well
        if (onJobUpdated) {
          onJobUpdated({ id: job.id, invoice_number: invoiceNumber });
        }
      }

      await shareJobOrderViaWhatsApp(job, invoiceNumber);
      toast({
        title: "Success",
        description: "Job order shared via WhatsApp successfully",
      });
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      toast({
        title: "Error",
        description: "Failed to share via WhatsApp. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return {
    editData,
    setEditData,
    invoiceNumber,
    setInvoiceNumber,
    isLoading,
    isExporting,
    isSharing,
    canEditInvoice,
    handleSave,
    handleExportPDF,
    handleShareWhatsApp
  };
}
