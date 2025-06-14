
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useJobDropdownData(isEditMode: boolean, job: any) {
  const [customers, setCustomers] = useState<Array<{id: string, name: string}>>([]);
  const [designers, setDesigners] = useState<Array<{id: string, name: string}>>([]);
  const [salesmen, setSalesmen] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    if (isEditMode && job) {
      fetchDropdownData();
    }
    // eslint-disable-next-line
  }, [isEditMode, job]);

  const fetchDropdownData = async () => {
    try {
      const [customersRes, designersRes, salesmenRes] = await Promise.all([
        supabase.from('customers').select('id, name'),
        supabase.from('profiles').select('id, full_name').eq('role', 'designer'),
        supabase.from('profiles').select('id, full_name').eq('role', 'salesman')
      ]);

      if (customersRes.data) setCustomers(customersRes.data);
      if (designersRes.data) {
        setDesigners(designersRes.data.map(d => ({ id: d.id, name: d.full_name || 'Unknown Designer' })));
      }
      if (salesmenRes.data) {
        setSalesmen(salesmenRes.data.map(s => ({ id: s.id, name: s.full_name || 'Unknown Salesman' })));
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  return { customers, designers, salesmen };
}
