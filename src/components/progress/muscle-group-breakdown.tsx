"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { MuscleGroupVolume } from "@/types";

// ─── Props ───────────────────────────────────────

interface MuscleGroupBreakdownProps {
  data: MuscleGroupVolume[];
}

// ─── Color palette for muscle groups ─────────────

const MUSCLE_COLORS: Record<string, string> = {
  Chest: "bg-orange-500",
  Back: "bg-blue-500",
  Shoulders: "bg-amber-500",
  Biceps: "bg-green-500",
  Triceps: "bg-teal-500",
  Quadriceps: "bg-violet-500",
  Hamstrings: "bg-rose-500",
  Glutes: "bg-pink-500",
  Calves: "bg-cyan-500",
  Core: "bg-yellow-500",
  Forearms: "bg-lime-500",
  Traps: "bg-indigo-500",
  Lats: "bg-sky-500",
  "Hip Flexors": "bg-fuchsia-500",
  Adductors: "bg-emerald-500",
  Abductors: "bg-red-400",
};

const FALLBACK_COLORS = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-yellow-500",
];

function getMuscleColor(name: string, index: number): string {
  return MUSCLE_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// ─── Component ───────────────────────────────────

export function MuscleGroupBreakdown({ data }: MuscleGroupBreakdownProps) {
  const maxVolume = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((d) => d.volume));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No muscle data yet. Complete some workouts to see your volume
        distribution.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {data.map((group, index) => {
        const barWidth = maxVolume > 0 ? (group.volume / maxVolume) * 100 : 0;
        const colorClass = getMuscleColor(group.name, index);

        return (
          <div key={group.name} className="group">
            {/* Label row */}
            <div className="mb-1 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={cn("h-2.5 w-2.5 rounded-sm shrink-0", colorClass)}
                />
                <span className="font-medium">{group.name}</span>
              </div>
              <div className="flex items-center gap-2 tabular-nums text-muted-foreground">
                <span className="text-xs">
                  {group.volume >= 1000
                    ? `${(group.volume / 1000).toFixed(1)}t`
                    : `${group.volume}kg`}
                </span>
                <span className="w-8 text-right text-xs font-semibold text-foreground">
                  {group.percentage}%
                </span>
              </div>
            </div>

            {/* Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  colorClass,
                  "opacity-80 group-hover:opacity-100"
                )}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
