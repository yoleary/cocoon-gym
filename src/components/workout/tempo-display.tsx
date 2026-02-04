"use client";

import { parseTempo } from "@/lib/tempo";
import { cn } from "@/lib/utils";

// ─── Phase config ────────────────────────────────

const PHASES = [
  { key: "lowering", label: "Lower", color: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  { key: "pauseBottom", label: "Pause", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  { key: "lifting", label: "Lift", color: "bg-green-500/15 text-green-600 border-green-500/30" },
  { key: "pauseTop", label: "Hold", color: "bg-purple-500/15 text-purple-600 border-purple-500/30" },
] as const;

// ─── Props ───────────────────────────────────────

interface TempoDisplayProps {
  tempo: string;
  /** Compact inline mode (used inside ExerciseCard) */
  compact?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────

export function TempoDisplay({ tempo, compact = false, className }: TempoDisplayProps) {
  const parsed = parseTempo(tempo);

  if (!parsed) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        {tempo}
      </span>
    );
  }

  const values: Record<string, number> = {
    lowering: parsed.lowering,
    pauseBottom: parsed.pauseBottom,
    lifting: parsed.lifting,
    pauseTop: parsed.pauseTop,
  };

  // ── Compact (inline badge) ──────────────────

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-mono text-xs tabular-nums",
          className
        )}
        title={`Tempo: ${parsed.lowering}-${parsed.pauseBottom}-${parsed.lifting}-${parsed.pauseTop}`}
      >
        <span className="text-blue-600">{parsed.lowering}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-amber-600">{parsed.pauseBottom}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-green-600">{parsed.lifting}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-purple-600">{parsed.pauseTop}</span>
      </span>
    );
  }

  // ── Full display (4 labeled blocks) ─────────

  return (
    <div className={cn("flex items-stretch gap-1.5", className)}>
      {PHASES.map((phase) => (
        <div
          key={phase.key}
          className={cn(
            "flex flex-col items-center rounded-md border px-3 py-2 min-w-[56px]",
            phase.color
          )}
        >
          <span className="text-lg font-bold tabular-nums leading-none">
            {values[phase.key]}s
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wider opacity-80">
            {phase.label}
          </span>
        </div>
      ))}
    </div>
  );
}
