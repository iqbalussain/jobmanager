
import { Job } from "@/pages/Index";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { JobDetailsHeader } from "./job-details/JobDetailsHeader";
import { JobDetailsForm } from "./job-details/JobDetailsForm";
import { JobDetailsActions } from "./job-details/JobDetailsActions";
import { InvoiceNumberSection } from "./job-details/InvoiceNumberSection";
import { useJobDetails } from "@/hooks/useJobDetails";

interface JobDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  isEditMode?: boolean;
}

export function JobDetails({ isOpen, onClose, job, isEditMode = false }: JobDetailsProps) {
  const {
    editData,
    setEditData,
    invoiceNumber,
    setInvoiceNumber,
    isLoading,
    isExporting,
    canEditInvoice,
    handleSave,
    handleExportPDF
  } = useJobDetails({ job, isEditMode, onClose });

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
          <InvoiceNumberSection
            invoiceNumber={invoiceNumber}
            onInvoiceNumberChange={setInvoiceNumber}
            canEditInvoice={canEditInvoice}
          />

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
