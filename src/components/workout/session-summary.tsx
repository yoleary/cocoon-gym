"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Dumbbell, Flame, History, Plus, Trophy } from "lucide-react";
import type { PRRecord } from "@/types";
import { cn } from "@/lib/utils";
import { formatDuration, formatWeight } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─── Props ───────────────────────────────────────

interface SessionSummaryProps {
  /** Total volume in kg (weight x reps summed) */
  totalVolume: number;
  /** Duration in seconds */
  durationSeconds: number;
  /** Number of exercises that had at least one completed set */
  exercisesCompleted: number;
  /** Total completed sets across all exercises */
  setsCompleted: number;
  /** List of PRs achieved during this session */
  prs: PRRecord[];
  /** ID of the completed session for linking to history */
  sessionId: string;
  /** Callback when user wants to start a new workout */
  onStartAnother?: () => void;
}

// ─── Stat card helper ────────────────────────────

function StatBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// ─── Component ───────────────────────────────────

export function SessionSummary({
  totalVolume,
  durationSeconds,
  exercisesCompleted,
  setsCompleted,
  prs,
  sessionId,
  onStartAnother,
}: SessionSummaryProps) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Well done!</CardTitle>
        <CardDescription>
          Here is a summary of your workout.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatBlock
            icon={Flame}
            label="Volume"
            value={
              totalVolume >= 1000
                ? `${(totalVolume / 1000).toFixed(1)}t`
                : formatWeight(totalVolume)
            }
          />
          <StatBlock
            icon={Clock}
            label="Duration"
            value={formatDuration(durationSeconds)}
          />
          <StatBlock
            icon={Dumbbell}
            label="Exercises"
            value={String(exercisesCompleted)}
          />
          <StatBlock
            icon={CheckCircle2}
            label="Sets"
            value={String(setsCompleted)}
          />
        </div>

        {/* PRs section */}
        {prs.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold">
                  Personal Records ({prs.length})
                </span>
              </div>

              <div className="space-y-1.5">
                {prs.map((pr, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {pr.exerciseName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pr.context}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 ml-2 border-amber-500/30 text-amber-600 font-bold tabular-nums"
                    >
                      {formatPRValue(pr)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-2">
        <Button className="w-full" asChild>
          <Link href={`/portal/history/${sessionId}`}>
            <History className="h-4 w-4 mr-1.5" />
            View in History
          </Link>
        </Button>

        {onStartAnother && (
          <Button variant="outline" className="w-full" onClick={onStartAnother}>
            <Plus className="h-4 w-4 mr-1.5" />
            Start Another Workout
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ─── Helpers ─────────────────────────────────────

function formatPRValue(pr: PRRecord): string {
  switch (pr.recordType) {
    case "E1RM":
    case "MAX_WEIGHT":
      return formatWeight(pr.value);
    case "MAX_REPS_AT_WEIGHT":
      return `${pr.value} reps`;
    case "MAX_VOLUME_SESSION":
      return `${pr.value.toLocaleString()}kg`;
    case "MAX_DURATION":
      return formatDuration(pr.value);
    default:
      return String(pr.value);
  }
}
