import { useEffect, useState } from "react";
import { BarChart3, CheckCircle, Home, Menu, Plus, Receipt, Search, Settings, Shield, UserCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  const btn = "h-11 w-11 shrink-0 rounded-full p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <TooltipProvider delayDuration={150}>
      <nav aria-label="Main menu" className="floating-dock fixed left-1/2 z-40 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-0 rounded-full border border-border/60 bg-background/95 px-1 py-1.5 shadow-lg backdrop-blur-xl sm:gap-1 sm:px-2">
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="All menu items" className={cn(btn, "text-primary")}><Menu className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" sideOffset={12} className="max-h-[60dvh] w-60 overflow-y-auto">
              {items.map(({ id, label, icon: Icon }) => <DropdownMenuItem key={id} onSelect={() => onNavigate(id)} className={cn("min-h-11 gap-3", currentView === id && "bg-primary/10 text-primary")}><Icon className="h-4 w-4" />{label}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="hidden items-center gap-1 lg:flex">
        {items.map(({ id, label, icon: Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" type="button" aria-label={label} aria-current={currentView === id ? "page" : undefined} onClick={() => onNavigate(id)} className={cn(btn, currentView === id && "bg-primary/10 text-primary")}>
                <Icon className="h-[18px] w-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
        </div>
        <div className="mx-1 hidden h-6 w-px shrink-0 bg-border lg:block" />
        <Button variant="ghost" type="button" onClick={onOpenPalette} aria-label="Search or command" className="flex h-11 w-11 shrink-0 items-center gap-2 rounded-full p-0 text-sm text-muted-foreground hover:text-foreground lg:w-auto lg:bg-muted lg:px-3">
          <Search className="h-4 w-4" /><span className="hidden lg:inline">Search</span>
          <kbd className="hidden rounded border bg-background px-1.5 font-mono text-[10px] lg:inline">⌘K</kbd>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" type="button" aria-label="Update invoice" onClick={onQuickInvoice} className={btn}><Receipt className="h-[18px] w-[18px]" /></Button>
          </TooltipTrigger>
          <TooltipContent>Update invoice no. & value</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" type="button" aria-label="New job order" onClick={() => onNavigate("create")} className="h-11 w-11 shrink-0 rounded-full">
              <Plus className="h-5 w-5" />
            </Button>
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
