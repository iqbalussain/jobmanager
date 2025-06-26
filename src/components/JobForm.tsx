
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateJobOrder } from "@/hooks/useCreateJobOrder";
import { useDropdownData } from "@/hooks/useDropdownData";
import { BranchSection } from "./job-form/BranchSection";
import { CustomerSection } from "./job-form/CustomerSection";
import { JobDetailsSection } from "./job-form/JobDetailsSection";
import { TeamSection } from "./job-form/TeamSection";
import { ProjectDetailsSection } from "./job-form/ProjectDetailsSection";
import { ScheduleSection } from "./job-form/ScheduleSection";
import { JobOrderDetailsSection } from "./job-form/JobOrderDetailsSection";
import { ImageUploadSection } from "./job-form/ImageUploadSection";
import { FormActions } from "./job-form/FormActions";

interface JobFormProps {
  onCancel?: () => void;
}

export function JobForm({ onCancel }: JobFormProps) {
  const { toast } = useToast();
  const { createJobOrder, isCreating } = useCreateJobOrder();
  const { customers, designers, salesmen, jobTitles } = useDropdownData();
  const [createdJobOrderId, setCreatedJobOrderId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer: '',
    jobTitle: '',
    assignee: '',
    designer: '',
    salesman: '',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date().toISOString().split('T')[0],
    estimatedHours: 8,
    branch: 'Head Office',
    jobOrderDetails: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newJobOrder = await createJobOrder({
        customer_id: formData.customer,
        job_title_id: formData.jobTitle,
        designer_id: formData.designer,
        salesman_id: formData.salesman,
        assignee: formData.assignee,
        priority: formData.priority as 'low' | 'medium' | 'high',
        status: formData.status as 'pending' | 'in-progress' | 'designing' | 'completed' | 'finished' | 'cancelled' | 'invoiced',
        due_date: formData.dueDate,
        estimated_hours: formData.estimatedHours,
        branch: formData.branch,
        job_order_details: formData.jobOrderDetails
      });

      // Set the created job order ID to enable image uploads
      setCreatedJobOrderId(newJobOrder.id);

      toast({
        title: "Success",
        description: "Job order created successfully. You can now upload reference images.",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create job order: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleFinalComplete = () => {
    // Reset form
    setFormData({
      customer: '',
      jobTitle: '',
      assignee: '',
      designer: '',
      salesman: '',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedHours: 8,
      branch: 'Head Office',
      jobOrderDetails: ''
    });
    setCreatedJobOrderId(null);

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {createdJobOrderId ? 'Upload Reference Images (Optional)' : 'Create New Job Order'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {!createdJobOrderId ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <BranchSection 
              value={formData.branch} 
              onChange={(value) => setFormData(prev => ({ ...prev, branch: value }))} 
            />

            <CustomerSection 
              value={formData.customer} 
              onChange={(value) => setFormData(prev => ({ ...prev, customer: value }))}
              customers={customers}
            />

            <JobDetailsSection 
              jobTitle={formData.jobTitle}
              assignee={formData.assignee}
              onJobTitleChange={(value) => setFormData(prev => ({ ...prev, jobTitle: value }))}
              onAssigneeChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
              jobTitles={jobTitles}
            />

            <TeamSection 
              designer={formData.designer}
              salesman={formData.salesman}
              onDesignerChange={(value) => setFormData(prev => ({ ...prev, designer: value }))}
              onSalesmanChange={(value) => setFormData(prev => ({ ...prev, salesman: value }))}
              designers={designers}
              salesmen={salesmen}
            />

            <ProjectDetailsSection 
              priority={formData.priority}
              status={formData.status}
              onPriorityChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              onStatusChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            />

            <ScheduleSection 
              dueDate={formData.dueDate}
              estimatedHours={formData.estimatedHours}
              onDueDateChange={(value) => setFormData(prev => ({ ...prev, dueDate: value }))}
              onEstimatedHoursChange={(value) => setFormData(prev => ({ ...prev, estimatedHours: value }))}
            />

            <JobOrderDetailsSection 
              value={formData.jobOrderDetails}
              onChange={(value) => setFormData(prev => ({ ...prev, jobOrderDetails: value }))}
            />

            <ImageUploadSection />

            <FormActions onCancel={onCancel} isCreating={isCreating} />
          </form>
        ) : (
          <div className="space-y-6">
            <ImageUploadSection jobOrderId={createdJobOrderId} />
            
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={handleFinalComplete}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete & Close
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
