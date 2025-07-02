
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DeliveredAtSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function DeliveredAtSection({ value, onChange }: DeliveredAtSectionProps) {
  return (
    <div>
      <Label htmlFor="delivered-at">Delivered At</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select delivery location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Head Office">Head Office</SelectItem>
          <SelectItem value="Faiyaz">Faiyaz</SelectItem>
          <SelectItem value="Babu">Babu</SelectItem>
          <SelectItem value="Asif">Asif</SelectItem>
          <SelectItem value="Abbas">Abbas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
