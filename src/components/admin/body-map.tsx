"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getProgramMuscleCoverage,
  type MuscleCoverage,
} from "@/actions/muscle-coverage.actions";
import { Badge } from "@/components/ui/badge";

// ─── Muscle-to-SVG path mapping ──────────────────
// Simplified anatomical paths for front and back views

type MuscleRegion = {
  path: string;
  view: "front" | "back";
  label: string;
  /** Canonical muscle names this region maps to */
  muscleNames: string[];
};

const MUSCLE_REGIONS: MuscleRegion[] = [
  // ── Front view ──
  {
    view: "front",
    label: "Chest",
    muscleNames: ["Chest", "Pectorals", "Pecs"],
    path: "M 62,72 Q 70,68 80,72 L 80,88 Q 71,90 62,88 Z M 80,72 Q 90,68 98,72 L 98,88 Q 89,90 80,88 Z",
  },
  {
    view: "front",
    label: "Shoulders",
    muscleNames: ["Shoulders", "Deltoids", "Delts", "Front Delts", "Side Delts"],
    path: "M 52,64 Q 58,58 64,64 L 62,76 Q 57,72 52,76 Z M 96,64 Q 102,58 108,64 L 108,76 Q 103,72 98,76 Z",
  },
  {
    view: "front",
    label: "Biceps",
    muscleNames: ["Biceps"],
    path: "M 50,78 Q 54,76 58,78 L 56,100 Q 52,102 48,100 Z M 102,78 Q 106,76 110,78 L 112,100 Q 108,102 104,100 Z",
  },
  {
    view: "front",
    label: "Forearms",
    muscleNames: ["Forearms"],
    path: "M 48,102 Q 52,100 56,102 L 54,124 Q 50,126 46,124 Z M 104,102 Q 108,100 112,102 L 114,124 Q 110,126 106,124 Z",
  },
  {
    view: "front",
    label: "Core",
    muscleNames: ["Core", "Abs", "Abdominals", "Obliques"],
    path: "M 68,90 Q 72,88 80,88 Q 88,88 92,90 L 92,118 Q 88,120 80,120 Q 72,120 68,118 Z",
  },
  {
    view: "front",
    label: "Quads",
    muscleNames: ["Quadriceps", "Quads"],
    path: "M 64,120 Q 68,118 74,120 L 72,156 Q 68,158 64,156 Z M 86,120 Q 92,118 96,120 L 96,156 Q 92,158 88,156 Z",
  },
  {
    view: "front",
    label: "Hip Flexors",
    muscleNames: ["Hip Flexors"],
    path: "M 64,116 Q 68,114 72,116 L 66,124 Q 64,122 62,120 Z M 88,116 Q 92,114 96,116 L 98,120 Q 96,122 94,124 Z",
  },
  {
    view: "front",
    label: "Adductors",
    muscleNames: ["Adductors"],
    path: "M 74,120 Q 78,118 80,120 L 78,148 Q 76,150 74,148 Z M 80,120 Q 82,118 86,120 L 86,148 Q 84,150 82,148 Z",
  },
  {
    view: "front",
    label: "Calves",
    muscleNames: ["Calves"],
    path: "M 64,160 Q 68,156 72,160 L 70,182 Q 67,184 64,182 Z M 88,160 Q 92,156 96,160 L 96,182 Q 93,184 90,182 Z",
  },
  // ── Back view ──
  {
    view: "back",
    label: "Traps",
    muscleNames: ["Traps", "Trapezius"],
    path: "M 68,58 Q 80,52 92,58 L 92,70 Q 80,66 68,70 Z",
  },
  {
    view: "back",
    label: "Lats",
    muscleNames: ["Lats", "Latissimus Dorsi", "Back"],
    path: "M 60,76 Q 68,72 76,76 L 72,100 Q 66,102 60,100 Z M 84,76 Q 92,72 100,76 L 100,100 Q 94,102 88,100 Z",
  },
  {
    view: "back",
    label: "Rear Delts",
    muscleNames: ["Rear Delts", "Posterior Deltoids"],
    path: "M 52,64 Q 58,58 62,64 L 60,76 Q 56,72 52,76 Z M 98,64 Q 102,58 108,64 L 108,76 Q 104,72 100,76 Z",
  },
  {
    view: "back",
    label: "Triceps",
    muscleNames: ["Triceps"],
    path: "M 50,78 Q 54,76 58,78 L 56,100 Q 52,102 48,100 Z M 102,78 Q 106,76 110,78 L 112,100 Q 108,102 104,100 Z",
  },
  {
    view: "back",
    label: "Lower Back",
    muscleNames: ["Lower Back", "Erectors", "Spinal Erectors"],
    path: "M 72,96 Q 76,94 80,94 Q 84,94 88,96 L 88,118 Q 84,120 80,120 Q 76,120 72,118 Z",
  },
  {
    view: "back",
    label: "Glutes",
    muscleNames: ["Glutes", "Gluteals", "Gluteus Maximus"],
    path: "M 64,118 Q 72,114 80,118 L 80,134 Q 72,138 64,134 Z M 80,118 Q 88,114 96,118 L 96,134 Q 88,138 80,134 Z",
  },
  {
    view: "back",
    label: "Hamstrings",
    muscleNames: ["Hamstrings"],
    path: "M 64,136 Q 68,132 74,136 L 72,162 Q 68,164 64,162 Z M 86,136 Q 92,132 96,136 L 96,162 Q 92,164 88,162 Z",
  },
  {
    view: "back",
    label: "Calves (back)",
    muscleNames: ["Calves"],
    path: "M 64,164 Q 68,160 72,164 L 70,186 Q 67,188 64,186 Z M 88,164 Q 92,160 96,164 L 96,186 Q 93,188 90,186 Z",
  },
];

