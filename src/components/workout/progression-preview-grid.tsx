"use client";

import { useMemo } from "react";
import { generateProgressionPreview } from "@/lib/progression";
import type { ProgressionType } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ExerciseInput {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  targetWeight: string;
  restSeconds: number;
}

interface ExerciseBaselineEntry {
  exerciseId: string;
  startingWeight: number;
}

interface ProgressionPreviewGridProps {
  exercises: ExerciseInput[];
  progressionType: ProgressionType;
  totalWeeks: number;
  exerciseBaselines?: ExerciseBaselineEntry[];
}

export function ProgressionPreviewGrid({
  exercises,
  progressionType,
  totalWeeks,
  exerciseBaselines = [],
}: ProgressionPreviewGridProps) {
  const baselineMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const eb of exerciseBaselines) {
      map[eb.exerciseId] = eb.startingWeight;
    }
    return map;
  }, [exerciseBaselines]);

  const previews = useMemo(() => {
    return exercises.map((ex) => ({
      exerciseName: ex.exerciseName,
      weeks: generateProgressionPreview(
        ex,
        progressionType,
        totalWeeks,
        baselineMap[ex.exerciseId] ?? null
      ),
    }));
  }, [exercises, progressionType, totalWeeks, baselineMap]);

  if (progressionType === "NONE") {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Week Progression</CardTitle>
          <CardDescription>
            No progression type set. All weeks will use the same base targets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            Set a progression type on the program to see projected week-by-week
            targets.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Week Progression</CardTitle>
            <CardDescription>
              Projected targets across {totalWeeks} weeks using{" "}
              <Badge variant="outline" className="text-xs ml-1">
                {progressionType}
              </Badge>
            </CardDescription>
          </div>
          {exerciseBaselines.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Baseline recorded
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[600px]">
            {previews.map((preview, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                <p className="text-sm font-medium mb-2 truncate">
                  {preview.exerciseName}
                </p>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(80px, 1fr))` }}>
                  {preview.weeks.map((w) => (
                    <div
                      key={w.week}
                      className="rounded-md border border-border/50 p-2 text-center text-xs space-y-0.5"
                    >
                      <span className="font-medium text-muted-foreground block">
                        Wk {w.week}
                      </span>
                      <span className="block font-semibold">
                        {w.targetSets} x {w.targetReps}
                      </span>
                      {w.targetWeight && (
                        <span className="block text-primary/80 font-medium">
                          {w.targetWeight}
                        </span>
                      )}
                      <span className="block text-muted-foreground">
                        {w.restSeconds}s rest
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
