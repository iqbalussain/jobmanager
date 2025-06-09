
import { useState, useEffect } from "react";
import { Job } from "@/pages/Index";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { exportJobOrderToPDF } from "@/utils/pdfExport";
import { JobDetailsHeader } from "./job-details/JobDetailsHeader";
import { JobDetailsForm } from "./job-details/JobDetailsForm";
import { JobDetailsActions } from "./job-details/JobDetailsActions";

interface JobDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  isEditMode?: boolean;
}

export function JobDetails({ isOpen, onClose, job, isEditMode = false }: JobDetailsProps) {
  const [editData, setEditData] = useState<Partial<Job>>({});
  const [customers, setCustomers] = useState<Array<{id: string, name: string}>>([]);
  const [designers, setDesigners] = useState<Array<{id: string, name: string}>>([]);
  const [salesmen, setSalesmen] = useState<Array<{id: string, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (job) {
      setEditData({
        title: job.title,
        description: job.description,
        priority: job.priority,
        dueDate: job.dueDate,
        estimatedHours: job.estimatedHours,
        branch: job.branch,
        jobOrderDetails: job.jobOrderDetails
      });
    }
  }, [job]);

  useEffect(() => {
    if (isEditMode && isOpen) {
      fetchDropdownData();
    }
  }, [isEditMode, isOpen]);

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
        title: editData.title,
        description: editData.description,
        priority: editData.priority,
        due_date: editData.dueDate,
        estimated_hours: editData.estimatedHours,
        branch: editData.branch,
        job_order_details: editData.jobOrderDetails,
        updated_at: new Date().toISOString()
      };

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
      await exportJobOrderToPDF(job);
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
