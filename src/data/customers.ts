import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  name: string;
}

export async function listCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getCustomerName(id: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('name')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data?.name ?? null;
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(20);
  
  if (error) throw error;
  return data || [];
}

export async function createCustomer(name: string): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert({ name: name.trim() })
    .select('id, name')
    .single();
  
  if (error) throw error;
  return data;
}
