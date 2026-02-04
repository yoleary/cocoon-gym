"use client";

import { useMemo, useState, useCallback } from "react";
import { Check, Dumbbell, Search, X } from "lucide-react";
import type { BodyRegion, MovementPattern } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// ─── Types ───────────────────────────────────────

export interface PickerExercise {
  id: string;
  name: string;
  bodyRegion: BodyRegion;
  movementPattern: MovementPattern;
  equipment: string[];
  isCompound: boolean;
}

interface ExercisePickerProps {
  exercises: PickerExercise[];
  /** Already-selected exercise IDs (controlled) */
  selected?: string[];
  /** Called when the selection changes */
  onSelectionChange?: (ids: string[]) => void;
  /** Single-select mode (default false) */
  singleSelect?: boolean;
  /** Max height for the scroll area (default "400px") */
  maxHeight?: string;
  className?: string;
}

// ─── Display helpers ─────────────────────────────

const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  UPPER_BODY: "Upper Body",
  LOWER_BODY: "Lower Body",
  CORE: "Core",
  FULL_BODY: "Full Body",
};

const BODY_REGION_COLORS: Record<BodyRegion, string> = {
  UPPER_BODY: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  LOWER_BODY: "bg-green-500/10 text-green-600 border-green-500/20",
  CORE: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  FULL_BODY: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const MOVEMENT_PATTERN_LABELS: Record<MovementPattern, string> = {
  HORIZONTAL_PUSH: "Horizontal Push",
  VERTICAL_PUSH: "Vertical Push",
  HORIZONTAL_PULL: "Horizontal Pull",
  VERTICAL_PULL: "Vertical Pull",
  HIP_HINGE: "Hip Hinge",
  SQUAT: "Squat",
  LUNGE: "Lunge",
  CARRY: "Carry",
  ROTATION: "Rotation",
  ANTI_ROTATION: "Anti-Rotation",
  ISOLATION: "Isolation",
  PLANK: "Plank",
  STRETCH: "Stretch",
};

// ─── Component ───────────────────────────────────

export function ExercisePicker({
  exercises,
  selected = [],
  onSelectionChange,
  singleSelect = false,
  maxHeight = "400px",
  className,
}: ExercisePickerProps) {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<BodyRegion | null>(null);
  const [patternFilter, setPatternFilter] = useState<MovementPattern | null>(null);

  // ── Derived data ────────────────────────────

  const availableRegions = useMemo(() => {
    const regions = new Set(exercises.map((e) => e.bodyRegion));
    return Array.from(regions).sort();
  }, [exercises]);

  const availablePatterns = useMemo(() => {
    const patterns = new Set(
      exercises
        .filter((e) => !regionFilter || e.bodyRegion === regionFilter)
        .map((e) => e.movementPattern)
    );
    return Array.from(patterns).sort();
  }, [exercises, regionFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return exercises.filter((ex) => {
      if (q && !ex.name.toLowerCase().includes(q)) return false;
      if (regionFilter && ex.bodyRegion !== regionFilter) return false;
      if (patternFilter && ex.movementPattern !== patternFilter) return false;
      return true;
    });
  }, [exercises, search, regionFilter, patternFilter]);

  // Group by movement pattern for hierarchy
  const grouped = useMemo(() => {
    const map = new Map<MovementPattern, PickerExercise[]>();
    for (const ex of filtered) {
      const list = map.get(ex.movementPattern) ?? [];
      list.push(ex);
      map.set(ex.movementPattern, list);
    }
    return map;
  }, [filtered]);

  // ── Selection handlers ──────────────────────

  const isSelected = useCallback(
    (id: string) => selected.includes(id),
    [selected]
  );

  const toggleExercise = useCallback(
    (id: string) => {
      if (!onSelectionChange) return;

      if (singleSelect) {
        onSelectionChange(isSelected(id) ? [] : [id]);
        return;
      }

      onSelectionChange(
        isSelected(id) ? selected.filter((s) => s !== id) : [...selected, id]
      );
    },
    [selected, isSelected, singleSelect, onSelectionChange]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setRegionFilter(null);
    setPatternFilter(null);
  }, []);

  const hasActiveFilters = search || regionFilter || patternFilter;

  // ── Render ──────────────────────────────────

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 pr-8"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Body region filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {availableRegions.map((region) => (
          <Button
            key={region}
            variant={regionFilter === region ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setRegionFilter(regionFilter === region ? null : region);
              setPatternFilter(null); // Reset sub-filter
            }}
          >
            {BODY_REGION_LABELS[region]}
          </Button>
        ))}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Movement pattern sub-filter (when a region is selected) */}
      {regionFilter && availablePatterns.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {availablePatterns.map((pattern) => (
            <Button
              key={pattern}
              variant={patternFilter === pattern ? "secondary" : "ghost"}
              size="sm"
              className="h-6 text-[11px]"
              onClick={() =>
                setPatternFilter(patternFilter === pattern ? null : pattern)
              }
            >
              {MOVEMENT_PATTERN_LABELS[pattern]}
            </Button>
          ))}
        </div>
      )}

      {/* Selection count */}
      {selected.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selected.length} exercise{selected.length !== 1 ? "s" : ""} selected
        </div>
      )}

      {/* Exercise list */}
      <ScrollArea style={{ maxHeight }}>
        <div className="space-y-3 pr-3">
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Dumbbell className="mx-auto mb-2 h-8 w-8 opacity-30" />
              No exercises match your filters.
            </div>
          )}

          {Array.from(grouped.entries()).map(([pattern, items]) => (
            <div key={pattern}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                {MOVEMENT_PATTERN_LABELS[pattern]}
              </p>

              <div className="space-y-1">
                {items.map((exercise) => {
                  const checked = isSelected(exercise.id);

                  return (
                    <button
                      key={exercise.id}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors touch-manipulation",
                        checked
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:bg-accent/50"
                      )}
                      onClick={() => toggleExercise(exercise.id)}
                    >
                      {/* Check indicator */}
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </div>

                      {/* Exercise info */}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {exercise.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0 leading-4",
                              BODY_REGION_COLORS[exercise.bodyRegion]
                            )}
                          >
                            {BODY_REGION_LABELS[exercise.bodyRegion]}
                          </Badge>
                          {exercise.equipment.map((eq) => (
                            <Badge
                              key={eq}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 leading-4"
                            >
                              {eq}
                            </Badge>
                          ))}
                          {exercise.isCompound && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 leading-4 border-orange-500/20 text-orange-600 bg-orange-500/5"
                            >
                              Compound
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Separator className="mt-3" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
