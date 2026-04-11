import { useState, useEffect } from "react";
import { AlertTriangle, X, ChevronRight } from "lucide-react";
import { Job } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { useGamingMode } from "@/App";
import { cn } from "@/lib/utils";

interface HighPriorityReminderProps {
  jobs: Job[];
  onViewJob?: (job: Job) => void;
}

export function HighPriorityReminder({ jobs, onViewJob }: HighPriorityReminderProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isFlashing, setIsFlashing] = useState(true);
  const { gamingMode } = useGamingMode();
  const g = gamingMode;

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
    const interval = setInterval(() => setIsFlashing(prev => !prev), 1000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed || highPriorityJobs.length === 0) return null;

  const hasOverdue = overdueJobs.length > 0;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300",
      g ? cn(
        "bg-gray-900/80 backdrop-blur-xl",
        hasOverdue
          ? isFlashing
            ? "border-red-400/60 shadow-[0_0_30px_rgba(248,113,113,0.3)]"
            : "border-red-500/80 shadow-[0_0_40px_rgba(248,113,113,0.5)]"
          : "border-orange-400/40 shadow-[0_0_20px_rgba(251,146,60,0.2)]"
      ) : cn(
        hasOverdue
          ? isFlashing 
            ? "bg-red-50 border-red-500 shadow-lg shadow-red-200" 
            : "bg-red-100 border-red-600 shadow-xl shadow-red-300"
          : "bg-orange-50 border-orange-400"
      )
    )}>
      {/* Background effect */}
      {hasOverdue && (
        <div className={cn(
          "absolute inset-0 animate-pulse",
          g ? "bg-gradient-to-r from-red-500/5 to-orange-500/5" : "bg-gradient-to-r from-red-500/10 to-orange-500/10"
        )} />
      )}
      {g && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(248,113,113,0.03) 2px, rgba(248,113,113,0.03) 4px)'
        }} />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-full",
            g
              ? hasOverdue ? "bg-red-500/20 border border-red-400/50" : "bg-orange-500/20 border border-orange-400/50"
              : hasOverdue ? "bg-red-500" : "bg-orange-500",
            isFlashing && "animate-bounce"
          )}>
            <AlertTriangle className={cn(
              "w-5 h-5",
              g
                ? hasOverdue ? "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" : "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]"
                : "text-white"
            )} />
          </div>
          
          <div className="flex-1">
            <h3 className={cn(
              "font-bold text-lg",
              g
                ? hasOverdue ? "text-red-400 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]" : "text-orange-400 font-mono tracking-wider"
                : hasOverdue ? "text-red-800" : "text-orange-800"
            )}>
              {g
                ? hasOverdue
                  ? `⚠ ${overdueJobs.length} OVERDUE CRITICAL MISSION${overdueJobs.length > 1 ? 'S' : ''}`
                  : `📋 ${highPriorityJobs.length} HIGH PRIORITY MISSION${highPriorityJobs.length > 1 ? 'S' : ''}`
                : hasOverdue 
                  ? `⚠️ ${overdueJobs.length} Overdue High Priority Job${overdueJobs.length > 1 ? 's' : ''}!`
                  : `📋 ${highPriorityJobs.length} High Priority Job${highPriorityJobs.length > 1 ? 's' : ''} Pending`
              }
            </h3>
            
            <p className={cn(
              "text-sm mt-1",
              g
                ? hasOverdue ? "text-red-400/70 font-mono" : "text-orange-400/70 font-mono"
                : hasOverdue ? "text-red-700" : "text-orange-700"
            )}>
              {g
                ? hasOverdue ? "DEADLINE BREACH DETECTED // IMMEDIATE ACTION REQUIRED" : "REVIEW AND PRIORITIZE FOR MISSION SUCCESS"
                : hasOverdue ? "These jobs are past their due date and need immediate action!" : "Review and prioritize these jobs to ensure timely delivery."
              }
            </p>

            <div className="mt-3 space-y-1">
              {highPriorityJobs.slice(0, 3).map(job => (
                <button
                  key={job.id}
                  onClick={() => onViewJob?.(job)}
                  className={cn(
                    "flex items-center gap-2 text-sm w-full text-left p-2 rounded-lg transition-all duration-200",
                    g
                      ? hasOverdue
                        ? "hover:bg-red-400/10 text-red-300 border border-transparent hover:border-red-400/30"
                        : "hover:bg-orange-400/10 text-orange-300 border border-transparent hover:border-orange-400/30"
                      : hasOverdue
                        ? "hover:bg-red-200/50 text-red-800"
                        : "hover:bg-orange-200/50 text-orange-800"
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                  <span className={cn("font-medium", g && "font-mono")}>{job.jobOrderNumber}</span>
                  <span className={cn("text-xs opacity-75", g && "font-mono")}>- {job.customer}</span>
                  {new Date(job.dueDate) < new Date() && (
                    <span className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded-full",
                      g
                        ? "bg-red-500/20 text-red-400 border border-red-400/50 shadow-[0_0_8px_rgba(248,113,113,0.4)] animate-pulse"
                        : "bg-red-500 text-white"
                    )}>
                      OVERDUE
                    </span>
                  )}
                </button>
              ))}
              {highPriorityJobs.length > 3 && (
                <p className={cn("text-xs pl-6", g ? (hasOverdue ? "text-red-400/60 font-mono" : "text-orange-400/60 font-mono") : (hasOverdue ? "text-red-600" : "text-orange-600"))}>
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
          className={cn("shrink-0", g ? (hasOverdue ? "hover:bg-red-400/20 text-red-400" : "hover:bg-orange-400/20 text-orange-400") : (hasOverdue ? "hover:bg-red-200" : "hover:bg-orange-200"))}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
