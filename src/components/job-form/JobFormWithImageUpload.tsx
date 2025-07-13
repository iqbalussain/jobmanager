
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCreateJobOrder } from "@/hooks/useCreateJobOrder";
import { useDropdownData } from "@/hooks/useDropdownData";
import { BranchSection } from "./BranchSection";
import { CustomerSection } from "./CustomerSection";
import { JobDetailsSection } from "./JobDetailsSection";
import { TeamSection } from "./TeamSection";
import { ProjectDetailsSection } from "./ProjectDetailsSection";
import { ScheduleSection } from "./ScheduleSection";
import { JobOrderDetailsSection } from "./JobOrderDetailsSection";
import { FormActions } from "./FormActions";
import { ImageUploader } from "@/components/image-upload/ImageUploader";
import { ArrowLeft, Check } from "lucide-react";

interface JobFormWithImageUploadProps {
  onCancel?: () => void;
}

export function JobFormWithImageUpload({ onCancel }: JobFormWithImageUploadProps) {
  const { toast } = useToast();
  const { createJobOrder, isCreating } = useCreateJobOrder();
  const { customers, designers, salesmen, jobTitles } = useDropdownData();
  
  const [currentStep, setCurrentStep] = useState<'form' | 'upload'>('form');
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

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

      setCreatedJobId(newJob.id);
      setCurrentStep('upload');
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
    
    // Reset form and close modal
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
    setCurrentStep('form');
    setCreatedJobId(null);
    
    if (onCancel) {
      onCancel();
    }
  };

  const handleSkipImageUpload = () => {
    handleImageUploadComplete();
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setCreatedJobId(null);
  };

  if (currentStep === 'upload' && createdJobId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToForm}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Upload Job Images</h3>
            <p className="text-sm text-gray-600">
              Add images related to this job order (optional)
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <ImageUploader
            jobOrderId={createdJobId}
            onUploadComplete={handleImageUploadComplete}
            maxFiles={10}
          />
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSkipImageUpload}
              variant="outline"
              className="flex-1"
            >
              Skip Image Upload
            </Button>
            <Button
              onClick={handleImageUploadComplete}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Finish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Step 1 of 2: Job Details
        </p>
      </div>
      
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

        <FormActions onCancel={onCancel} isCreating={isCreating} />
      </form>
    </div>
  );
}
