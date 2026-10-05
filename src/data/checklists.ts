import { supabase } from '@/integrations/supabase/client';
import type { TablesUpdate } from '@/integrations/supabase/types';

export async function getChecklistForDate(date: string) {
  const { data, error } = await supabase
    .from('daily_checklists')
    .select('id, date, items, created_at')
    .eq('date', date)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getChecklistItems(id: string) {
  const { data, error } = await supabase
    .from('daily_checklists')
    .select('items')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data.items;
}

export async function updateChecklistItems(
  id: string,
  items: TablesUpdate<'daily_checklists'>['items'],
): Promise<void> {
  const { error } = await supabase
    .from('daily_checklists')
    .update({ items })
    .eq('id', id);

  if (error) throw error;
}

export async function listChecklistsSince(date: string) {
  const pageSize = 500;
  const records: Array<{
    id: string;
    date: string;
    items: unknown;
    created_at: string;
  }> = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from('daily_checklists')
      .select('id, date, items, created_at')
      .gte('date', date)
      .order('date', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;
    records.push(
      ...data.map((record) => ({
        ...record,
        created_at: record.created_at ?? `${record.date}T00:00:00.000Z`,
      })),
    );
    if (data.length < pageSize) break;
  }

  return records;
}
