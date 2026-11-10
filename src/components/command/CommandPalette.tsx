import { useEffect } from "react";
import type { Job } from "@/pages/Index";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { statusLabel } from "@/lib/status";
import { BarChart3, CheckCircle, Home, Plus, Receipt, Settings, Shield } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: Job[];
  onNavigate: (view: string) => void;
  onOpenJob: (job: Job) => void;
  onQuickInvoice: (job?: Job) => void;
}

export function CommandPalette({ open, onOpenChange, jobs, onNavigate, onOpenJob, onQuickInvoice }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const run = (fn: () => void) => { onOpenChange(false); fn(); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search job numbers, customers, or type a command…" />
      <CommandList>
        <CommandEmpty>Nothing found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => onNavigate("create"))}><Plus className="mr-2 h-4 w-4" />New job order</CommandItem>
          <CommandItem onSelect={() => run(() => onQuickInvoice())}><Receipt className="mr-2 h-4 w-4" />Update invoice no. & value</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Go to">
          <CommandItem onSelect={() => run(() => onNavigate("dashboard"))}><Home className="mr-2 h-4 w-4" />Dashboard</CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("approved-jobs"))}><CheckCircle className="mr-2 h-4 w-4" />Approved jobs</CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("reports"))}><BarChart3 className="mr-2 h-4 w-4" />Reports</CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("admin"))}><Shield className="mr-2 h-4 w-4" />Job management</CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("settings"))}><Settings className="mr-2 h-4 w-4" />Settings</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Job orders">
          {jobs.slice(0, 200).map((j) => (
            <CommandItem key={j.id} value={`${j.jobOrderNumber} ${j.customer} ${j.title}`} onSelect={() => run(() => onOpenJob(j))}>
              <span className="font-mono">{j.jobOrderNumber}</span>
              <span className="ml-2 truncate text-muted-foreground">{j.customer} · {j.title}</span>
              <button
                type="button"
                className="ml-auto rounded border px-1.5 text-xs text-muted-foreground hover:bg-muted"
                onClick={(e) => { e.stopPropagation(); run(() => onQuickInvoice(j)); }}
              >Invoice</button>
              <span className="ml-2 text-xs text-muted-foreground">{statusLabel(j.status)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
