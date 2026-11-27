import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { visibleNav } from "@/components/shell/navItems";

interface Props {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: string;
  /** Views that currently have a tab open: shown as a small dot. */
  openViews?: Set<string>;
}

/** Compact primary-navigation dock. Neutral glass, tooltips for labels, a bar under the current page. */
export function FloatingDock({ currentView, onNavigate, userRole, openViews }: Props) {
  const items = visibleNav(userRole);
  const [shown, setShown] = useState(true);
  const navRef = useRef<HTMLElement>(null);

  // Auto-hide: shows when the pointer nears the bottom edge, hides a moment after it leaves.
  // Touch screens and keyboard focus keep it visible.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let timer: number | undefined;
    const hideSoon = () => { window.clearTimeout(timer); timer = window.setTimeout(() => {
      if (!navRef.current?.matches(":hover, :focus-within")) setShown(false);
    }, 1200); };
    const onMove = (e: PointerEvent) => {
      if (window.innerHeight - e.clientY < 96) { window.clearTimeout(timer); setShown(true); } else hideSoon();
    };
    hideSoon();
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.clearTimeout(timer); window.removeEventListener("pointermove", onMove); };
  }, []);

  return (
    <TooltipProvider delayDuration={120}>
      <nav
        ref={navRef}
        aria-label="Main menu"
        data-shown={shown}
        onFocus={() => setShown(true)}
        className="floating-dock glass fixed inset-x-0 z-40 mx-auto flex w-fit max-w-[calc(100vw-1rem)] items-center gap-1 overflow-x-auto rounded-2xl p-1.5 transition-[transform,opacity] duration-300 ease-out data-[shown=false]:pointer-events-none data-[shown=false]:translate-y-[calc(100%+1.5rem)] data-[shown=false]:opacity-0 motion-reduce:transition-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(({ id, label, icon: Icon }) => {
          const current = currentView === id;
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  data-dock-item
                  aria-label={label}
                  aria-current={current ? "page" : undefined}
                  onClick={() => onNavigate(id)}
                  className={cn(
                    "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground outline-none transition-[background-color,color,transform] duration-150 hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                    current && "bg-primary/10 text-primary hover:bg-primary/15",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                  {current && <span aria-hidden className="absolute inset-x-2.5 bottom-0.5 h-0.5 rounded-full bg-primary" />}
                  {!current && openViews?.has(id) && <span aria-hidden className="absolute bottom-0.5 h-1 w-1 rounded-full bg-muted-foreground/70" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={10}>{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
