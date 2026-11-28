import { useRef, useState } from "react";
import { Megaphone } from "lucide-react";
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

/** Muted looping previews stay mounted while the enlarged player is open. */
export function LaunchPromotions() {
  const [selected, setSelected] = useState<(typeof promotions)[number] | null>(null);
  const previews = useRef<Record<string, HTMLVideoElement | null>>({});
  const trigger = useRef<HTMLButtonElement | null>(null);
  return (
    <aside aria-label="Launch videos" className="launch-promotion rounded-lg border p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium"><Megaphone className="h-3.5 w-3.5" />Featured launches</span>
        <span className="text-[10px] opacity-75">Advertising</span>
      </div>
      <h2 className="text-lg font-semibold leading-snug">Smart Business.<br />Better Results.</h2>
      {promotions.map((promotion) => <div key={promotion.name} className="mt-3 border-t border-primary-foreground/20 pt-3">
        <Button variant="ghost" className="h-auto w-full overflow-hidden rounded-md p-0 hover:bg-transparent focus-visible:ring-primary-foreground" aria-label={`Enlarge ${promotion.name} video`} onClick={(event) => { trigger.current = event.currentTarget; setSelected(promotion); }}>
          <video ref={(video) => { previews.current[promotion.name] = video; }} aria-label={`${promotion.name} preview`} src={promotion.video} poster={promotion.poster} autoPlay muted loop playsInline preload="auto" disablePictureInPicture className="pointer-events-none aspect-video w-full object-contain bg-muted" />
        </Button>
        <div className="mt-1.5 flex items-baseline justify-between gap-2"><p className="text-sm font-semibold">{promotion.name}</p><p className="text-xs opacity-80">{promotion.subtitle}</p></div>
      </div>)}
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-4xl" aria-describedby={undefined} onCloseAutoFocus={(event) => { event.preventDefault(); trigger.current?.focus({ preventScroll: true }); }}>
          <DialogHeader><DialogTitle>{selected?.name} launch</DialogTitle></DialogHeader>
          {selected && <video key={selected.name} aria-label={`${selected.name} launch video`} src={selected.video} poster={selected.poster} autoPlay muted loop playsInline preload="auto" disablePictureInPicture onLoadedMetadata={(event) => { const preview = previews.current[selected.name]; if (preview) event.currentTarget.currentTime = preview.currentTime; }} className="aspect-video max-h-[75dvh] w-full rounded-lg bg-muted" />}
          {selected?.name === "JobFlow" && <p className="text-xs text-muted-foreground">Launch film includes illustrative dashboard scenes.</p>}
        </DialogContent>
      </Dialog>
    </aside>
  );
}