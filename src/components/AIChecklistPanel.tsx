import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/dexieDb';
import { 
  syncTodayChecklist, 
  markChecklistItemDone, 
  runManualAnalysis,
  DailyChecklist,
  ChecklistItem 
} from '@/services/aiSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AIChecklistPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Get today's checklist from Dexie (reactive)
  const cachedChecklist = useLiveQuery(
    () => db.table('dailyChecklists').where('date').equals(today).first(),
    [today]
  );

  // Sync on mount
  useEffect(() => {
    const sync = async () => {
      setIsLoading(true);
      await syncTodayChecklist();
      setIsLoading(false);
    };
    sync();
  }, []);

  const handleItemToggle = useCallback(async (itemId: string, done: boolean) => {
    if (!cachedChecklist?.id) return;
    
    const success = await markChecklistItemDone(cachedChecklist.id, itemId, done);
    if (!success) {
      toast.error('Failed to update item');
    }
  }, [cachedChecklist?.id]);

  const handleRunAnalysis = async () => {
    setIsRunning(true);
    try {
      const result = await runManualAnalysis();
      if (result) {
        toast.success('AI analysis complete!');
      } else {
        toast.info('No checklist generated');
      }
    } catch (error) {
      toast.error('Failed to run analysis');
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const checklist = cachedChecklist as DailyChecklist | undefined;
  const items = checklist?.items;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Daily Checklist</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {format(new Date(), 'MMM d, yyyy')}
            </Badge>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleRunAnalysis}
              disabled={isRunning}
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {!items ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              No AI analysis available for today
            </p>
            <Button onClick={handleRunAnalysis} disabled={isRunning} size="sm">
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-3">
            <div className="space-y-4">
              {/* Checklist Items */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Today's Tasks
                </h4>
                <div className="space-y-2">
                  {items.checklist.map((item: ChecklistItem) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-2 rounded-md border transition-colors ${
                        item.done ? 'bg-muted/50 border-muted' : 'bg-background border-border'
                      }`}
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.done || false}
                        onCheckedChange={(checked) => 
                          handleItemToggle(item.id, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={item.id}
                        className={`text-sm flex-1 cursor-pointer ${
                          item.done ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {item.text}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stuck Jobs */}
              {items.stuck_jobs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Stuck Jobs
                  </h4>
                  <div className="space-y-1.5">
                    {items.stuck_jobs.slice(0, 5).map((job, idx) => (
                      <div key={idx} className="text-xs p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                        <span className="text-amber-700 dark:text-amber-400">{job.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issue Clusters */}
              {items.clusters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Issue Clusters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {items.clusters.map((cluster, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cluster.name}: {cluster.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients Needing Follow-up */}
              {items.clients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Client Follow-ups
                  </h4>
                  <div className="space-y-1.5">
                    {items.clients.slice(0, 5).map((client, idx) => (
                      <div key={idx} className="text-xs p-2 bg-muted rounded">
                        <span className="font-medium">{client.client_name}:</span>{' '}
                        <span className="text-muted-foreground">{client.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
