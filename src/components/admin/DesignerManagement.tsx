
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { Designer } from "@/hooks/useAdminManagement";

interface DesignerManagementProps {
  designers: Designer[];
  designersLoading: boolean;
  designerForm: { name: string; phone: string };
  setDesignerForm: (form: { name: string; phone: string }) => void;
  onAddDesigner: (e: React.FormEvent) => void;
  isAdding: boolean;
}

export function DesignerManagement({
  designers,
  designersLoading,
  designerForm,
  setDesignerForm,
  onAddDesigner,
  isAdding
}: DesignerManagementProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Designer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddDesigner} className="space-y-4">
            <div>
              <Label htmlFor="designerName">Name</Label>
              <Input
                id="designerName"
                value={designerForm.name}
                onChange={(e) => setDesignerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter designer name"
                required
              />
            </div>
            <div>
              <Label htmlFor="designerPhone">Phone</Label>
              <Input
                id="designerPhone"
                value={designerForm.phone}
                onChange={(e) => setDesignerForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add Designer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Designers</CardTitle>
        </CardHeader>
        <CardContent>
          {designersLoading ? (
            <p>Loading designers...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {designers.map((designer) => (
                  <TableRow key={designer.id}>
                    <TableCell className="font-medium">{designer.name}</TableCell>
                    <TableCell>{designer.phone || 'N/A'}</TableCell>
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
