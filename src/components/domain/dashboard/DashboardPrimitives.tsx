import type { CSSProperties, ReactNode } from "react";

import type { ProjectionCopy, ShareSegment } from "@/mocks/data/dashboard";

export function DashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`rounded-card border border-white/70 bg-card p-4 shadow-[0_2px_12px_rgba(34,34,34,0.05)] ${className}`}
    >
      {children}
    </article>
  );
}

export function ProjectionTooltip({ copy }: { copy: ProjectionCopy }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label="예상 정산 안내"
        className="flex h-4 w-4 items-center justify-center rounded-full bg-text-secondary/10 text-[10px] font-black text-text-secondary hover:bg-primary-blue/10 hover:text-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
      >
        ?
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-xl bg-text-primary px-3 py-2 text-left text-[11px] font-bold leading-relaxed text-white opacity-0 shadow-[0_8px_24px_rgba(34,34,34,0.18)] group-hover:opacity-100 group-focus-within:opacity-100">
        <b className="mb-1 block text-white">{copy.eyebrow}</b>
        {copy.description} {copy.footnote}
      </span>
    </span>
  );
}

export function SegmentRing({
  segments,
  size,
  stroke,
  children,
}: {
  segments: ShareSegment[];
  size: number;
  stroke: number;
  children: ReactNode;
}) {
  const background = createConicGradient(segments);
  const inset = stroke;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full" style={{ background }} />
      <div className="absolute rounded-full bg-card" style={{ inset }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({
  percent,
  tone = "green",
  color,
  className = "",
}: {
  percent: number;
  tone?: "green" | "blue";
  color?: string;
  className?: string;
}) {
  const barStyle: CSSProperties = {
    width: `${Math.max(0, Math.min(percent, 100))}%`,
    backgroundColor: color,
  };

  return (
    <div
      className={`h-1.5 overflow-hidden rounded-full bg-background ${className}`}
    >
      <div
        className={`h-full rounded-full ${tone === "blue" ? "bg-primary-blue" : "bg-primary-green"}`}
        style={barStyle}
      />
    </div>
  );
}

function createConicGradient(segments: ShareSegment[]) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let cursor = 0;

  const stops = segments.map((segment) => {
    const start = cursor;
    const end = cursor + (segment.value / total) * 100;
    cursor = end;

    return `${segment.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}
