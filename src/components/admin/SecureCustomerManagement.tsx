
import { CustomerManagement } from "./CustomerManagement";
import { useAdminQueries } from "@/hooks/useAdminQueries";
import { useAdminMutations } from "@/hooks/useAdminMutations";
import { useState } from "react";

export function SecureCustomerManagement() {
  const { customers, customersLoading } = useAdminQueries();
  const { addCustomerMutation } = useAdminMutations('customers');
  const [customerForm, setCustomerForm] = useState({ name: "" });

  const handleCreate = async (data: { name: string }) => {
    await addCustomerMutation.mutateAsync(data);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerForm.name.trim()) {
      handleCreate({ name: customerForm.name });
      setCustomerForm({ name: "" });
    }
  };

  const handleUpdate = async (id: string, data: { name: string }) => {
    // Update functionality would need to be implemented in useAdminMutations
    console.log('Update customer:', id, data);
  };

  const handleDelete = async (id: string) => {
    // Delete functionality would need to be implemented in useAdminMutations
    console.log('Delete customer:', id);
  };

  return (
    <CustomerManagement
      customers={customers}
      customersLoading={customersLoading}
      customerForm={customerForm}
      setCustomerForm={setCustomerForm}
      onAddCustomer={handleAddCustomer}
      isAdding={addCustomerMutation.isPending}
    />
  );
}
