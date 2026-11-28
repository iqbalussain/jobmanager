import { useState } from "react";
import { Play, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import launchVideo from "@/assets/videos/jobflow-launch.mp4.asset.json";
import launchPoster from "@/assets/videos/jobflow-launch-poster.asset.json";
import payrollVideo from "@/assets/videos/payrollsheet-intro.mp4.asset.json";
import payrollPoster from "@/assets/videos/payrollsheet-poster.asset.json";

const promotions = [
  { name: "JobFlow", subtitle: "Job Portal 2.0", video: launchVideo.url, poster: launchPoster.url },
  { name: "PayrollSheet", subtitle: "Introduction", video: payrollVideo.url, poster: payrollPoster.url },
];

/** Promotional media is separate from job data and only loads when opened. */
export function LaunchPromotions() {
  const [selected, setSelected] = useState<(typeof promotions)[number] | null>(null);
  return (
    <aside aria-label="Launch videos" className="launch-promotion rounded-lg border p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium"><Megaphone className="h-3.5 w-3.5" />Featured launches</span>
        <span className="text-[10px] opacity-75">Advertising</span>
      </div>
      <h2 className="text-lg font-semibold leading-snug">Smart Business.<br />Better Results.</h2>
      {promotions.map((promotion) => <div key={promotion.name} className="mt-3 border-t border-primary-foreground/20 pt-3">
        <div className="grid grid-cols-[5rem_1fr] items-center gap-3">
          <img src={promotion.poster} alt={`${promotion.name} video preview`} className="aspect-video w-full rounded-md object-cover" loading="lazy" />
          <div className="min-w-0"><p className="text-sm font-semibold">{promotion.name}</p><p className="text-xs opacity-80">{promotion.subtitle}</p></div>
        </div>
        <Button variant="secondary" size="sm" className="mt-2 w-full gap-2" onClick={() => setSelected(promotion)}><Play className="h-3.5 w-3.5" />Watch {promotion.name} video</Button>
      </div>)}
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{selected?.name} launch</DialogTitle></DialogHeader>
          {selected && <video key={selected.name} aria-label={`${selected.name} launch video`} src={selected.video} poster={selected.poster} controls autoPlay playsInline preload="metadata" className="aspect-video w-full rounded-lg bg-muted" />}
          {selected?.name === "JobFlow" && <p className="text-xs text-muted-foreground">Launch film includes illustrative dashboard scenes.</p>}
        </DialogContent>
      </Dialog>
    </aside>
  );
}