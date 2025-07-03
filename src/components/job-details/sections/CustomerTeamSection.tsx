import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Job } from "@/types/job";
import { Customer } from "@/types/jobOrder";
import { Users, MapPin } from "lucide-react";

interface CustomerTeamSectionProps {
  job: Job;
  isEditMode: boolean;
  editData: Partial<Job>;
  onEditDataChange: (data: Partial<Job>) => void;
  customers: Customer[];
  dropdownLoading: boolean;
}

export function CustomerTeamSection({ 
  job, 
  isEditMode, 
  editData, 
  onEditDataChange, 
  customers, 
  dropdownLoading 
}: CustomerTeamSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Customer & Team
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Customer</Label>
            {isEditMode ? (
              <Select 
                value={editData.customer_id || job.customer_id || ''} 
                onValueChange={(value) => onEditDataChange({ ...editData, customer_id: value })}
                disabled={dropdownLoading}
              >
                <SelectTrigger className="mt-1">
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
            ) : (
              <p className="mt-1 text-sm font-semibold text-gray-900">{job.customer}</p>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Assignee</Label>
            <p className="mt-1 text-sm text-gray-700">{job.assignee || 'Unassigned'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Designer</Label>
            <p className="mt-1 text-sm text-gray-700">{job.designer || 'Not assigned'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Salesman</Label>
            <p className="mt-1 text-sm text-gray-700">{job.salesman || 'Not assigned'}</p>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            Branch
          </Label>
          {isEditMode ? (
            <Input
              value={editData.branch || ''}
              onChange={(e) => onEditDataChange({ ...editData, branch: e.target.value })}
              placeholder="Enter branch"
              className="mt-1"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-700">{job.branch || 'Head Office'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
