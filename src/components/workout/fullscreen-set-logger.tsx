"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Minus,
  Plus,
  Target,
  X,
} from "lucide-react";
import type { LiveExercise, LiveSet, PreviousPerformance, SetType } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseInfoPanel } from "@/components/workout/exercise-info-panel";

// ─── Set type display config ─────────────────────

const SET_TYPE_LABELS: Record<SetType, { label: string; fullLabel: string; color: string }> = {
  WARMUP: { label: "W", fullLabel: "Warm-up", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  WORKING: { label: "S", fullLabel: "Working Set", color: "bg-primary/15 text-primary border-primary/30" },
  DROP: { label: "D", fullLabel: "Drop Set", color: "bg-purple-500/15 text-purple-600 border-purple-500/30" },
  AMRAP: { label: "A", fullLabel: "AMRAP", color: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
  FAILURE: { label: "F", fullLabel: "To Failure", color: "bg-red-500/15 text-red-600 border-red-500/30" },
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
  const match = targetReps.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// ─── Props ───────────────────────────────────────

interface FullscreenSetLoggerProps {
  exercise: LiveExercise;
  exerciseIndex: number;
  setIndex: number;
  totalExercises: number;
  onUpdate: (data: Partial<Pick<LiveSet, "weight" | "reps" | "setType">>) => void;
  onComplete: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onSetChange: (setIndex: number) => void;
  onExerciseChange: (exerciseIndex: number) => void;
  /** Previous sets from the LAST workout session (historical) */
  previous: PreviousPerformance | null;
  /** Previous set from THIS workout (the set before this one) */
  previousSetInWorkout: LiveSet | null;
}

// ─── Component ───────────────────────────────────

export function FullscreenSetLogger({
  exercise,
  exerciseIndex,
  setIndex,
  totalExercises,
  onUpdate,
  onComplete,
  onNext,
  onPrev,
  onClose,
  onSetChange,
  onExerciseChange,
  previous,
  previousSetInWorkout,
}: FullscreenSetLoggerProps) {
  const set = exercise.sets[setIndex];
  const typeConfig = SET_TYPE_LABELS[set.setType];

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Local input state for smoother typing
  const [localWeight, setLocalWeight] = useState<string>(set.weight?.toString() ?? "");
  const [localReps, setLocalReps] = useState<string>(set.reps?.toString() ?? "");

  // Sync local state when set changes
  useEffect(() => {
    setLocalWeight(set.weight?.toString() ?? "");
    setLocalReps(set.reps?.toString() ?? "");
  }, [set.weight, set.reps, setIndex, exerciseIndex]);

  // Previous set from LAST session (historical performance)
  const prevSessionSet = previous?.sets[setIndex] ?? null;

  // Parse target reps to a number
  const targetRepsNum = parseTargetReps(exercise.targetReps);

  // Quick action options
  const lastSetWeight = previousSetInWorkout?.weight ?? null;
  const lastSetReps = previousSetInWorkout?.reps ?? null;
  const canSameAsLast = lastSetWeight != null && lastSetReps != null && !set.completed;

  const planWeight = exercise.targetWeightKg ?? null;
  const planReps = targetRepsNum ?? null;
  const canFollowPlan = planWeight != null && planReps != null && !set.completed;

  const planDiffersFromLast = canSameAsLast && canFollowPlan &&
    (lastSetWeight !== planWeight || lastSetReps !== planReps);

  // ── Handlers ────────────────────────────────

  const handleWeightChange = useCallback(
    (value: string) => {
      setLocalWeight(value);
      const parsed = parseFloat(value);
      onUpdate({ weight: isNaN(parsed) ? null : parsed });
    },
    [onUpdate]
  );

  const handleRepsChange = useCallback(
    (value: string) => {
      setLocalReps(value);
      const parsed = parseInt(value, 10);
      onUpdate({ reps: isNaN(parsed) ? null : parsed });
    },
    [onUpdate]
  );

  const stepWeight = useCallback(
    (direction: 1 | -1) => {
      const current = set.weight ?? planWeight ?? prevSessionSet?.weight ?? 0;
      const next = Math.max(0, current + direction * 2.5);
      setLocalWeight(next.toString());
      onUpdate({ weight: next });
      hapticFeedback("light");
    },
    [set.weight, planWeight, prevSessionSet?.weight, onUpdate]
  );

  const stepReps = useCallback(
    (direction: 1 | -1) => {
      const current = set.reps ?? planReps ?? prevSessionSet?.reps ?? 0;
      const next = Math.max(0, current + direction);
      setLocalReps(next.toString());
      onUpdate({ reps: next });
      hapticFeedback("light");
    },
    [set.reps, planReps, prevSessionSet?.reps, onUpdate]
  );

  const handleQuickComplete = useCallback((weight: number, reps: number) => {
    setLocalWeight(weight.toString());
    setLocalReps(reps.toString());
    onUpdate({ weight, reps });
    hapticFeedback("medium");
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

  const handleComplete = useCallback(() => {
    hapticFeedback("heavy");
    onComplete();
  }, [onComplete]);

  // ── Swipe handling ─────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const diffX = e.changedTouches[0].clientX - touchStartX.current;
      const diffY = e.changedTouches[0].clientY - touchStartY.current;
      const threshold = 80;

      // Check if horizontal swipe is more prominent than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          // Swipe right - go to previous set
          if (setIndex > 0) {
            onSetChange(setIndex - 1);
          } else if (exerciseIndex > 0) {
            // Go to last set of previous exercise
            onExerciseChange(exerciseIndex - 1);
          }
        } else {
          // Swipe left - go to next set
          if (setIndex < exercise.sets.length - 1) {
            onSetChange(setIndex + 1);
          } else if (exerciseIndex < totalExercises - 1) {
            // Go to first set of next exercise
            onExerciseChange(exerciseIndex + 1);
          }
        }
        hapticFeedback("light");
      } else if (diffY > threshold && Math.abs(diffY) > Math.abs(diffX)) {
        // Swipe down - close fullscreen
        onClose();
        hapticFeedback("light");
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [setIndex, exerciseIndex, exercise.sets.length, totalExercises, onSetChange, onExerciseChange, onClose]
  );

  // ── Navigation helpers ─────────────────────

  const canGoPrev = setIndex > 0 || exerciseIndex > 0;
  const canGoNext = setIndex < exercise.sets.length - 1 || exerciseIndex < totalExercises - 1;

  const handlePrev = useCallback(() => {
    if (setIndex > 0) {
      onSetChange(setIndex - 1);
    } else if (exerciseIndex > 0) {
      onExerciseChange(exerciseIndex - 1);
    }
    hapticFeedback("light");
  }, [setIndex, exerciseIndex, onSetChange, onExerciseChange]);

  const handleNext = useCallback(() => {
    if (setIndex < exercise.sets.length - 1) {
      onSetChange(setIndex + 1);
    } else if (exerciseIndex < totalExercises - 1) {
      onExerciseChange(exerciseIndex + 1);
    }
    hapticFeedback("light");
  }, [setIndex, exerciseIndex, exercise.sets.length, totalExercises, onSetChange, onExerciseChange]);

  // ── Render ──────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors touch-manipulation"
          aria-label="Close fullscreen"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="text-sm font-medium text-muted-foreground">
          Set {setIndex + 1} of {exercise.sets.length}
        </span>

        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-hidden">
        {/* Exercise name */}
        <h1 className="text-2xl font-bold text-center mb-1">{exercise.name}</h1>

        {/* How to + Set type badge */}
        <div className="flex items-center gap-3 mb-8">
          <Badge
            variant="outline"
            className={cn("text-sm px-3 py-1", typeConfig.color)}
          >
            {typeConfig.fullLabel}
          </Badge>
          <ExerciseInfoPanel
            exerciseId={exercise.exerciseId}
            exerciseName={exercise.name}
            trainerNotes={exercise.notes}
            compact
          />
        </div>

        {/* Weight input */}
        <div className="w-full max-w-xs mb-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-14 w-14 shrink-0 touch-manipulation text-xl rounded-full"
              onClick={() => stepWeight(-1)}
              disabled={set.completed}
              aria-label="Decrease weight"
            >
              <Minus className="h-6 w-6" />
            </Button>

            <div className="relative flex-1">
              <Input
                type="number"
                inputMode="decimal"
                step={2.5}
                min={0}
                placeholder={planWeight?.toString() ?? prevSessionSet?.weight?.toString() ?? "0"}
                value={localWeight}
                onChange={(e) => handleWeightChange(e.target.value)}
                disabled={set.completed}
                className="h-16 text-center text-2xl font-bold tabular-nums pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground pointer-events-none">
                kg
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-14 w-14 shrink-0 touch-manipulation text-xl rounded-full"
              onClick={() => stepWeight(1)}
              disabled={set.completed}
              aria-label="Increase weight"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Reps input */}
        <div className="w-full max-w-xs mb-8">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-14 w-14 shrink-0 touch-manipulation text-xl rounded-full"
              onClick={() => stepReps(-1)}
              disabled={set.completed}
              aria-label="Decrease reps"
            >
              <Minus className="h-6 w-6" />
            </Button>

            <div className="relative flex-1">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={planReps?.toString() ?? prevSessionSet?.reps?.toString() ?? "0"}
                value={localReps}
                onChange={(e) => handleRepsChange(e.target.value)}
                disabled={set.completed}
                className="h-16 text-center text-2xl font-bold tabular-nums pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground pointer-events-none">
                reps
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-14 w-14 shrink-0 touch-manipulation text-xl rounded-full"
              onClick={() => stepReps(1)}
              disabled={set.completed}
              aria-label="Increase reps"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Quick action buttons */}
        {!set.completed && (
          <div className="w-full max-w-xs space-y-3 mb-8">
            {canFollowPlan && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-medium gap-2 touch-manipulation"
                onClick={handleFollowPlan}
              >
                <Target className="h-5 w-5" />
                Follow Plan: {planWeight}kg x {planReps}
              </Button>
            )}

            {canSameAsLast && (!canFollowPlan || planDiffersFromLast) && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-medium gap-2 touch-manipulation"
                onClick={handleSameAsLast}
              >
                <Copy className="h-5 w-5" />
                Same as Last: {lastSetWeight}kg x {lastSetReps}
              </Button>
            )}
          </div>
        )}

        {/* Complete button */}
        <Button
          type="button"
          size="lg"
          className={cn(
            "w-full max-w-xs h-16 text-lg font-semibold gap-2 touch-manipulation rounded-xl",
            set.completed
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-primary hover:bg-primary/90"
          )}
          onClick={handleComplete}
        >
          <Check className="h-6 w-6" />
          {set.completed ? "Set Completed" : "Complete Set"}
        </Button>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <Button
          variant="ghost"
          size="lg"
          className="gap-1 touch-manipulation"
          onClick={handlePrev}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="h-5 w-5" />
          Prev
        </Button>

        {/* Set dots indicator */}
        <div className="flex items-center gap-1.5">
          {exercise.sets.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSetChange(i)}
              className={cn(
                "h-2.5 w-2.5 rounded-full shrink-0 transition-all touch-manipulation",
                i === setIndex
                  ? "h-3 w-3 bg-primary"
                  : s.completed
                    ? "bg-green-500"
                    : "bg-muted-foreground/30"
              )}
              aria-label={`Go to set ${i + 1}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="lg"
          className="gap-1 touch-manipulation"
          onClick={handleNext}
          disabled={!canGoNext}
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