// Body outline paths (simplified)
const BODY_OUTLINE_FRONT =
  "M 80,20 Q 88,20 90,28 Q 92,36 88,42 Q 92,48 92,54 L 108,60 Q 116,64 116,72 L 114,126 Q 112,128 108,126 L 98,120 L 98,160 Q 100,168 98,186 Q 96,192 92,192 L 86,186 L 80,186 L 74,186 L 68,192 Q 64,192 62,186 Q 60,168 62,160 L 62,120 L 52,126 Q 48,128 46,126 L 44,72 Q 44,64 52,60 L 68,54 Q 68,48 72,42 Q 68,36 70,28 Q 72,20 80,20 Z";

const BODY_OUTLINE_BACK =
  "M 80,20 Q 88,20 90,28 Q 92,36 88,42 Q 92,48 92,54 L 108,60 Q 116,64 116,72 L 114,126 Q 112,128 108,126 L 98,120 L 98,160 Q 100,168 98,186 Q 96,192 92,192 L 86,186 L 80,186 L 74,186 L 68,192 Q 64,192 62,186 Q 60,168 62,160 L 62,120 L 52,126 Q 48,128 46,126 L 44,72 Q 44,64 52,60 L 68,54 Q 68,48 72,42 Q 68,36 70,28 Q 72,20 80,20 Z";

// ─── Color helpers ───────────────────────────────

function levelToColor(level: MuscleCoverage["level"]) {
  switch (level) {
    case "high":
      return "fill-green-500/70";
    case "medium":
      return "fill-amber-500/60";
    case "low":
      return "fill-red-400/50";
    case "none":
      return "fill-muted/30";
  }
}

function levelToBorder(level: MuscleCoverage["level"]) {
  switch (level) {
    case "high":
      return "stroke-green-500/40";
    case "medium":
      return "stroke-amber-500/40";
    case "low":
      return "stroke-red-400/40";
    case "none":
      return "stroke-muted-foreground/20";
  }
}

// ─── Component ───────────────────────────────────

interface BodyMapProps {
  programId: string;
}

