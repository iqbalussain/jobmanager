
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BranchSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function BranchSection({ value, onChange }: BranchSectionProps) {
  return (
    <div>
      <Label htmlFor="branch">Branch *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Head Office">Head Office</SelectItem>
          <SelectItem value="Wadi Kabeer">Wadi Kabeer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
