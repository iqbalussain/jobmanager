
import { CustomerManagement } from "./CustomerManagement";
import { useAdminQueries } from "@/hooks/useAdminQueries";
import { useAdminMutations } from "@/hooks/useAdminMutations";

export function SecureCustomerManagement() {
  const { customers, isLoading } = useAdminQueries();
  const { addCustomerMutation } = useAdminMutations();

  const handleCreate = async (data: { name: string }) => {
    await addCustomerMutation.mutateAsync(data);
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
      isLoading={isLoading}
      onCreateCustomer={handleCreate}
      onUpdateCustomer={handleUpdate}
      onDeleteCustomer={handleDelete}
    />
  );
}
