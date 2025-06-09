
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { Salesman } from "@/hooks/useSalesmanManagement";

interface SalesmanManagementProps {
  salesmen: Salesman[];
  salesmenLoading: boolean;
  salesmanForm: { name: string; email: string; phone: string };
  setSalesmanForm: (form: { name: string; email: string; phone: string }) => void;
  onAddSalesman: (e: React.FormEvent) => void;
  isAdding: boolean;
}

export function SalesmanManagement({
  salesmen,
  salesmenLoading,
  salesmanForm,
  setSalesmanForm,
  onAddSalesman,
  isAdding
}: SalesmanManagementProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Salesman
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddSalesman} className="space-y-4">
            <div>
              <Label htmlFor="salesmanName">Salesman Name</Label>
              <Input
                id="salesmanName"
                value={salesmanForm.name}
                onChange={(e) => setSalesmanForm({ ...salesmanForm, name: e.target.value })}
                placeholder="Enter salesman name"
                required
              />
            </div>
            <div>
              <Label htmlFor="salesmanEmail">Email</Label>
              <Input
                id="salesmanEmail"
                type="email"
                value={salesmanForm.email}
                onChange={(e) => setSalesmanForm({ ...salesmanForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="salesmanPhone">Phone</Label>
              <Input
                id="salesmanPhone"
                value={salesmanForm.phone}
                onChange={(e) => setSalesmanForm({ ...salesmanForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add Salesman"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Salesmen</CardTitle>
        </CardHeader>
        <CardContent>
          {salesmenLoading ? (
            <p>Loading salesmen...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesmen.map((salesman) => (
                  <TableRow key={salesman.id}>
                    <TableCell className="font-medium">{salesman.name}</TableCell>
                    <TableCell>{salesman.email || 'N/A'}</TableCell>
                    <TableCell>{salesman.phone || 'N/A'}</TableCell>
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
