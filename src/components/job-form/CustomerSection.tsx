
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer } from "@/hooks/useDropdownData";

interface CustomerSectionProps {
  value: string;
  onChange: (value: string) => void;
  customers: Customer[];
  clientName?: string;
  onClientNameChange?: (value: string) => void;
}

export function CustomerSection({ 
  value, 
  onChange, 
  customers, 
  clientName = "", 
  onClientNameChange 
}: CustomerSectionProps) {
  const CASH_CUSTOMER_ID = '00000000-0000-0000-0000-000000000001';
  const isCashCustomer = value === CASH_CUSTOMER_ID;

  return (
    <div className="space-y-4">
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

      {isCashCustomer && (
        <div>
          <Label htmlFor="clientName">Client Name *</Label>
          <Input
            id="clientName"
            type="text"
            placeholder="Enter client name"
            value={clientName}
            onChange={(e) => onClientNameChange?.(e.target.value)}
            required
          />
        </div>
      )}
    </div>
  );
}
