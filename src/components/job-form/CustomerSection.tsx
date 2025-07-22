
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer } from "@/hooks/useDropdownData";

interface CustomerSectionProps {
  value: string;
  onChange: (value: string) => void;
  customers: Customer[];
}

export function CustomerSection({ value, onChange, customers }: CustomerSectionProps) {
  return (
    <div>
      <Label htmlFor="customer">Customer *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select customer" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
