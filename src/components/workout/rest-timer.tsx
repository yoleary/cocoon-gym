"use client";

import { useEffect, useRef } from "react";
import { Minus, Plus, SkipForward, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Haptic feedback helper ──────────────────────

function hapticFeedback(pattern: "light" | "medium" | "heavy" = "medium") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    const duration = pattern === "light" ? 50 : pattern === "medium" ? 100 : 200;
    navigator.vibrate(duration);
  }
}

// ─── Props ───────────────────────────────────────

interface RestTimerProps {
  /** Seconds remaining on the countdown */
  remaining: number;
  /** The original rest duration used to compute progress */
  total: number;
  /** Called every second to decrement the timer */
  onTick: () => void;
  /** Called when the user taps +/- buttons */
  onAdjust: (delta: number) => void;
  /** Called to skip or dismiss the timer */
  onSkip: () => void;
  /** Name of the next exercise (if any) */
  nextExerciseName?: string | null;
  /** Current set number and total for context */
  currentSet?: number;
  totalSets?: number;
}

// ─── Component ───────────────────────────────────

export function RestTimer({
  remaining,
  total,
  onTick,
  onAdjust,
  onSkip,
  nextExerciseName,
  currentSet,
  totalSets,
}: RestTimerProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Tick logic ──────────────────────────────

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      onTick();
    }, 1_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onTick]);

  // ── Vibrate when timer reaches zero ─────────

  useEffect(() => {
    if (remaining <= 0) {
      try {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([200, 100, 200, 100, 300]);
        }
      } catch {
        // Vibration API not available; silently ignore
      }
    }
  }, [remaining]);

  // ── Progress calculations ───────────────────

  const safeDuration = Math.max(total, 1);
  const progress = Math.max(0, Math.min(1, remaining / safeDuration));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 5 && remaining > 0;

  // SVG circular progress — larger for better mobile visibility
  const size = 280;
  const center = size / 2;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Determine what comes next
  const hasMoreSets = currentSet != null && totalSets != null && currentSet < totalSets;
  const nextLabel = hasMoreSets
    ? `Set ${currentSet + 1} of ${totalSets}`
    : nextExerciseName
      ? nextExerciseName
      : null;

  // ── Handlers ──────────────────────────────

  const handleAdjust = (delta: number) => {
    hapticFeedback("light");
    onAdjust(delta);
  };

  const handleSkip = () => {
    hapticFeedback("medium");
    onSkip();
  };

  // ── Render ──────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/98 backdrop-blur-md">
      {/* Title */}
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground/60">
        Rest
      </p>

      {/* Circular countdown */}
      <div className={cn("relative flex items-center justify-center", isLow && "animate-pulse")}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg]"
        >
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={6}
            className="stroke-muted/40"
          />
          {/* Progress ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={8}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000 ease-linear",
              isLow
                ? "stroke-destructive"
                : remaining <= 15
                  ? "stroke-amber-500"
                  : "stroke-primary"
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span
            className={cn(
              "text-6xl font-bold tabular-nums tracking-tight transition-colors",
              isLow && "text-destructive"
            )}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground/60">
            of {Math.floor(total / 60)}:{(total % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Next up preview */}
      {nextLabel && (
        <div className="mt-4 flex items-center gap-1.5 rounded-full bg-muted/50 px-4 py-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground">
            Next: <span className="font-medium text-foreground/70">{nextLabel}</span>
          </span>
        </div>
      )}

      {/* Adjustment buttons */}
      <div className={cn("flex items-center gap-4", nextLabel ? "mt-6" : "mt-10")}>
        <Button
          variant="outline"
          size="lg"
          className="h-14 w-24 gap-1.5 rounded-xl text-base touch-manipulation"
          onClick={() => handleAdjust(-15)}
        >
          <Minus className="h-5 w-5" />
          15s
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="h-14 w-24 gap-1.5 rounded-xl text-base touch-manipulation"
          onClick={() => handleAdjust(15)}
        >
          <Plus className="h-5 w-5" />
          15s
        </Button>
      </div>

      {/* Skip button */}
      <Button
        variant="ghost"
        size="lg"
        className="mt-6 h-14 gap-2.5 text-base text-muted-foreground touch-manipulation rounded-xl px-8"
        onClick={handleSkip}
      >
        <SkipForward className="h-5 w-5" />
        Skip Rest
      </Button>
    </div>
  );
}
