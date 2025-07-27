
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
import { ArrowLeft, Check, User, Briefcase, Users, Calendar, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    jobOrderDetails: '',
    clientName: ''
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
        job_order_details: formData.jobOrderDetails,
        client_name: formData.clientName
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
      jobOrderDetails: '',
      clientName: ''
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
            <h3 className="text-lg font-semibold text-gray-800">Upload Job Images</h3>
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
              className="flex-1 hover:bg-gray-50"
            >
              Skip Image Upload
            </Button>
            <Button
              onClick={handleImageUploadComplete}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Progress Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          <p className="text-sm font-medium text-gray-700">
            Step 1 of 2: Job Details
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info Section */}
        <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50/50 to-blue-50/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BranchSection 
                value={formData.branch} 
                onChange={(value) => setFormData(prev => ({ ...prev, branch: value }))} 
              />
              <CustomerSection 
                value={formData.customer} 
                onChange={(value) => setFormData(prev => ({ ...prev, customer: value }))}
                customers={customers}
                clientName={formData.clientName}
                onClientNameChange={(value) => setFormData(prev => ({ ...prev, clientName: value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Details Section */}
        <Card className="border-l-4 border-l-green-400 bg-gradient-to-r from-green-50/50 to-green-50/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Job Details</h3>
            </div>
            
            <JobDetailsSection 
              jobTitle={formData.jobTitle}
              assignee={formData.assignee}
              onJobTitleChange={(value) => setFormData(prev => ({ ...prev, jobTitle: value }))}
              onAssigneeChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
              jobTitles={jobTitles}
            />
          </CardContent>
        </Card>

        {/* Team Assignment Section */}
        <Card className="border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50/50 to-purple-50/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Team Assignment</h3>
            </div>
            
            <TeamSection 
              designer={formData.designer}
              salesman={formData.salesman}
              onDesignerChange={(value) => setFormData(prev => ({ ...prev, designer: value }))}
              onSalesmanChange={(value) => setFormData(prev => ({ ...prev, salesman: value }))}
              designers={designers}
              salesmen={salesmen}
            />
          </CardContent>
        </Card>

        {/* Project Details Section */}
        <Card className="border-l-4 border-l-orange-400 bg-gradient-to-r from-orange-50/50 to-orange-50/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Schedule & Priority</h3>
            </div>
            
            <div className="space-y-6">
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
            </div>
          </CardContent>
        </Card>

        {/* Additional Details Section */}
        <Card className="border-l-4 border-l-indigo-400 bg-gradient-to-r from-indigo-50/50 to-indigo-50/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Additional Details</h3>
            </div>
            
            <JobOrderDetailsSection 
              value={formData.jobOrderDetails}
              onChange={(value) => setFormData(prev => ({ ...prev, jobOrderDetails: value }))}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1 hover:bg-gray-50"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isCreating} 
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              "Create Job Order & Continue"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