export function BodyMap({ programId }: BodyMapProps) {
  const [coverage, setCoverage] = useState<MuscleCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  useEffect(() => {
    getProgramMuscleCoverage(programId)
      .then(setCoverage)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [programId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Analyzing muscle coverage...
      </div>
    );
  }

  // Build lookup from muscle name to coverage
  const coverageMap = new Map<string, MuscleCoverage>();
  for (const c of coverage) {
    coverageMap.set(c.name.toLowerCase(), c);
  }

  function getCoverage(region: MuscleRegion): MuscleCoverage {
    for (const name of region.muscleNames) {
      const match = coverageMap.get(name.toLowerCase());
      if (match) return match;
    }
    return { name: region.label, sets: 0, level: "none", exercises: [] };
  }

  const hoveredCoverage = hoveredMuscle
    ? coverage.find((c) => c.name === hoveredMuscle) ??
      MUSCLE_REGIONS.reduce<MuscleCoverage | null>((found, r) => {
        if (found) return found;
        if (r.label === hoveredMuscle) return getCoverage(r);
        return null;
      }, null)
    : null;

  return (
    <div className="space-y-4">
      {/* Body maps side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Front */}
        <div className="text-center">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Front
          </p>
          <svg
            viewBox="30 10 100 190"
            className="w-full max-w-[180px] mx-auto"
          >
            {/* Body outline */}
            <path
              d={BODY_OUTLINE_FRONT}
              className="fill-muted/10 stroke-muted-foreground/30"
              strokeWidth="1"
            />
            {/* Muscle regions */}
            {MUSCLE_REGIONS.filter((r) => r.view === "front").map((region) => {
              const c = getCoverage(region);
              return (
                <path
                  key={region.label}
                  d={region.path}
                  className={cn(
                    levelToColor(c.level),
                    levelToBorder(c.level),
                    "cursor-pointer transition-opacity",
                    hoveredMuscle && hoveredMuscle !== region.label && hoveredMuscle !== c.name
                      ? "opacity-40"
                      : "opacity-100"
                  )}
                  strokeWidth="0.5"
                  onMouseEnter={() =>
                    setHoveredMuscle(c.name || region.label)
                  }
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onTouchStart={() =>
                    setHoveredMuscle(c.name || region.label)
                  }
                />
              );
            })}
          </svg>
        </div>

        {/* Back */}
        <div className="text-center">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Back
          </p>
          <svg
            viewBox="30 10 100 190"
            className="w-full max-w-[180px] mx-auto"
          >
            <path
              d={BODY_OUTLINE_BACK}
              className="fill-muted/10 stroke-muted-foreground/30"
              strokeWidth="1"
            />
            {MUSCLE_REGIONS.filter((r) => r.view === "back").map((region) => {
              const c = getCoverage(region);
              return (
                <path
                  key={region.label}
                  d={region.path}
                  className={cn(
                    levelToColor(c.level),
                    levelToBorder(c.level),
                    "cursor-pointer transition-opacity",
                    hoveredMuscle && hoveredMuscle !== region.label && hoveredMuscle !== c.name
                      ? "opacity-40"
                      : "opacity-100"
                  )}
                  strokeWidth="0.5"
                  onMouseEnter={() =>
                    setHoveredMuscle(c.name || region.label)
                  }
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onTouchStart={() =>
                    setHoveredMuscle(c.name || region.label)
                  }
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Hovered detail tooltip */}
      {hoveredCoverage && (
        <div className="rounded-lg border border-border/50 bg-card p-3 text-center animate-in fade-in duration-150">
          <p className="text-sm font-medium">{hoveredCoverage.name}</p>
          <p className="text-xs text-muted-foreground">
            {hoveredCoverage.sets} weighted sets/week
          </p>
          {hoveredCoverage.exercises.length > 0 && (
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              {hoveredCoverage.exercises.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-green-500/70" />
          High (10+)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/60" />
          Medium (5-10)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-400/50" />
          Low (&lt;5)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-muted/40" />
          None
        </span>
      </div>

      {/* Coverage summary list */}
      {coverage.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Coverage Breakdown
          </p>
          <div className="grid grid-cols-2 gap-1">
            {coverage.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between rounded-md border border-border/30 px-2 py-1"
              >
                <span className="text-xs truncate">{c.name}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] px-1.5 py-0 shrink-0 ml-1",
                    c.level === "high" &&
                      "bg-green-500/10 text-green-600 border-green-500/30",
                    c.level === "medium" &&
                      "bg-amber-500/10 text-amber-600 border-amber-500/30",
                    c.level === "low" &&
                      "bg-red-400/10 text-red-500 border-red-400/30"
                  )}
                >
                  {c.sets}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {coverage.length === 0 && (
        <p className="text-center text-xs text-muted-foreground py-4">
          No muscle data available for exercises in this program. Add muscle
          group tags to your exercises for coverage analysis.
        </p>
      )}
    </div>
  );
}
