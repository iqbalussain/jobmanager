import { Label } from "@/components/ui/label";
import { DescriptionEditor } from "@/components/DescriptionEditor";

interface JobOrderDetailsSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobOrderDetailsSection({ value, onChange }: JobOrderDetailsSectionProps) {
  return (
    <div>
      <Label htmlFor="jobOrderDetails">Job Order Details</Label>
      <DescriptionEditor
        value={value}
        onChange={onChange}
        placeholder="Enter job order details (use toolbar for formatting, saved as plain text)"
      />
    </div>
  );
}
