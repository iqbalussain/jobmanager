import { BarChart3, CheckCircle, Home, Plus, Receipt, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenPalette: () => void;
  onQuickInvoice: () => void;
  canSeeReports: boolean;
}

export function FloatingDock({ currentView, onNavigate, onOpenPalette, onQuickInvoice, canSeeReports }: Props) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "approved-jobs", label: "Approved jobs", icon: CheckCircle },
    ...(canSeeReports ? [{ id: "reports", label: "Reports", icon: BarChart3 }] : []),
  ];
  const btn = "flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:bg-muted hover:text-foreground";

  return (
    <TooltipProvider delayDuration={150}>
      <nav aria-label="Quick dock" className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-1.5 shadow-2xl backdrop-blur-xl">
        {items.map(({ id, label, icon: Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button type="button" aria-label={label} onClick={() => onNavigate(id)} className={cn(btn, currentView === id && "bg-primary/10 text-primary")}>
                <Icon className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
        <div className="mx-1 h-6 w-px bg-border" />
        <button type="button" onClick={onOpenPalette} className="flex h-11 items-center gap-2 rounded-full bg-muted px-4 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Search className="h-4 w-4" /> Search or command
          <kbd className="rounded border bg-background px-1.5 font-mono text-[10px]">⌘K</kbd>
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Update invoice" onClick={onQuickInvoice} className={btn}><Receipt className="h-5 w-5" /></button>
          </TooltipTrigger>
          <TooltipContent>Update invoice no. & value</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label="New job order" onClick={() => onNavigate("create")} className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:-translate-y-1 hover:scale-110">
              <Plus className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>New job order</TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  );
}
