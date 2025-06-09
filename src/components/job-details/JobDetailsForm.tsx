
import { useState, useEffect } from "react";
import { Job } from "@/pages/Index";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  User,
  Clock,
  Building
} from "lucide-react";

interface JobDetailsFormProps {
  job: Job;
  isEditMode: boolean;
  editData: Partial<Job>;
  onEditDataChange: (data: Partial<Job>) => void;
}

export function JobDetailsForm({ job, isEditMode, editData, onEditDataChange }: JobDetailsFormProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      {/* Job Details Form/Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            {isEditMode ? (
              <Input
                id="title"
                value={editData.title || ''}
                onChange={(e) => onEditDataChange({...editData, title: e.target.value})}
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900">{job.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            {isEditMode ? (
              <Textarea
                id="description"
                value={editData.description || ''}
                onChange={(e) => onEditDataChange({...editData, description: e.target.value})}
                rows={3}
              />
            ) : (
              <p className="text-gray-700">{job.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            {isEditMode ? (
              <Select value={editData.priority} onValueChange={(value) => onEditDataChange({...editData, priority: value as any})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge className={getPriorityColor(job.priority)}>
                {job.priority} priority
              </Badge>
            )}
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            {isEditMode ? (
              <Input
                id="dueDate"
                type="date"
                value={editData.dueDate || ''}
                onChange={(e) => onEditDataChange({...editData, dueDate: e.target.value})}
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>{new Date(job.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Customer</Label>
            <div className="flex items-center gap-2 text-gray-700">
              <Building className="w-4 h-4" />
              <span>{job.customer}</span>
            </div>
          </div>

          <div>
            <Label>Assignee</Label>
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4" />
              <span>{job.assignee || 'Not assigned'}</span>
            </div>
          </div>

          <div>
            <Label>Designer</Label>
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4" />
              <span>{job.designer || 'Not assigned'}</span>
            </div>
          </div>

          <div>
            <Label>Salesman</Label>
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4" />
              <span>{job.salesman || 'Not assigned'}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            {isEditMode ? (
              <Input
                id="estimatedHours"
                type="number"
                value={editData.estimatedHours || 0}
                onChange={(e) => onEditDataChange({...editData, estimatedHours: parseInt(e.target.value) || 0})}
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                <span>{job.estimatedHours} hours</span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="branch">Branch</Label>
            {isEditMode ? (
              <Input
                id="branch"
                value={editData.branch || ''}
                onChange={(e) => onEditDataChange({...editData, branch: e.target.value})}
              />
            ) : (
              <p className="text-gray-700">{job.branch || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Job Order Details */}
      <div>
        <Label htmlFor="jobOrderDetails">Job Order Details</Label>
        {isEditMode ? (
          <Textarea
            id="jobOrderDetails"
            value={editData.jobOrderDetails || ''}
            onChange={(e) => onEditDataChange({...editData, jobOrderDetails: e.target.value})}
            rows={4}
            placeholder="Additional job order details..."
          />
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-gray-700 whitespace-pre-wrap">
              {job.jobOrderDetails || 'No additional details provided.'}
            </p>
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <Label>Created At</Label>
          <p className="text-sm text-gray-600">{new Date(job.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </>
  );
}
