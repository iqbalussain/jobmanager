
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/pages/Index";
import { JobTitle } from "@/types/jobOrder";
import { FileText, Calendar, Clock, MapPin } from "lucide-react";

interface ProjectDetailsSectionProps {
  job: Job;
  isEditMode: boolean;
  editData: Partial<Job>;
  onEditDataChange: (data: Partial<Job>) => void;
  jobTitles: JobTitle[];
  dropdownLoading: boolean;
}

export function ProjectDetailsSection({ 
  job, 
  isEditMode, 
  editData, 
  onEditDataChange, 
  jobTitles, 
  dropdownLoading 
}: ProjectDetailsSectionProps) {
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
              value={editData.job_title_id || job.job_title_id || ''} 
              onValueChange={(value) => onEditDataChange({ ...editData, job_title_id: value })}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Branch</Label>
            {isEditMode ? (
              <Select 
                value={editData.branch || job.branch || ''} 
                onValueChange={(value) => onEditDataChange({ ...editData, branch: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Head Office">Head Office</SelectItem>
                  <SelectItem value="Wadi Kabeer">Wadi Kabeer</SelectItem>
                  <SelectItem value="Wajihat Ruwi">Wajihat Ruwi</SelectItem>
                  <SelectItem value="Ruwi Branch">Ruwi Branch</SelectItem>
                  <SelectItem value="Ghubra Branch">Ghubra Branch</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-1 text-sm text-gray-700">{job.branch || 'Head Office'}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Delivered At
            </Label>
            {isEditMode ? (
              <Select 
                value={editData.deliveredAt || job.deliveredAt || ''} 
                onValueChange={(value) => onEditDataChange({ ...editData, deliveredAt: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select delivery location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Head Office">Head Office</SelectItem>
                  <SelectItem value="Faiyaz">Faiyaz</SelectItem>
                  <SelectItem value="Babu">Babu</SelectItem>
                  <SelectItem value="Asif">Asif</SelectItem>
                  <SelectItem value="Abbas">Abbas</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-1 text-sm text-gray-700">{job.deliveredAt || 'Not specified'}</p>
            )}
          </div>
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
  );
}
