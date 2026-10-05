import { supabase } from '@/integrations/supabase/client';

type EdgeFunctionOptions = Parameters<typeof supabase.functions.invoke>[1];

export function invokeEdgeFunction<T = unknown>(
  functionName: string,
  options?: EdgeFunctionOptions,
) {
  return supabase.functions.invoke<T>(functionName, options);
}
