import { useMemo, useRef } from "react";
import { DashPanel } from "@/components/dashboard/DashPanel";
import { gsap, useCountUp, useGSAP, useMotionOK } from "@/lib/motion";

const GROUPS = [
  { label: "Pending", color: "hsl(var(--tone-peach-fg))", statuses: ["pending"] },
  { label: "Designing", color: "hsl(var(--primary))", statuses: ["designing"] },
  { label: "In progress", color: "hsl(var(--tone-sky-fg))", statuses: ["in-progress"] },
  { label: "Out / FOC", color: "hsl(var(--tone-rose-fg))", statuses: ["out", "foc_sample"] },
  { label: "Ready to bill", color: "hsl(var(--tone-mint-fg))", statuses: ["completed", "finished"] },
];

const CX = 100, CY = 100, R = 82;
const point = (a: number) => [CX + R * Math.cos(a), CY + R * Math.sin(a)];
const arc = (from: number, to: number) => {
  const [x0, y0] = point(from);
  const [x1, y1] = point(to);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 ${to - from > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

/** Donut chart of open jobs by status. Hand-built SVG, drawn in by GSAP. */
export function JobSummaryGauge({ counts, className }: { counts: Record<string, number>; className?: string }) {
  const rows = useMemo(
    () => GROUPS.map((group) => ({
      ...group,
      count: group.statuses.reduce((total, status) => total + (counts[status] ?? 0), 0),
    })),
    [counts],
  );
  const total = rows.reduce((a, r) => a + r.count, 0);

  const segments = useMemo(() => {
    let cursor = -Math.PI / 2;
    return rows.filter((r) => r.count > 0).map((r) => {
      const span = (r.count / total) * 2 * Math.PI;
      const gap = Math.min(0.05, span / 3);
      const seg = { color: r.color, d: arc(cursor + gap / 2, cursor + span - gap / 2) };
      cursor += span;
      return seg;
    });
  }, [rows, total]);

  const svg = useRef<SVGSVGElement>(null);
  const num = useRef<HTMLDivElement>(null);
  const ok = useMotionOK();
  useCountUp(num, total, (n) => String(Math.round(n)));
  useGSAP(() => {
    if (!ok.current || !svg.current) return;
    gsap.fromTo(svg.current.querySelectorAll("path[data-seg]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.out", stagger: 0.06 });
  }, { scope: svg, dependencies: [total] });

  return (
    <DashPanel title="Jobs by status" className={className} action={<span className="text-xs text-muted-foreground">open jobs</span>} bodyClassName="flex items-center gap-3 overflow-visible p-3">
      <div className="relative w-28 shrink-0">
        <svg ref={svg} viewBox="0 0 200 200" role="img" aria-label={`${total} open jobs: ${rows.map((r) => `${r.count} ${r.label}`).join(", ")}`} className="w-full overflow-visible">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={16} strokeLinecap="round" />
          {segments.map((s) => (
            <path key={s.color} data-seg d={s.d} pathLength={1} strokeDasharray={1} strokeDashoffset={0} fill="none" stroke={s.color} strokeWidth={16} strokeLinecap="round" />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div ref={num} className="text-2xl font-semibold tabular-nums leading-none tracking-normal">{total}</div><span className="mt-1 text-[10px] text-muted-foreground">Open jobs</span>
        </div>
      </div>
      <ul className="grid min-w-0 flex-1 gap-2 text-[11px]">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
            <span className="truncate text-muted-foreground">{r.label}</span>
            <span className="ms-auto font-semibold tabular-nums">{r.count}</span>
          </li>
        ))}
      </ul>
    </DashPanel>
  );
}
