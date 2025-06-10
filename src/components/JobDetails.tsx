
import { useState, useEffect } from "react";
import { Job } from "@/pages/Index";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { exportJobOrderToPDF } from "@/utils/pdfExport";
import { JobDetailsHeader } from "./job-details/JobDetailsHeader";
import { JobDetailsForm } from "./job-details/JobDetailsForm";
import { JobDetailsActions } from "./job-details/JobDetailsActions";
import { useAuth } from "@/hooks/useAuth";

interface JobDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  isEditMode?: boolean;
}

export function JobDetails({ isOpen, onClose, job, isEditMode = false }: JobDetailsProps) {
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
    if (isEditMode && isOpen) {
      fetchDropdownData();
    }
  }, [isEditMode, isOpen]);

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
        // Remove 'title' field as it doesn't exist in the database
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

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <JobDetailsHeader 
            job={job}
            isEditMode={isEditMode}
            isExporting={isExporting}
            onExportPDF={handleExportPDF}
          />
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Number Field - Show when exporting or in edit mode */}
          {(isEditMode || !isEditMode) && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="text-sm font-medium text-blue-900">
                  Invoice Number (Optional) {!canEditInvoice && '- View Only'}
                </Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder={canEditInvoice ? "Enter invoice number for PDF export" : "Not authorized to edit"}
                  className="bg-white"
                  disabled={!canEditInvoice}
                />
                <p className="text-xs text-blue-700">
                  {canEditInvoice 
                    ? "This will appear at the top of the exported PDF and be saved to the job order." 
                    : "Only authorized users (Admin, Manager, Job Order Manager) can edit invoice numbers."
                  }
                </p>
              </div>
            </div>
          )}

          <JobDetailsForm
            job={job}
            isEditMode={isEditMode}
            editData={editData}
            onEditDataChange={setEditData}
          />

          <JobDetailsActions
            isEditMode={isEditMode}
            isLoading={isLoading}
            onClose={onClose}
            onSave={handleSave}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
