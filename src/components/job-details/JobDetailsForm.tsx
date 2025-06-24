
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/pages/Index";
import { useDropdownData } from "@/hooks/useDropdownData";
import { 
  User, 
  Calendar, 
  Clock, 
  Building, 
  FileText,
  Users,
  MapPin
} from "lucide-react";

interface JobDetailsFormProps {
  job: Job;
  isEditMode: boolean;
  editData: Partial<Job>;
  onEditDataChange: (data: Partial<Job>) => void;
}

export function JobDetailsForm({ job, isEditMode, editData, onEditDataChange }: JobDetailsFormProps) {
  const { customers, jobTitles, isLoading: dropdownLoading } = useDropdownData();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "finished": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Customer & Team Information */}
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
                  value={editData.customerId || job.customerId} 
                  onValueChange={(value) => onEditDataChange({ ...editData, customerId: value })}
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

      {/* Project Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Job Title</Label>
            {isEditMode ? (
              <Select 
                value={editData.jobTitleId || job.jobTitleId} 
                onValueChange={(value) => onEditDataChange({ ...editData, jobTitleId: value })}
                disabled={dropdownLoading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select job title" />
                </SelectTrigger>
                <SelectContent>
                  {jobTitles.map((jobTitle) => (
                    <SelectItem key={jobTitle.id} value={jobTitle.id}>
                      {jobTitle.job_title_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-1 text-sm font-semibold text-gray-900">{job.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Due Date
              </Label>
              {isEditMode ? (
                <Input
                  type="date"
                  value={editData.dueDate || ''}
                  onChange={(e) => onEditDataChange({ ...editData, dueDate: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-700">{new Date(job.dueDate).toLocaleDateString()}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Estimated Hours
              </Label>
              {isEditMode ? (
                <Input
                  type="number"
                  value={editData.estimatedHours || ''}
                  onChange={(e) => onEditDataChange({ ...editData, estimatedHours: parseInt(e.target.value) })}
                  placeholder="Enter hours"
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-700">{job.estimatedHours} hours</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Priority</Label>
              {isEditMode ? (
                <Select 
                  value={editData.priority || ''} 
                  onValueChange={(value) => onEditDataChange({ ...editData, priority: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <Badge className={getPriorityColor(job.priority)}>
                    {job.priority} priority
                  </Badge>
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <div className="mt-1">
                <Badge className={getStatusColor(job.status)}>
                  {job.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600">Created Date</Label>
            <p className="mt-1 text-sm text-gray-700">{new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Job Order Details - Full Width */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600" />
            Job Order Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditMode ? (
            <Textarea
              value={editData.jobOrderDetails || ''}
              onChange={(e) => onEditDataChange({ ...editData, jobOrderDetails: e.target.value })}
              placeholder="Enter detailed job order information..."
              className="min-h-[120px] resize-none"
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.jobOrderDetails || 'No additional details provided.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
