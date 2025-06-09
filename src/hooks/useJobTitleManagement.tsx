
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      console.log('Fetching job titles...');
      const { data, error } = await supabase
        .from('job_titles')
        .select('id, job_title_id')
        .order('job_title_id');
      
      if (error) {
        console.error('Error fetching job titles:', error);
        return [];
      }
      console.log('Job titles fetched:', data);
      return data as JobTitle[];
    }
  });

  const addJobTitleMutation = useMutation({
    mutationFn: async (data: { job_title_id: string }) => {
      console.log('Adding job title:', data.job_title_id);
      const { data: result, error } = await supabase
        .from('job_titles')
        .insert({ job_title_id: data.job_title_id })
        .select()
        .single();

      if (error) {
        console.error('Error adding job title:', error);
        throw error;
      }
      return result;
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

  return {
    jobTitles,
    jobTitlesLoading,
    jobTitleForm,
    setJobTitleForm,
    addJobTitleMutation
  };
}
