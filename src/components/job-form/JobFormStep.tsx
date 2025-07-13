
import React from 'react';
import { BranchSection } from "./BranchSection";
import { CustomerSection } from "./CustomerSection";
import { JobDetailsSection } from "./JobDetailsSection";
import { TeamSection } from "./TeamSection";
import { ProjectDetailsSection } from "./ProjectDetailsSection";
import { ScheduleSection } from "./ScheduleSection";
import { JobOrderDetailsSection } from "./JobOrderDetailsSection";
import { FormActions } from "./FormActions";
import { Customer, Designer, Salesman, JobTitle } from "@/hooks/useDropdownData";

interface JobFormData {
  customer: string;
  jobTitle: string;
  assignee: string;
  designer: string;
  salesman: string;
  priority: string;
  status: string;
  dueDate: string;
  estimatedHours: number;
  branch: string;
  jobOrderDetails: string;
}

interface JobFormStepProps {
  formData: JobFormData;
  onFormDataChange: (data: JobFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isCreating: boolean;
  customers: Customer[];
  designers: Designer[];
  salesmen: Salesman[];
  jobTitles: JobTitle[];
}

export function JobFormStep({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isCreating,
  customers,
  designers,
  salesmen,
  jobTitles
}: JobFormStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Step 1 of 2: Job Details
        </p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <BranchSection 
          value={formData.branch} 
          onChange={(value) => onFormDataChange({ ...formData, branch: value })} 
        />

        <CustomerSection 
          value={formData.customer} 
          onChange={(value) => onFormDataChange({ ...formData, customer: value })}
          customers={customers}
        />

        <JobDetailsSection 
          jobTitle={formData.jobTitle}
          assignee={formData.assignee}
          onJobTitleChange={(value) => onFormDataChange({ ...formData, jobTitle: value })}
          onAssigneeChange={(value) => onFormDataChange({ ...formData, assignee: value })}
          jobTitles={jobTitles}
        />

        <TeamSection 
          designer={formData.designer}
          salesman={formData.salesman}
          onDesignerChange={(value) => onFormDataChange({ ...formData, designer: value })}
          onSalesmanChange={(value) => onFormDataChange({ ...formData, salesman: value })}
          designers={designers}
          salesmen={salesmen}
        />

        <ProjectDetailsSection 
          priority={formData.priority}
          status={formData.status}
          onPriorityChange={(value) => onFormDataChange({ ...formData, priority: value })}
          onStatusChange={(value) => onFormDataChange({ ...formData, status: value })}
        />

        <ScheduleSection 
          dueDate={formData.dueDate}
          estimatedHours={formData.estimatedHours}
          onDueDateChange={(value) => onFormDataChange({ ...formData, dueDate: value })}
          onEstimatedHoursChange={(value) => onFormDataChange({ ...formData, estimatedHours: value })}
        />

        <JobOrderDetailsSection 
          value={formData.jobOrderDetails}
          onChange={(value) => onFormDataChange({ ...formData, jobOrderDetails: value })}
        />

        <FormActions onCancel={onCancel} isCreating={isCreating} />
      </form>
    </div>
  );
}
