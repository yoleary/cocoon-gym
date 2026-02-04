import type { PreviousPerformance as PreviousPerformanceType } from "@/types";
import { cn } from "@/lib/utils";
import { formatWeight } from "@/lib/utils";
import { formatE1RM } from "@/lib/metrics";

// ─── Props ───────────────────────────────────────

interface PreviousPerformanceProps {
  previous: PreviousPerformanceType;
  className?: string;
}

// ─── Component ───────────────────────────────────

export function PreviousPerformance({
  previous,
  className,
}: PreviousPerformanceProps) {
  if (previous.sets.length === 0) return null;

  return (
    <div className={cn("rounded-md border border-dashed p-2.5", className)}>
      {/* Header */}
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
        Last time:
      </p>

      {/* Set summaries */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {previous.sets.map((set, i) => (
          <span
            key={i}
            className="text-xs tabular-nums text-muted-foreground"
          >
            <span className="text-muted-foreground/60">{i + 1}.</span>{" "}
            {set.weight != null ? formatWeight(set.weight) : "--"}{" "}
            <span className="text-muted-foreground/50">x</span>{" "}
            {set.reps ?? "--"}
          </span>
        ))}
      </div>

      {/* Best e1RM */}
      {previous.bestE1RM != null && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Best e1RM:{" "}
          <span className="font-medium text-foreground/70">
            {formatWeight(Math.round(previous.bestE1RM * 10) / 10)}
          </span>
        </p>
      )}
    </div>
  );
}
