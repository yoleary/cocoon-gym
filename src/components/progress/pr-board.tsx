"use client";

import { useMemo } from "react";
import { Trophy, Dumbbell, BarChart3, Repeat, Timer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatWeight, formatDuration, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { PRRecord, RecordType } from "@/types";

// ─── Props ───────────────────────────────────────

interface PRBoardProps {
  records: PRRecord[];
}

// ─── Record type config ──────────────────────────

const RECORD_CONFIG: Record<
  RecordType,
  {
    label: string;
    shortLabel: string;
    icon: typeof Trophy;
    color: string;
    badgeClass: string;
    format: (value: number) => string;
  }
> = {
  E1RM: {
    label: "Estimated 1RM",
    shortLabel: "e1RM",
    icon: Zap,
    color: "text-orange-500",
    badgeClass: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    format: (v) => formatWeight(v),
  },
  MAX_WEIGHT: {
    label: "Max Weight",
    shortLabel: "Max Weight",
    icon: Dumbbell,
    color: "text-amber-500",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    format: (v) => formatWeight(v),
  },
  MAX_REPS_AT_WEIGHT: {
    label: "Max Reps",
    shortLabel: "Max Reps",
    icon: Repeat,
    color: "text-green-500",
    badgeClass: "border-green-500/30 bg-green-500/10 text-green-400",
    format: (v) => `${v} reps`,
  },
  MAX_VOLUME_SESSION: {
    label: "Session Volume",
    shortLabel: "Volume",
    icon: BarChart3,
    color: "text-blue-500",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    format: (v) => `${v.toLocaleString()}kg`,
  },
  MAX_DURATION: {
    label: "Longest Duration",
    shortLabel: "Duration",
    icon: Timer,
    color: "text-violet-500",
    badgeClass: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    format: (v) => formatDuration(v),
  },
};

// ─── Component ───────────────────────────────────

export function PRBoard({ records }: PRBoardProps) {
  // Group records by exercise name
  const grouped = useMemo(() => {
    const groups: Record<
      string,
      { exerciseName: string; records: PRRecord[] }
    > = {};

    for (const record of records) {
      if (!groups[record.exerciseName]) {
        groups[record.exerciseName] = {
          exerciseName: record.exerciseName,
          records: [],
        };
      }
      groups[record.exerciseName].records.push(record);
    }

    // Sort groups by name, sort records within by type priority
    const typeOrder: RecordType[] = [
      "E1RM",
      "MAX_WEIGHT",
      "MAX_REPS_AT_WEIGHT",
      "MAX_VOLUME_SESSION",
      "MAX_DURATION",
    ];

    return Object.values(groups)
      .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName))
      .map((group) => ({
        ...group,
        records: group.records.sort(
          (a, b) =>
            typeOrder.indexOf(a.recordType) - typeOrder.indexOf(b.recordType)
        ),
      }));
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        <div className="text-center">
          <Trophy className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          <p>No personal records yet.</p>
          <p className="text-xs">Complete workouts to start setting PRs!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.exerciseName}>
          {/* Exercise header */}
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">{group.exerciseName}</h3>
          </div>

          {/* Records grid */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {group.records.map((record, idx) => {
              const config = RECORD_CONFIG[record.recordType];
              const Icon = config.icon;

              return (
                <div
                  key={`${record.exerciseName}-${record.recordType}-${idx}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-border/80 hover:bg-secondary/50"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary",
                      "transition-colors group-hover:bg-secondary"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-1.5 py-0 text-[10px] font-semibold",
                          config.badgeClass
                        )}
                      >
                        {config.shortLabel}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-base font-bold tabular-nums">
                      {config.format(record.value)}
                    </p>
                  </div>

                  {/* Date and context */}
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(record.achievedAt)}
                    </p>
                    {record.context && (
                      <p className="text-[10px] text-muted-foreground/70">
                        {record.context}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
