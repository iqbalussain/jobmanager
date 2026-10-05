/**
 * AI Sync Service - Handles daily checklist sync with Dexie
 * 
 * SECURITY: GEMINI_API_KEY is only used server-side in edge functions.
 * Never expose to client.
 */

import { db } from '@/lib/dexieDb';
import { invokeEdgeFunction } from '@/data/functions';
import {
  getChecklistForDate,
  getChecklistItems,
  listChecklistsSince,
  updateChecklistItems,
} from '@/data/checklists';

export interface ChecklistItem {
  id: string;
  text: string;
  actionable: boolean;
  done?: boolean;
}

export interface DailyChecklist {
  id: string;
  date: string;
  items: {
    stuck_jobs: Array<{ job_id: string; reason: string }>;
    clusters: Array<{ name: string; count: number }>;
    checklist: ChecklistItem[];
    clients: Array<{ client_name: string; note: string }>;
  };
  created_at: string;
}

// Sync today's checklist from server to Dexie
export async function syncTodayChecklist(): Promise<DailyChecklist | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const data = await getChecklistForDate(today);
    if (!data) return null;

    const checklist: DailyChecklist = {
      id: data.id,
      date: data.date,
      items: data.items as unknown as DailyChecklist['items'],
      created_at: data.created_at ?? `${data.date}T00:00:00.000Z`,
    };

    // Store in Dexie
    await db.table('dailyChecklists').put(checklist);
    return checklist;
  } catch (error) {
    console.error('[AISync] Error syncing today checklist:', error);
    return null;
  }
}

// Get today's checklist from Dexie (offline-first)
export async function getTodayChecklistFromCache(): Promise<DailyChecklist | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const cached = await db.table('dailyChecklists').where('date').equals(today).first();
    return cached || null;
  } catch (error) {
    console.error('[AISync] Error getting cached checklist:', error);
    return null;
  }
}

// Mark checklist item as done (optimistic update)
export async function markChecklistItemDone(
  checklistId: string,
  itemId: string,
  done: boolean
): Promise<boolean> {
  try {
    // Get current checklist from Dexie first
    const cached = await db.table('dailyChecklists').get(checklistId);
    
    if (cached) {
      // Update Dexie immediately (optimistic)
      const updatedItems = {
        ...cached.items,
        checklist: cached.items.checklist.map((item: ChecklistItem) =>
          item.id === itemId ? { ...item, done } : item
        ),
      };
      
      await db.table('dailyChecklists').update(checklistId, { items: updatedItems });
    }
    
    // Sync to server
    const serverItems = await getChecklistItems(checklistId) as unknown as DailyChecklist['items'];
    const updatedChecklist = serverItems.checklist.map((item: ChecklistItem) =>
      item.id === itemId ? { ...item, done } : item
    );
    
    await updateChecklistItems(
      checklistId,
      JSON.parse(JSON.stringify({ ...serverItems, checklist: updatedChecklist })),
    );
    
    return true;
  } catch (error) {
    console.error('[AISync] Error marking item done:', error);
    return false;
  }
}

// Trigger manual analysis run
export async function runManualAnalysis(): Promise<DailyChecklist | null> {
  try {
    const { data, error } = await invokeEdgeFunction<{ checklist?: DailyChecklist }>('daily-gemini-analyze');
    
    if (error) throw error;
    
    if (data?.checklist) {
      // Update Dexie cache
      await db.table('dailyChecklists').put({
        id: data.checklist.id,
        date: data.checklist.date,
        items: data.checklist.items,
        created_at: data.checklist.created_at,
      });
      
      return data.checklist as DailyChecklist;
    }
    
    return null;
  } catch (error) {
    console.error('[AISync] Error running manual analysis:', error);
    throw error;
  }
}

// Get recent checklists for history view
export async function getRecentChecklists(days: number = 7): Promise<DailyChecklist[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const data = await listChecklistsSince(startDate.toISOString().split('T')[0]);
    
    return (data || []).map(d => ({
      id: d.id,
      date: d.date,
      items: d.items as unknown as DailyChecklist['items'],
      created_at: d.created_at,
    })) as DailyChecklist[];
  } catch (error) {
    console.error('[AISync] Error fetching recent checklists:', error);
    return [];
  }
}
