
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createJobTitle, listJobTitles } from '@/data/jobTitles';
import { useToast } from '@/hooks/use-toast';

export interface JobTitle {
  id: string;
  job_title_id: string;
}

export function useJobTitleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [jobTitleForm, setJobTitleForm] = useState({ title: '' });

  const { data: jobTitles = [], isLoading: jobTitlesLoading } = useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
      return listJobTitles();
    }
  });

  const addJobTitleMutation = useMutation({
    mutationFn: async (data: { job_title_id: string }) => {
      return createJobTitle(data.job_title_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-titles'] });
      setJobTitleForm({ title: '' });
      toast({
        title: "Success",
        description: "Job title added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding job title:', error);
      toast({
        title: "Error",
        description: "Failed to add job title",
        variant: "destructive",
      });
    }
  });

  const handleAddJobTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobTitleForm.title.trim()) {
      addJobTitleMutation.mutate({
        job_title_id: jobTitleForm.title.trim()
      });
    }
  };

  return {
    jobTitles,
    jobTitlesLoading,
    jobTitleForm,
    setJobTitleForm,
    addJobTitleMutation,
    handleAddJobTitle
  };
}
