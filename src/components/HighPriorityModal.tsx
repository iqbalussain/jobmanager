import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Clock, Bell, BellOff, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";

export function HighPriorityModal() {
  const { 
    notifications, 
    showHighPriorityModal, 
    closeModal, 
    acknowledgeAll, 
    snoozeAll 
  } = useNotifications();
  
  if (!showHighPriorityModal || notifications.length === 0) {
    return null;
  }
  
  return (
    <Dialog open={showHighPriorityModal} onOpenChange={closeModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-full animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl text-red-700">
                High Priority Alert
              </DialogTitle>
              <DialogDescription>
                {notifications.length} job{notifications.length > 1 ? "s" : ""} require{notifications.length === 1 ? "s" : ""} immediate attention
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-3">
            {notifications.map((notif) => {
              const payload = notif.payload as { 
                job_order_number?: string; 
                due_date?: string; 
                customer_name?: string;
              };
              
              return (
                <div 
                  key={notif.id}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">
                          HIGH PRIORITY
                        </Badge>
                        <span className="font-semibold text-gray-900">
                          #{payload.job_order_number}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        {payload.customer_name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          Due: {payload.due_date ? format(new Date(payload.due_date), "MMM d, yyyy") : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={snoozeAll}
            className="flex items-center gap-2"
          >
            <BellOff className="w-4 h-4" />
            Snooze 6 Hours
          </Button>
          <Button
            onClick={acknowledgeAll}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4" />
            Acknowledge All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
