import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JobTitleDropdown } from "@/components/dropdowns/JobTitleDropdown";
import { useJobOrderItems, CreateJobOrderItemData } from "@/hooks/useJobOrderItems";

interface JobOrderItemsFormProps {
  jobOrderId: string;
  readOnly?: boolean;
}

interface NewItemForm {
  job_title_id: string;
  description: string;
  quantity: number;
  unit_price?: number;
}

export function JobOrderItemsForm({ jobOrderId, readOnly = false }: JobOrderItemsFormProps) {
  const { items, addItemMutation, deleteItemMutation } = useJobOrderItems(jobOrderId);
  const [newItem, setNewItem] = useState<NewItemForm>({
    job_title_id: "",
    description: "",
    quantity: 1,
    unit_price: undefined
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddItem = async () => {
    if (!newItem.job_title_id || !newItem.description) return;

    const itemData: CreateJobOrderItemData = {
      job_order_id: jobOrderId,
      job_title_id: newItem.job_title_id,
      description: newItem.description,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price,
      order_sequence: items.length
    };

    await addItemMutation.mutateAsync(itemData);
    
    // Reset form
    setNewItem({
      job_title_id: "",
      description: "",
      quantity: 1,
      unit_price: undefined
    });
    setShowAddForm(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItemMutation.mutateAsync(itemId);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Job Order Items</h3>
        {!readOnly && (
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>

      {/* Existing Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{item.job_titles?.job_title_id || 'Unknown Item'}</span>
                    {item.quantity > 1 && (
                      <span className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                    )}
                    {item.unit_price && (
                      <span className="text-sm text-muted-foreground">
                        @ ${item.unit_price} = ${item.total_price?.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Item Form */}
      {showAddForm && !readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="job-title">Job Title *</Label>
              <JobTitleDropdown
                value={newItem.job_title_id}
                onValueChange={(value) => setNewItem({ ...newItem, job_title_id: value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Describe the work to be done..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="unit-price">Unit Price (Optional)</Label>
                <Input
                  id="unit-price"
                  type="number"
                  step="0.01"
                  value={newItem.unit_price || ""}
                  onChange={(e) => setNewItem({ 
                    ...newItem, 
                    unit_price: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddItem}
                disabled={!newItem.job_title_id || !newItem.description || addItemMutation.isPending}
              >
                {addItemMutation.isPending ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total */}
      {items.some(item => item.total_price) && (
        <div className="flex justify-end">
          <Card className="w-fit">
            <CardContent className="p-4">
              <div className="text-lg font-semibold">
                Total: ${calculateTotal().toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
