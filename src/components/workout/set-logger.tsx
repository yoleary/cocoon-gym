"use client";

import { useCallback } from "react";
import { Check, Minus, Plus, Copy, Target } from "lucide-react";
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

// ─── Haptic feedback helper ──────────────────────

function hapticFeedback(pattern: "light" | "medium" | "heavy" = "medium") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    const duration = pattern === "light" ? 50 : pattern === "medium" ? 100 : 200;
    navigator.vibrate(duration);
  }
}

// ─── Parse rep range to get a target number ──────

function parseTargetReps(targetReps: string | null | undefined): number | null {
  if (!targetReps) return null;
  // Handle ranges like "8-12" -> use the lower bound
  const match = targetReps.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// ─── Weight increment options ────────────────────

type WeightIncrement = 1 | 2.5 | 5;

// ─── Props ───────────────────────────────────────

interface SetLoggerProps {
  set: LiveSet;
  setIndex: number;
  /** Previous sets from the LAST workout session (historical) */
  previous: PreviousPerformance | null;
  /** Previous set from THIS workout (the set before this one) */
  previousSetInWorkout?: LiveSet | null;
  /** Target weight from program progression */
  targetWeight?: number | null;
  /** Target reps from program (e.g., "8-12" or "6") */
  targetReps?: string | null;
  weightIncrement?: WeightIncrement;
  onUpdate: (data: Partial<Pick<LiveSet, "weight" | "reps" | "setType">>) => void;
  onComplete: () => void;
}

// ─── Component ───────────────────────────────────

export function SetLogger({
  set,
  setIndex,
  previous,
  previousSetInWorkout,
  targetWeight,
  targetReps,
  weightIncrement = 2.5,
  onUpdate,
  onComplete,
}: SetLoggerProps) {
  const typeConfig = SET_TYPE_LABELS[set.setType];

  // Previous set from LAST session (historical performance)
  const prevSessionSet = previous?.sets[setIndex] ?? null;

  // Parse target reps to a number
  const targetRepsNum = parseTargetReps(targetReps);

  // ── Determine quick action options ────────────

  // Option 1: "Same as last set" - from previous set in THIS workout
  const lastSetWeight = previousSetInWorkout?.weight ?? null;
  const lastSetReps = previousSetInWorkout?.reps ?? null;
  const canSameAsLast = lastSetWeight != null && lastSetReps != null && !set.completed;

  // Option 2: "Follow plan" - from program progression target
  const planWeight = targetWeight ?? null;
  const planReps = targetRepsNum ?? null;
  const canFollowPlan = planWeight != null && planReps != null && !set.completed;

  // Option 3: "Match previous session" - from last time they did this exercise
  const prevWeight = prevSessionSet?.weight ?? null;
  const prevReps = prevSessionSet?.reps ?? null;
  const canMatchPrevious = prevWeight != null && prevReps != null && !set.completed && setIndex === 0;

  // Check if plan differs from last set (show both buttons)
  const planDiffersFromLast = canSameAsLast && canFollowPlan &&
    (lastSetWeight !== planWeight || lastSetReps !== planReps);

  // For first set, use plan or previous session
  const suggestedWeight = planWeight ?? prevWeight ?? lastSetWeight ?? null;
  const suggestedReps = planReps ?? prevReps ?? lastSetReps ?? null;

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
      const current = set.weight ?? suggestedWeight ?? 0;
      const next = Math.max(0, current + direction * weightIncrement);
      onUpdate({ weight: next });
      hapticFeedback("light");
    },
    [set.weight, suggestedWeight, weightIncrement, onUpdate]
  );

  const stepReps = useCallback(
    (direction: 1 | -1) => {
      const current = set.reps ?? suggestedReps ?? 0;
      const next = Math.max(0, current + direction);
      onUpdate({ reps: next });
      hapticFeedback("light");
    },
    [set.reps, suggestedReps, onUpdate]
  );

  const handleQuickComplete = useCallback((weight: number, reps: number) => {
    onUpdate({ weight, reps });
    hapticFeedback("medium");
    // Delay completion slightly so state updates
    setTimeout(() => {
      onComplete();
    }, 50);
  }, [onUpdate, onComplete]);

  const handleFollowPlan = useCallback(() => {
    if (planWeight != null && planReps != null) {
      handleQuickComplete(planWeight, planReps);
    }
  }, [planWeight, planReps, handleQuickComplete]);

  const handleSameAsLast = useCallback(() => {
    if (lastSetWeight != null && lastSetReps != null) {
      handleQuickComplete(lastSetWeight, lastSetReps);
    }
  }, [lastSetWeight, lastSetReps, handleQuickComplete]);

  const handleMatchPrevious = useCallback(() => {
    if (prevWeight != null && prevReps != null) {
      handleQuickComplete(prevWeight, prevReps);
    }
  }, [prevWeight, prevReps, handleQuickComplete]);

  const handleComplete = useCallback(() => {
    hapticFeedback("medium");
    onComplete();
  }, [onComplete]);

  const handleCopyPrevious = useCallback(() => {
    if (suggestedWeight != null) {
      onUpdate({ weight: suggestedWeight });
    }
    if (suggestedReps != null) {
      onUpdate({ reps: suggestedReps });
    }
    hapticFeedback("light");
  }, [suggestedWeight, suggestedReps, onUpdate]);

  // ── Computed display values ──────────────────

  // Show suggested weight if current is empty
  const displayWeight = set.weight ?? suggestedWeight ?? "";
  const displayReps = set.reps ?? suggestedReps ?? "";

  // ── Render ──────────────────────────────────

  return (
    <div className="space-y-2">
      {/* Quick Action Buttons */}
      {!set.completed && (
        <div className="space-y-2">
          {/* Follow Plan - Primary action when there's a progression target */}
          {canFollowPlan && (
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full h-14 text-base font-medium gap-2 touch-manipulation"
              onClick={handleFollowPlan}
            >
              <Target className="h-5 w-5" />
              Follow plan: {planWeight}kg × {planReps}
            </Button>
          )}

          {/* Same as last set - Show when there's a previous set AND it differs from plan */}
          {canSameAsLast && (!canFollowPlan || planDiffersFromLast) && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={cn(
                "w-full h-12 text-base font-medium gap-2 touch-manipulation",
                !canFollowPlan && "h-14 bg-primary/5 border-primary/20 hover:bg-primary/10"
              )}
              onClick={handleSameAsLast}
            >
              <Copy className="h-5 w-5" />
              Same as last: {lastSetWeight}kg × {lastSetReps}
            </Button>
          )}

          {/* Match previous session - Only for first set when no plan target */}
          {canMatchPrevious && !canFollowPlan && !canSameAsLast && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-14 text-base font-medium gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10 touch-manipulation"
              onClick={handleMatchPrevious}
            >
              <Copy className="h-5 w-5" />
              Match last session: {prevWeight}kg × {prevReps}
            </Button>
          )}
        </div>
      )}

      {/* Main set logger row */}
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

        {/* Weight input with steppers - LARGER touch targets */}
        <div className="flex flex-col flex-1 min-w-0 gap-0.5">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 touch-manipulation text-lg"
              onClick={() => stepWeight(-1)}
              disabled={set.completed}
              aria-label={`Decrease weight by ${weightIncrement}kg`}
            >
              <Minus className="h-5 w-5" />
            </Button>

            <div className="relative flex-1 min-w-0">
              <Input
                type="number"
                inputMode="decimal"
                step={weightIncrement}
                min={0}
                placeholder={suggestedWeight != null ? String(suggestedWeight) : "kg"}
                value={set.weight ?? ""}
                onChange={(e) => handleWeightChange(e.target.value)}
                disabled={set.completed}
                className={cn(
                  "h-12 text-center text-base font-medium tabular-nums pr-7",
                  set.weight == null && suggestedWeight != null && "placeholder:text-foreground/40"
                )}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                kg
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 touch-manipulation text-lg"
              onClick={() => stepWeight(1)}
              disabled={set.completed}
              aria-label={`Increase weight by ${weightIncrement}kg`}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Previous weight hint - only if different from current */}
          {prevSet?.weight != null && prevSet.weight !== set.weight && (
            <button
              type="button"
              onClick={handleCopyPrevious}
              className="text-[10px] text-muted-foreground text-center tabular-nums hover:text-foreground transition-colors"
            >
              Last: {prevSet.weight}kg (tap to copy)
            </button>
          )}
        </div>

        {/* Reps input with steppers */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 touch-manipulation"
              onClick={() => stepReps(-1)}
              disabled={set.completed}
              aria-label="Decrease reps"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={suggestedReps != null ? String(suggestedReps) : "reps"}
              value={set.reps ?? ""}
              onChange={(e) => handleRepsChange(e.target.value)}
              disabled={set.completed}
              className={cn(
                "h-12 w-16 text-center text-base font-medium tabular-nums",
                set.reps == null && suggestedReps != null && "placeholder:text-foreground/40"
              )}
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 touch-manipulation"
              onClick={() => stepReps(1)}
              disabled={set.completed}
              aria-label="Increase reps"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Previous reps hint */}
          {prevSet?.reps != null && prevSet.reps !== set.reps && (
            <span className="text-[10px] text-muted-foreground text-center tabular-nums">
              Last: {prevSet.reps}
            </span>
          )}
        </div>

        {/* Complete button - LARGER */}
        <Button
          type="button"
          variant={set.completed ? "default" : "outline"}
          size="icon"
          className={cn(
            "h-14 w-14 shrink-0 touch-manipulation rounded-full transition-colors",
            set.completed && "bg-green-600 hover:bg-green-700 text-white"
          )}
          onClick={handleComplete}
          aria-label={set.completed ? "Undo set completion" : "Complete set"}
        >
          <Check className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
