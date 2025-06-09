
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { sanitizeInput, validateLength } from "@/utils/inputValidation";
import type { Customer } from "@/hooks/useSecureAdminManagement";

interface SecureCustomerManagementProps {
  customers: Customer[];
  customersLoading: boolean;
  customerForm: { name: string };
  setCustomerForm: (form: { name: string }) => void;
  onAddCustomer: (e: React.FormEvent) => void;
  isAdding: boolean;
}

export function SecureCustomerManagement({
  customers,
  customersLoading,
  customerForm,
  setCustomerForm,
  onAddCustomer,
  isAdding
}: SecureCustomerManagementProps) {
  
  const handleInputChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setCustomerForm({ name: sanitized });
  };
  
  const isValidForm = validateLength(customerForm.name, 1, 255);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddCustomer} className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerForm.name}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter customer name"
                maxLength={255}
                required
              />
              {!isValidForm && customerForm.name && (
                <p className="text-sm text-red-600 mt-1">
                  Customer name must be between 1 and 255 characters
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isAdding || !isValidForm}
            >
              {isAdding ? "Adding..." : "Add Customer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {customersLoading ? (
            <p>Loading customers...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
