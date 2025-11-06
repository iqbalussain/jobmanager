import { supabase } from "@/integrations/supabase/client";

export interface Company {
  id: string;
  name: string;
  letterhead_url?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export async function searchCompanies(query: string): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(20);
  
  if (error) throw error;
  return data || [];
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}
