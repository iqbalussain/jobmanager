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

export async function uploadCompanyLogo(
  companyId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${companyId}/logo.${fileExt}`;
  
  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('branch-logos')
    .upload(filePath, file, { upsert: true });
  
  if (uploadError) throw uploadError;
  
  // Get public URL
  const { data } = supabase.storage
    .from('branch-logos')
    .getPublicUrl(filePath);
  
  // Update company record
  const { error: updateError } = await supabase
    .from('companies')
    .update({ letterhead_url: data.publicUrl })
    .eq('id', companyId);
  
  if (updateError) throw updateError;
  
  return data.publicUrl;
}
