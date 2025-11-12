import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, Download, History, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface JobEditLogProps {
  jobOrderId: string;
  jobOrderNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  changed_at: string;
  changed_by: string;
  action: string;
  changed_fields: Record<string, { old: string; new: string }> | null;
  snapshot: any;
  user_name?: string;
}

export function JobEditLog({ jobOrderId, jobOrderNumber, isOpen, onClose }: JobEditLogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [userFilter, setUserFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["job-order-logs", jobOrderId],
    queryFn: async (): Promise<LogEntry[]> => {
      // Step 1: Fetch logs
      const { data: logsData, error: logsError } = await supabase
        .from("job_order_logs")
        .select("*")
        .eq("job_order_id", jobOrderId)
        .order("changed_at", { ascending: true });

      if (logsError) {
        console.error("Error fetching logs:", logsError);
        throw logsError;
      }

      if (!logsData || logsData.length === 0) {
        return [];
      }

      // Step 2: Get unique user IDs from logs
      const userIds = [...new Set(logsData.map(log => log.changed_by))];

      // Step 3: Fetch user profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue without user names if profiles fetch fails
      }

      // Step 4: Create a map of user_id to full_name
      const userNamesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          userNamesMap.set(profile.id, profile.full_name);
        });
      }

      // Step 5: Combine logs with user names
      return logsData.map(log => ({
        id: log.id,
        changed_at: log.changed_at,
        changed_by: log.changed_by,
        action: log.action,
        changed_fields: log.changed_fields as Record<string, { old: string; new: string }> | null,
        snapshot: log.snapshot,
        user_name: userNamesMap.get(log.changed_by) || "Unknown User"
      }));
    },
    enabled: isOpen
  });

  const uniqueUsers = useMemo(() => {
    const users = new Set(logs.map(log => log.user_name));
    return Array.from(users);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (userFilter !== "all" && log.user_name !== userFilter) return false;
      if (dateFrom && new Date(log.changed_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(log.changed_at) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [logs, userFilter, dateFrom, dateTo]);

  const toggleExpand = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const exportToCSV = () => {
    const headers = ["Timestamp", "User", "Action", "Changes"];
    const rows = filteredLogs.map(log => {
      const changes = log.changed_fields
        ? Object.entries(log.changed_fields)
            .map(([field, values]) => `${field}: ${values.old} → ${values.new}`)
            .join("; ")
        : "Initial creation";
      return [
        format(new Date(log.changed_at), "yyyy-MM-dd HH:mm:ss"),
        log.user_name,
        log.action,
        changes
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-order-${jobOrderNumber}-log.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Log exported successfully"
    });
  };

  const formatFieldName = (field: string) => {
    return field
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleRevert = async (log: LogEntry) => {
    if (!log.snapshot) {
      toast({
        title: "Error",
        description: "No snapshot available for this entry",
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(
      `Revert job order to state from ${format(new Date(log.changed_at), "MMM dd, yyyy HH:mm")}?\n\nThis will overwrite current data with the selected snapshot.`
    );

    if (!confirmed) return;

    try {
      // Remove metadata fields that shouldn't be reverted
      const { id, created_at, updated_at, ...revertData } = log.snapshot;

      // Update job order with snapshot data
      const { error } = await supabase
        .from("job_orders")
        .update(revertData)
        .eq("id", jobOrderId);

      if (error) throw error;

      toast({
        title: "Reverted Successfully",
        description: `Job order restored to state from ${format(new Date(log.changed_at), "MMM dd, yyyy HH:mm")}`
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["job-order-logs", jobOrderId] });
      queryClient.invalidateQueries({ queryKey: ["job-orders"] });

      onClose();
    } catch (error: any) {
      console.error("Revert error:", error);
      toast({
        title: "Revert Failed",
        description: error.message || "Failed to revert job order",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Edit Log - {jobOrderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
            />

            <Input
              type="date"
              placeholder="To"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={filteredLogs.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <ScrollArea className="h-[500px] pr-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No log entries found</div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log, index) => {
                  const isExpanded = expandedEntries.has(log.id);
                  const isCreation = log.action === "created";

                  return (
                    <div
                      key={log.id}
                      className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div
                        className="flex items-start gap-2 cursor-pointer"
                        onClick={() => toggleExpand(log.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground font-mono">
                              {format(new Date(log.changed_at), "MMM dd, yyyy HH:mm")}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {log.user_name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isCreation 
                                ? "bg-green-500/10 text-green-600" 
                                : "bg-blue-500/10 text-blue-600"
                            }`}>
                              {isCreation ? "Created" : "Updated"}
                            </span>
                          </div>

                          {!isExpanded && log.changed_fields && (
                            <div className="text-sm mt-1 text-muted-foreground">
                              {Object.keys(log.changed_fields).length} field(s) changed
                            </div>
                          )}

                          {isExpanded && (
                            <div className="mt-3 space-y-2">
                              {isCreation ? (
                                <div className="text-sm text-muted-foreground">
                                  Job order created
                                </div>
                              ) : (
                                log.changed_fields && (
                                  <div className="space-y-2">
                                    {Object.entries(log.changed_fields).map(([field, values]) => (
                                      <div key={field} className="text-sm border-l-2 border-primary/30 pl-3">
                                        <div className="font-medium text-foreground">
                                          {formatFieldName(field)}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                          <span className="line-through">{values.old || "(empty)"}</span>
                                          <span>→</span>
                                          <span className="text-foreground font-medium">{values.new || "(empty)"}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )
                              )}
                              
                              {log.snapshot && (
                                <>
                                  <details className="mt-2">
                                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                      View full snapshot
                                    </summary>
                                    <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
                                      {JSON.stringify(log.snapshot, null, 2)}
                                    </pre>
                                  </details>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRevert(log);
                                    }}
                                    className="mt-2 text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Revert to this version
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
