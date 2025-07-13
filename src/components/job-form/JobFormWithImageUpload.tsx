
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { useCreateJobOrder } from "@/hooks/useCreateJobOrder";
import { useDropdownData } from "@/hooks/useDropdownData";
import { JobFormStep } from "./JobFormStep";
import { ImageUploadStep } from "./ImageUploadStep";
import { useJobFormState } from "./useJobFormState";

interface JobFormWithImageUploadProps {
  onCancel?: () => void;
}

export function JobFormWithImageUpload({ onCancel }: JobFormWithImageUploadProps) {
  const { toast } = useToast();
  const { createJobOrder, isCreating } = useCreateJobOrder();
  const { customers, designers, salesmen, jobTitles } = useDropdownData();
  
  const {
    currentStep,
    createdJobId,
    formData,
    setFormData,
    resetForm,
    goToUploadStep,
    goBackToForm
  } = useJobFormState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newJob = await createJobOrder({
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

      toast({
        title: "Success",
        description: "Job order created successfully! Now you can upload images.",
      });

      goToUploadStep(newJob.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create job order: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleImageUploadComplete = () => {
    toast({
      title: "Complete",
      description: "Job order created and images uploaded successfully!",
    });
    
    resetForm();
    
    if (onCancel) {
      onCancel();
    }
  };

  const handleSkipImageUpload = () => {
    handleImageUploadComplete();
  };

  if (currentStep === 'upload' && createdJobId) {
    return (
      <ImageUploadStep
        jobOrderId={createdJobId}
        onBack={goBackToForm}
        onComplete={handleImageUploadComplete}
        onSkip={handleSkipImageUpload}
      />
    );
  }

  return (
    <JobFormStep
      formData={formData}
      onFormDataChange={setFormData}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isCreating={isCreating}
      customers={customers}
      designers={designers}
      salesmen={salesmen}
      jobTitles={jobTitles}
    />
  );
}
