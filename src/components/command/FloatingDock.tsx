import { useEffect, useState } from "react";
import { BarChart3, CheckCircle, Home, Plus, Receipt, Search, Settings, Shield, UserCheck, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { getProfileHeader } from "@/data/profiles";
import { UserProfileDropdown } from "@/components/user-profile/UserProfileDropdown";
import { NotificationTray } from "@/components/NotificationTray";

interface Props {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenPalette: () => void;
  onQuickInvoice: () => void;
  userRole: string;
}

export function FloatingDock({ currentView, onNavigate, onOpenPalette, onQuickInvoice, userRole }: Props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fallback = { full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User", role: "employee" };
    getProfileHeader(user.id).then((d) => setProfile(d || fallback)).catch(() => setProfile(fallback));
  }, [user?.id, user?.email, user?.user_metadata?.full_name]);

  const all = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "approved-jobs", label: "Approved jobs", icon: CheckCircle },
    { id: "admin", label: "Job administration", icon: Shield, roles: ["admin", "manager"] },
    { id: "reports", label: "Reports & analytics", icon: BarChart3, roles: ["admin", "manager", "salesman"] },
    { id: "admin-management", label: "User management", icon: UsersRound, roles: ["admin", "manager"] },
    { id: "user-access", label: "User access control", icon: UserCheck, roles: ["admin"] },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  const items = all.filter((i) => !i.roles || i.roles.includes(userRole));
  const btn = "flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:bg-muted hover:text-foreground";

  return (
    <TooltipProvider delayDuration={150}>
      <nav aria-label="Main menu" className="fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-border/60 bg-background/75 px-2 py-1.5 shadow-2xl backdrop-blur-xl">
        {items.map(({ id, label, icon: Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button type="button" aria-label={label} aria-current={currentView === id ? "page" : undefined} onClick={() => onNavigate(id)} className={cn(btn, "shrink-0", currentView === id && "bg-primary/10 text-primary")}>
                <Icon className="h-[18px] w-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
        <div className="mx-1 h-6 w-px shrink-0 bg-border" />
        <button type="button" onClick={onOpenPalette} aria-label="Search or command" className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-muted px-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Search className="h-4 w-4" /><span className="hidden lg:inline">Search</span>
          <kbd className="hidden rounded border bg-background px-1.5 font-mono text-[10px] lg:inline">⌘K</kbd>
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Update invoice" onClick={onQuickInvoice} className={cn(btn, "shrink-0")}><Receipt className="h-[18px] w-[18px]" /></button>
          </TooltipTrigger>
          <TooltipContent>Update invoice no. & value</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label="New job order" onClick={() => onNavigate("create")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:-translate-y-1 hover:scale-110">
              <Plus className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>New job order</TooltipContent>
        </Tooltip>
        <div className="mx-1 h-6 w-px shrink-0 bg-border" />
        <div className="shrink-0"><NotificationTray /></div>
        <div className="shrink-0"><UserProfileDropdown userProfile={profile} /></div>
      </nav>
    </TooltipProvider>
  );
}
