import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { JobFlowMark } from "@/components/brand/JobFlowMark";

const today = () => new Date().toLocaleDateString("en-CA");

/** Once-per-day greeting from Amity Node, tracked per user in localStorage. */
export function DailyWelcomeModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const key = user ? `welcome-shown-${user.id}` : null;

  useEffect(() => {
    if (key && localStorage.getItem(key) !== today()) setOpen(true);
  }, [key]);

  if (!open || !key) return null;
  const close = () => { localStorage.setItem(key, today()); setOpen(false); };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="welcome-title" className="fixed inset-0 z-[90] flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm" onClick={close}>
      <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={close} aria-label="Close" className="absolute end-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto mb-3 flex justify-center"><JobFlowMark /></div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Amity Node</p>
        <h2 id="welcome-title" className="mt-1 text-2xl font-semibold">Job Portal 2.0</h2>
        <p className="text-xs text-muted-foreground">by Seyed Ussain</p>
        <p className="mt-4 text-sm">{greeting}! Wishing you a great and productive day ahead.</p>
      </div>
    </div>
  );
}
