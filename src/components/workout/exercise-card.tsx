"use client";

import { ExternalLink, FileText, Info } from "lucide-react";
import type { LiveExercise } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TempoDisplay } from "./tempo-display";

// ─── Props ───────────────────────────────────────

interface ExerciseCardProps {
  exercise: LiveExercise;
  /** 1-based index used for numbering in the list */
  index: number;
  /** Whether this card is the currently-active exercise */
  isActive?: boolean;
  /** Click handler to select this exercise */
  onSelect?: () => void;
}

// ─── Component ───────────────────────────────────

export function ExerciseCard({
  exercise,
  index,
  isActive = false,
  onSelect,
}: ExerciseCardProps) {
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        isActive
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border bg-card hover:bg-accent/50"
      )}
    >
      {/* ── Header row ────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge
            variant="outline"
            className="shrink-0 font-mono text-xs tabular-nums"
          >
            {exercise.position}
          </Badge>
          <span className="truncate font-medium text-sm">{exercise.name}</span>
        </div>

        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {completedSets}/{totalSets}
        </span>
      </div>

      {/* ── Meta row ──────────────────────────── */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>
          {exercise.targetSets} x {exercise.targetReps}
        </span>

        {exercise.targetWeight && (
          <span className="font-medium text-foreground/80">
            {exercise.targetWeight}
          </span>
        )}

        {exercise.tempo && <TempoDisplay tempo={exercise.tempo} compact />}

        {exercise.restSeconds > 0 && (
          <span>{exercise.restSeconds}s rest</span>
        )}

        {exercise.isSuperset && exercise.supersetGroupLabel && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Superset {exercise.supersetGroupLabel}
          </Badge>
        )}
      </div>

      {/* ── Action buttons row ────────────────── */}
      <div className="mt-2 flex items-center gap-1">
        {exercise.videoUrl && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Watch demo video</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {exercise.notes && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-[240px] whitespace-pre-wrap"
              >
                <p className="text-xs font-medium mb-0.5">Trainer notes</p>
                <p className="text-xs text-muted-foreground">
                  {exercise.notes}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* ── Progress bar ──────────────────────── */}
      {totalSets > 0 && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(completedSets / totalSets) * 100}%` }}
          />
        </div>
      )}
    </button>
  );
}
