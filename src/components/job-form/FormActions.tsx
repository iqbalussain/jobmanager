
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel?: () => void;
  isCreating: boolean;
}

export function FormActions({ onCancel, isCreating }: FormActionsProps) {
  return (
    <div className="flex gap-4 pt-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={isCreating} className="flex-1">
        {isCreating ? "Creating..." : "Create Job Order"}
      </Button>
    </div>
  );
}
