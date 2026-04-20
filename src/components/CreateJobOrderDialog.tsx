
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobFormWithImageUpload } from "@/components/job-form/JobFormWithImageUpload";

interface CreateJobOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJobOrderDialog({ open, onOpenChange }: CreateJobOrderDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Job Order</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <JobFormWithImageUpload onCancel={handleClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
