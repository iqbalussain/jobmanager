
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JobOrderDetailsSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobOrderDetailsSection({ value, onChange }: JobOrderDetailsSectionProps) {
  return (
    <div>
      <Label htmlFor="jobOrderDetails">Job Order Details</Label>
      <Textarea
        id="jobOrderDetails"
        placeholder="Enter job order details"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
