
import { useState, useEffect } from "react";
import { Job } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { exportJobOrderToPDF } from "@/utils/pdfExport";

interface UseJobDetailsProps {
  job: Job | null;
  isEditMode: boolean;
  onClose: () => void;
}

export function useJobDetails({ job, isEditMode, onClose }: UseJobDetailsProps) {
  const [editData, setEditData] = useState<Partial<Job>>({});
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customers, setCustomers] = useState<Array<{id: string, name: string}>>([]);
  const [designers, setDesigners] = useState<Array<{id: string, name: string}>>([]);
  const [salesmen, setSalesmen] = useState<Array<{id: string, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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
      fetchUserRole();
    }
  }, [user]);

  useEffect(() => {
    if (isEditMode && job) {
      fetchDropdownData();
    }
  }, [isEditMode, job]);

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

  const fetchDropdownData = async () => {
    try {
      const [customersRes, designersRes, salesmenRes] = await Promise.all([
        supabase.from('customers').select('id, name'),
        supabase.from('profiles').select('id, full_name').eq('role', 'designer'),
        supabase.from('profiles').select('id, full_name').eq('role', 'salesman')
      ]);

      if (customersRes.data) setCustomers(customersRes.data);
      if (designersRes.data) {
        setDesigners(designersRes.data.map(d => ({ id: d.id, name: d.full_name || 'Unknown Designer' })));
      }
      if (salesmenRes.data) {
        setSalesmen(salesmenRes.data.map(s => ({ id: s.id, name: s.full_name || 'Unknown Salesman' })));
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
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
    handleExportPDF
  };
}
