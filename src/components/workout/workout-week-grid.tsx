"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatWeight } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────

export interface WeekCellData {
  weight: number | null;
  reps: number | null;
  /** Total sets completed for that exercise in that week */
  setsCompleted: number;
}

export interface ExerciseRow {
  exerciseId: string;
  exerciseName: string;
  position: string;
  /** Keyed by weekNumber (1-indexed) */
  weeks: Record<number, WeekCellData>;
}

interface WorkoutWeekGridProps {
  exercises: ExerciseRow[];
  totalWeeks: number;
  /** Currently active week (highlighted column) */
  currentWeek?: number;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────

function compareToLast(
  current: WeekCellData | undefined,
  previous: WeekCellData | undefined
): "up" | "down" | "same" | "none" {
  if (!current?.weight || !previous?.weight) return "none";
  if (current.weight > previous.weight) return "up";
  if (current.weight < previous.weight) return "down";
  // Same weight -- compare reps
  if (current.reps != null && previous.reps != null) {
    if (current.reps > previous.reps) return "up";
    if (current.reps < previous.reps) return "down";
  }
  return "same";
}

const TREND_STYLES = {
  up: "bg-green-500/10 text-green-700 dark:text-green-400",
  down: "bg-red-500/10 text-red-700 dark:text-red-400",
  same: "bg-muted/50 text-foreground",
  none: "text-muted-foreground",
} as const;

// ─── Component ───────────────────────────────────

export function WorkoutWeekGrid({
  exercises,
  totalWeeks,
  currentWeek,
  className,
}: WorkoutWeekGridProps) {
  const weekNumbers = useMemo(
    () => Array.from({ length: totalWeeks }, (_, i) => i + 1),
    [totalWeeks]
  );

  if (exercises.length === 0) {
    return (
      <div className={cn("rounded-lg border p-6 text-center text-sm text-muted-foreground", className)}>
        No exercise data available yet.
      </div>
    );
  }

  return (
    <ScrollArea className={cn("rounded-lg border", className)}>
      <div className="min-w-[600px]">
        <table className="w-full border-collapse text-sm">
          {/* ── Header ──────────────────────── */}
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2 text-left font-medium text-muted-foreground w-[200px] min-w-[200px]">
                Exercise
              </th>
              {weekNumbers.map((week) => (
                <th
                  key={week}
                  className={cn(
                    "px-3 py-2 text-center font-medium text-muted-foreground min-w-[100px]",
                    week === currentWeek && "bg-primary/5 text-primary font-semibold"
                  )}
                >
                  Wk {week}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ────────────────────────── */}
          <tbody>
            {exercises.map((row) => (
              <tr key={row.exerciseId} className="border-b last:border-b-0">
                {/* Exercise name (sticky) */}
                <td className="sticky left-0 z-10 bg-background px-3 py-2 border-r">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge
                      variant="outline"
                      className="shrink-0 font-mono text-[10px] px-1.5 py-0"
                    >
                      {row.position}
                    </Badge>
                    <span className="truncate text-sm font-medium">
                      {row.exerciseName}
                    </span>
                  </div>
                </td>

                {/* Week cells */}
                {weekNumbers.map((week) => {
                  const cell = row.weeks[week];
                  const prevCell = week > 1 ? row.weeks[week - 1] : undefined;
                  const trend = compareToLast(cell, prevCell);

                  return (
                    <td
                      key={week}
                      className={cn(
                        "px-3 py-2 text-center",
                        week === currentWeek && "bg-primary/5",
                        cell && TREND_STYLES[trend]
                      )}
                    >
                      {cell ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1">
                            {trend === "up" && (
                              <ArrowUp className="h-3 w-3 text-green-600" />
                            )}
                            {trend === "down" && (
                              <ArrowDown className="h-3 w-3 text-red-600" />
                            )}
                            {trend === "same" && (
                              <Minus className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium tabular-nums">
                              {cell.weight != null
                                ? formatWeight(cell.weight)
                                : "--"}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {cell.reps ?? "--"} reps
                            {cell.setsCompleted > 0 && (
                              <> &middot; {cell.setsCompleted}s</>
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">
                          --
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
