import { useState, useEffect } from "react";
import { AlertTriangle, X, ChevronRight } from "lucide-react";
import { Job } from "@/pages/Index";
import { Button } from "@/components/ui/button";

interface HighPriorityReminderProps {
  jobs: Job[];
  onViewJob?: (job: Job) => void;
}

export function HighPriorityReminder({ jobs, onViewJob }: HighPriorityReminderProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isFlashing, setIsFlashing] = useState(true);

  const highPriorityJobs = jobs.filter(
    job => job.priority === "high" && 
           job.status !== "completed" && 
           job.status !== "invoiced" && 
           job.status !== "cancelled"
  );

  const overdueJobs = highPriorityJobs.filter(job => {
    const dueDate = new Date(job.dueDate);
    return dueDate < new Date();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlashing(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed || highPriorityJobs.length === 0) {
    return null;
  }

  const hasOverdue = overdueJobs.length > 0;

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 ${
        hasOverdue
          ? isFlashing 
            ? "bg-red-50 border-red-500 shadow-lg shadow-red-200" 
            : "bg-red-100 border-red-600 shadow-xl shadow-red-300"
          : "bg-orange-50 border-orange-400"
      }`}
    >
      {/* Animated background pulse */}
      {hasOverdue && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 animate-pulse" />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${hasOverdue ? "bg-red-500" : "bg-orange-500"} ${isFlashing ? "animate-bounce" : ""}`}>
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${hasOverdue ? "text-red-800" : "text-orange-800"}`}>
              {hasOverdue 
                ? `⚠️ ${overdueJobs.length} Overdue High Priority Job${overdueJobs.length > 1 ? 's' : ''}!`
                : `📋 ${highPriorityJobs.length} High Priority Job${highPriorityJobs.length > 1 ? 's' : ''} Pending`
              }
            </h3>
            
            <p className={`text-sm mt-1 ${hasOverdue ? "text-red-700" : "text-orange-700"}`}>
              {hasOverdue 
                ? "These jobs are past their due date and need immediate action!"
                : "Review and prioritize these jobs to ensure timely delivery."
              }
            </p>

            {/* Quick list of jobs */}
            <div className="mt-3 space-y-1">
              {highPriorityJobs.slice(0, 3).map(job => (
                <button
                  key={job.id}
                  onClick={() => onViewJob?.(job)}
                  className={`flex items-center gap-2 text-sm w-full text-left p-2 rounded-lg transition-colors ${
                    hasOverdue
                      ? "hover:bg-red-200/50 text-red-800"
                      : "hover:bg-orange-200/50 text-orange-800"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                  <span className="font-medium">{job.jobOrderNumber}</span>
                  <span className="text-xs opacity-75">- {job.customer}</span>
                  {new Date(job.dueDate) < new Date() && (
                    <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                      OVERDUE
                    </span>
                  )}
                </button>
              ))}
              {highPriorityJobs.length > 3 && (
                <p className={`text-xs pl-6 ${hasOverdue ? "text-red-600" : "text-orange-600"}`}>
                  +{highPriorityJobs.length - 3} more...
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          className={`shrink-0 ${hasOverdue ? "hover:bg-red-200" : "hover:bg-orange-200"}`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
