
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
  Building,
  Users,
  FileText
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
    <>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customer & Team Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 text-blue-600">
            <Users className="w-5 h-5" />
            <h3 className="text-lg font-bold">Customer & Team</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-600">Customer:</Label>
              <div className="flex items-center gap-2 mt-1">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-lg font-medium text-gray-900">{job.customer}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-600">Assignee:</Label>
              <div className="flex items-center gap-2 mt-1 text-gray-700">
                <User className="w-4 h-4 text-gray-500" />
                <span>{job.assignee || 'Unassigned'}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-600">Designer:</Label>
              <div className="flex items-center gap-2 mt-1 text-gray-700">
                <User className="w-4 h-4 text-gray-500" />
                <span>{job.designer || 'Not assigned'}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-600">Salesman:</Label>
              <div className="flex items-center gap-2 mt-1 text-gray-700">
                <User className="w-4 h-4 text-gray-500" />
                <span>{job.salesman || 'Not assigned'}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="branch" className="text-sm font-semibold text-gray-600">Branch:</Label>
              {isEditMode ? (
                <Input
                  id="branch"
                  value={editData.branch || ''}
                  onChange={(e) => onEditDataChange({...editData, branch: e.target.value})}
                  className="mt-1"
                />
              ) : (
                <p className="text-gray-700 mt-1">{job.branch || 'Head Office'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline & Details Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 text-green-600">
            <Calendar className="w-5 h-5" />
            <h3 className="text-lg font-bold">Timeline & Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-600">Created Date:</Label>
              <p className="text-gray-700 mt-1">{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>

            <div>
              <Label htmlFor="dueDate" className="text-sm font-semibold text-gray-600">Due Date:</Label>
              {isEditMode ? (
                <Input
                  id="dueDate"
                  type="date"
                  value={editData.dueDate || ''}
                  onChange={(e) => onEditDataChange({...editData, dueDate: e.target.value})}
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(job.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="estimatedHours" className="text-sm font-semibold text-gray-600">Est. Hours:</Label>
              {isEditMode ? (
                <Input
                  id="estimatedHours"
                  type="number"
                  value={editData.estimatedHours || 0}
                  onChange={(e) => onEditDataChange({...editData, estimatedHours: parseInt(e.target.value) || 0})}
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1 text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>{job.estimatedHours} hours</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="priority" className="text-sm font-semibold text-gray-600">Priority:</Label>
              {isEditMode ? (
                <Select value={editData.priority} onValueChange={(value) => onEditDataChange({...editData, priority: value as any})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <Badge className={`${getPriorityColor(job.priority)} text-xs font-semibold px-3 py-1 rounded-full uppercase`}>
                    {job.priority}
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-600">Status:</Label>
              <div className="mt-1">
                <Badge className={`${getStatusColor(job.status)} text-xs font-semibold px-3 py-1 rounded-full uppercase`}>
                  {job.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Title Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4 text-purple-600">
          <FileText className="w-5 h-5" />
          <h3 className="text-lg font-bold">Job Information</h3>
        </div>
        
        <div>
          <Label htmlFor="title" className="text-sm font-semibold text-gray-600">Job Title:</Label>
          {isEditMode ? (
            <Input
              id="title"
              value={editData.title || ''}
              onChange={(e) => onEditDataChange({...editData, title: e.target.value})}
              className="mt-1"
            />
          ) : (
            <p className="text-xl font-bold text-gray-900 mt-1">{job.title}</p>
          )}
        </div>
      </div>

      {/* Job Description Section */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4 text-gray-600">
          <FileText className="w-5 h-5" />
          <h3 className="text-lg font-bold">Job Description</h3>
        </div>
        
        {isEditMode ? (
          <Textarea
            id="description"
            value={editData.description || ''}
            onChange={(e) => onEditDataChange({...editData, description: e.target.value})}
            rows={3}
            className="w-full"
          />
        ) : (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              {job.description || 'No description provided.'}
            </p>
          </div>
        )}
      </div>

      {/* Job Order Details Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4 text-amber-600">
          <FileText className="w-5 h-5" />
          <h3 className="text-lg font-bold">Job Order Details</h3>
        </div>
        
        {isEditMode ? (
          <Textarea
            id="jobOrderDetails"
            value={editData.jobOrderDetails || ''}
            onChange={(e) => onEditDataChange({...editData, jobOrderDetails: e.target.value})}
            rows={4}
            placeholder="Additional job order details..."
            className="w-full"
          />
        ) : (
          <div className="bg-white p-4 rounded-lg border border-amber-200">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {job.jobOrderDetails || 'No additional details provided.'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
