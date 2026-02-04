"use client";

import { useCallback } from "react";
import { Check, Minus, Plus } from "lucide-react";
import type { LiveSet, PreviousPerformance, SetType } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Set type display config ─────────────────────

const SET_TYPE_LABELS: Record<SetType, { label: string; color: string }> = {
  WARMUP: { label: "W", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  WORKING: { label: "S", color: "bg-primary/15 text-primary border-primary/30" },
  DROP: { label: "D", color: "bg-purple-500/15 text-purple-600 border-purple-500/30" },
  AMRAP: { label: "A", color: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
  FAILURE: { label: "F", color: "bg-red-500/15 text-red-600 border-red-500/30" },
};

// ─── Weight increment options ────────────────────

type WeightIncrement = 1 | 2.5 | 5;

// ─── Props ───────────────────────────────────────

interface SetLoggerProps {
  set: LiveSet;
  setIndex: number;
  previous: PreviousPerformance | null;
  weightIncrement?: WeightIncrement;
  onUpdate: (data: Partial<Pick<LiveSet, "weight" | "reps" | "setType">>) => void;
  onComplete: () => void;
}

// ─── Component ───────────────────────────────────

export function SetLogger({
  set,
  setIndex,
  previous,
  weightIncrement = 2.5,
  onUpdate,
  onComplete,
}: SetLoggerProps) {
  const typeConfig = SET_TYPE_LABELS[set.setType];
  const prevSet = previous?.sets[setIndex] ?? null;

  // ── Handlers ────────────────────────────────

  const handleWeightChange = useCallback(
    (value: string) => {
      const parsed = parseFloat(value);
      onUpdate({ weight: isNaN(parsed) ? null : parsed });
    },
    [onUpdate]
  );

  const handleRepsChange = useCallback(
    (value: string) => {
      const parsed = parseInt(value, 10);
      onUpdate({ reps: isNaN(parsed) ? null : parsed });
    },
    [onUpdate]
  );

  const stepWeight = useCallback(
    (direction: 1 | -1) => {
      const current = set.weight ?? 0;
      const next = Math.max(0, current + direction * weightIncrement);
      onUpdate({ weight: next });
    },
    [set.weight, weightIncrement, onUpdate]
  );

  // ── Render ──────────────────────────────────

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2 transition-colors",
        set.completed
          ? "border-green-500/30 bg-green-500/5 opacity-75"
          : "border-border bg-card"
      )}
    >
      {/* Set number + type badge */}
      <div className="flex flex-col items-center gap-0.5 w-9 shrink-0">
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {set.setNumber}
        </span>
        <Badge
          variant="outline"
          className={cn("px-1.5 py-0 text-[10px] font-bold leading-4", typeConfig.color)}
        >
          {typeConfig.label}
        </Badge>
      </div>

      {/* Weight input with steppers */}
      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 touch-manipulation"
            onClick={() => stepWeight(-1)}
            disabled={set.completed}
            aria-label={`Decrease weight by ${weightIncrement}kg`}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>

          <div className="relative flex-1 min-w-0">
            <Input
              type="number"
              inputMode="decimal"
              step={weightIncrement}
              min={0}
              placeholder="kg"
              value={set.weight ?? ""}
              onChange={(e) => handleWeightChange(e.target.value)}
              disabled={set.completed}
              className="h-9 text-center text-sm font-medium tabular-nums pr-7"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
              kg
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 touch-manipulation"
            onClick={() => stepWeight(1)}
            disabled={set.completed}
            aria-label={`Increase weight by ${weightIncrement}kg`}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Previous weight ghost */}
        {prevSet?.weight != null && (
          <span className="text-[10px] text-muted-foreground text-center tabular-nums">
            {prevSet.weight}kg
          </span>
        )}
      </div>

      {/* Reps input */}
      <div className="flex flex-col w-16 shrink-0 gap-0.5">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="reps"
          value={set.reps ?? ""}
          onChange={(e) => handleRepsChange(e.target.value)}
          disabled={set.completed}
          className="h-9 text-center text-sm font-medium tabular-nums"
        />

        {/* Previous reps ghost */}
        {prevSet?.reps != null && (
          <span className="text-[10px] text-muted-foreground text-center tabular-nums">
            {prevSet.reps} reps
          </span>
        )}
      </div>

      {/* Complete / undo button */}
      <Button
        type="button"
        variant={set.completed ? "default" : "outline"}
        size="icon"
        className={cn(
          "h-10 w-10 shrink-0 touch-manipulation rounded-full transition-colors",
          set.completed && "bg-green-600 hover:bg-green-700 text-white"
        )}
        onClick={onComplete}
        aria-label={set.completed ? "Undo set completion" : "Complete set"}
      >
        <Check className="h-4 w-4" />
      </Button>
    </div>
  );
}
