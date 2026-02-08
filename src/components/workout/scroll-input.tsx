"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollInputProps {
  value: number | string | null;
  placeholder?: string;
  step: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: string) => void;
  onStep: (direction: 1 | -1) => void;
  className?: string;
  suffix?: string;
  inputMode?: "decimal" | "numeric";
}

function hapticTick() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(30);
  }
}

export function ScrollInput({
  value,
  placeholder,
  step,
  min = 0,
  max,
  disabled,
  onChange,
  onStep,
  className,
  suffix,
  inputMode = "decimal",
}: ScrollInputProps) {
  const touchStartY = useRef<number | null>(null);
  const accumulatedDelta = useRef(0);
  const lastStepTime = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Threshold in pixels before triggering a step
  const STEP_THRESHOLD = 20;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      touchStartY.current = e.touches[0].clientY;
      accumulatedDelta.current = 0;
      setIsDragging(false);
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || touchStartY.current === null) return;

      const currentY = e.touches[0].clientY;
      const delta = touchStartY.current - currentY;

      // Only consider it a drag after meaningful movement
      if (Math.abs(delta) > 5) {
        setIsDragging(true);
        // Prevent scrolling the page while adjusting
        e.preventDefault();
      }

      const stepsSinceStart = Math.floor(
        Math.abs(delta) / STEP_THRESHOLD
      );
      const previousSteps = Math.floor(
        Math.abs(accumulatedDelta.current) / STEP_THRESHOLD
      );

      if (stepsSinceStart > previousSteps) {
        const direction = delta > 0 ? 1 : -1;
        const stepsToFire = stepsSinceStart - previousSteps;
        const now = Date.now();

        // Rate limit to prevent too-fast steps
        if (now - lastStepTime.current > 30) {
          for (let i = 0; i < stepsToFire; i++) {
            onStep(direction as 1 | -1);
          }
          hapticTick();
          lastStepTime.current = now;
        }
      }

      accumulatedDelta.current = delta;
    },
    [disabled, onStep]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
    accumulatedDelta.current = 0;
    // Small delay to prevent input focus after drag
    setTimeout(() => setIsDragging(false), 100);
  }, []);

  return (
    <div className={cn("relative", suffix && "flex-1 min-w-0")}>
      <input
        type="number"
        inputMode={inputMode}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => {
          if (!isDragging) onChange(e.target.value);
        }}
        onFocus={(e) => {
          // Prevent focus if we were just dragging
          if (isDragging) e.target.blur();
        }}
        disabled={disabled}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-base font-medium tabular-nums ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isDragging && "ring-2 ring-primary/40 bg-primary/5",
          className
        )}
      />
      {suffix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
      {/* Scroll indicator arrows - shown briefly on drag */}
      {isDragging && (
        <div className="absolute -right-0.5 top-0 bottom-0 flex flex-col items-center justify-between py-1 pointer-events-none text-primary/60">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
            <path d="M5 0L10 6H0L5 0Z" />
          </svg>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
            <path d="M5 6L0 0H10L5 6Z" />
          </svg>
        </div>
      )}
    </div>
  );
}
