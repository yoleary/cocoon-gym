"use client";

import { useEffect, useRef, useCallback } from "react";
import { Minus, Plus, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
}

// ─── Component ───────────────────────────────────

export function RestTimer({
  remaining,
  total,
  onTick,
  onAdjust,
  onSkip,
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

  // SVG circular progress
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // ── Render ──────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Title */}
      <p className="mb-6 text-lg font-medium text-muted-foreground">Rest</p>

      {/* Circular countdown */}
      <div className="relative flex items-center justify-center">
        <svg
          width={220}
          height={220}
          viewBox="0 0 220 220"
          className="rotate-[-90deg]"
        >
          {/* Background ring */}
          <circle
            cx={110}
            cy={110}
            r={radius}
            fill="none"
            strokeWidth={8}
            className="stroke-muted"
          />
          {/* Progress ring */}
          <circle
            cx={110}
            cy={110}
            r={radius}
            fill="none"
            strokeWidth={8}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000 ease-linear",
              remaining > 5 ? "stroke-primary" : "stroke-destructive"
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tabular-nums tracking-tight">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Adjustment buttons */}
      <div className="mt-8 flex items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          className="h-12 gap-1.5 touch-manipulation"
          onClick={() => onAdjust(-15)}
        >
          <Minus className="h-4 w-4" />
          15s
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="h-12 gap-1.5 touch-manipulation"
          onClick={() => onAdjust(15)}
        >
          <Plus className="h-4 w-4" />
          15s
        </Button>
      </div>

      {/* Skip button */}
      <Button
        variant="ghost"
        size="lg"
        className="mt-4 h-12 gap-2 text-muted-foreground touch-manipulation"
        onClick={onSkip}
      >
        <SkipForward className="h-4 w-4" />
        Skip Rest
      </Button>
    </div>
  );
}
