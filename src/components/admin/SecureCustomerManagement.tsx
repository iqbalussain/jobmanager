import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminMutations } from "@/hooks/useAdminMutations";
import { useAdminQueries } from "@/hooks/useAdminQueries";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Building } from "lucide-react";

export function SecureCustomerManagement() {
  const [newCustomer, setNewCustomer] = useState({ name: "", contact: "", address: "" });
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const { toast } = useToast();

  const { data: customers = [], isLoading } = useAdminQueries().customers;
  const { createCustomer, updateCustomer, deleteCustomer } = useAdminMutations();

  const handleCreate = async () => {
    try {
      await createCustomer.mutateAsync(newCustomer);
      setNewCustomer({ name: "", contact: "", address: "" });
      toast({ title: "Success", description: "Customer created successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create customer", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editingCustomer) return;
    try {
      await updateCustomer.mutateAsync(editingCustomer);
      setEditingCustomer(null);
      toast({ title: "Success", description: "Customer updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update customer", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer.mutateAsync(id);
      toast({ title: "Success", description: "Customer deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete customer", variant: "destructive" });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Add New Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              placeholder="Customer name"
            />
          </div>
          <div>
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              value={newCustomer.contact}
              onChange={(e) => setNewCustomer({ ...newCustomer, contact: e.target.value })}
              placeholder="Phone/Email"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              placeholder="Customer address"
            />
          </div>
          <Button onClick={handleCreate} disabled={createCustomer.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            {createCustomer.isPending ? "Creating..." : "Add Customer"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer: any) => (
              <div key={customer.id} className="border p-4 rounded-lg">
                {editingCustomer?.id === customer.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingCustomer.name}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                      placeholder="Customer name"
                    />
                    <Input
                      value={editingCustomer.contact}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, contact: e.target.value })}
                      placeholder="Phone/Email"
                    />
                    <Textarea
                      value={editingCustomer.address}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                      placeholder="Customer address"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdate} disabled={updateCustomer.isPending}>
                        {updateCustomer.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingCustomer(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{customer.name}</h3>
                      <p className="text-sm text-gray-600">{customer.contact}</p>
                      <p className="text-sm text-gray-600">{customer.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCustomer(customer)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(customer.id)}
                        disabled={deleteCustomer.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
