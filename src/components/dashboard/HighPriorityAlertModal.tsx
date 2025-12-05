import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface HighPriorityAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobOrderNumber?: string;
  message?: string;
}

export function HighPriorityAlertModal({ 
  isOpen, 
  onClose, 
  jobOrderNumber,
  message 
}: HighPriorityAlertModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            High Priority Job
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {message || "⚠ A job has been marked as HIGH PRIORITY."}
          </DialogDescription>
          {jobOrderNumber && (
            <p className="text-center text-sm text-muted-foreground">
              Job Order: <span className="font-semibold text-foreground">{jobOrderNumber}</span>
            </p>
          )}
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button onClick={onClose} className="px-8">
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
