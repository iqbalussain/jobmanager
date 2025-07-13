
import { useState } from 'react';

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

const initialFormData: JobFormData = {
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
};

export function useJobFormState() {
  const [currentStep, setCurrentStep] = useState<'form' | 'upload'>('form');
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep('form');
    setCreatedJobId(null);
  };

  const goToUploadStep = (jobId: string) => {
    setCreatedJobId(jobId);
    setCurrentStep('upload');
  };

  const goBackToForm = () => {
    setCurrentStep('form');
    setCreatedJobId(null);
  };

  return {
    currentStep,
    createdJobId,
    formData,
    setFormData,
    resetForm,
    goToUploadStep,
    goBackToForm
  };
}

export type { JobFormData };
