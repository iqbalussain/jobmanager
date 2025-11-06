import { supabase } from "@/integrations/supabase/client";

export interface JobTitle {
  id: string;
  job_title_id: string;
}

export async function searchJobTitles(query: string): Promise<JobTitle[]> {
  const { data, error } = await supabase
    .from('job_titles')
    .select('id, job_title_id')
    .ilike('job_title_id', `%${query}%`)
    .order('job_title_id')
    .limit(20);
  
  if (error) throw error;
  return data || [];
}

export async function createJobTitle(title: string): Promise<JobTitle> {
  const { data, error } = await supabase
    .from('job_titles')
    .insert({ job_title_id: title.trim() })
    .select('id, job_title_id')
    .single();
  
  if (error) throw error;
  return data;
}
