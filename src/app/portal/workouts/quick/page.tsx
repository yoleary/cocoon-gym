"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dices,
  Dumbbell,
  Flame,
  Loader2,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import {
  getExerciseSuggestions,
  generateRandomWorkout,
  type FocusArea,
} from "@/actions/exercise.actions";
import { startSession, addExerciseToSession } from "@/actions/session.actions";
import { useLiveSessionStore } from "@/stores/live-session.store";
import type { LiveExercise, LiveSet } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ─── Focus area config ───────────────────────────

const FOCUS_AREAS: Array<{
  id: FocusArea;
  label: string;
  description: string;
  icon: typeof Dumbbell;
  color: string;
  bgGradient: string;
}> = [
  {
    id: "PUSH",
    label: "Push",
    description: "Chest, shoulders, triceps",
    icon: ArrowRight,
    color: "text-blue-600",
    bgGradient: "from-blue-500/10 to-blue-600/5",
  },
  {
    id: "PULL",
    label: "Pull",
    description: "Back, biceps, rear delts",
    icon: ArrowLeft,
    color: "text-green-600",
    bgGradient: "from-green-500/10 to-green-600/5",
  },
  {
    id: "LEGS",
    label: "Legs",
    description: "Quads, hamstrings, glutes",
    icon: Flame,
    color: "text-orange-600",
    bgGradient: "from-orange-500/10 to-orange-600/5",
  },
  {
    id: "CORE",
    label: "Core",
    description: "Abs, obliques, lower back",
    icon: Target,
    color: "text-amber-600",
    bgGradient: "from-amber-500/10 to-amber-600/5",
  },
  {
    id: "FULL_BODY",
    label: "Full Body",
    description: "Mix of everything",
    icon: Zap,
    color: "text-purple-600",
    bgGradient: "from-purple-500/10 to-purple-600/5",
  },
];

// ─── Exercise type from suggestions ──────────────

type SuggestedExercise = {
  id: string;
  name: string;
  bodyRegion: string;
  movementPattern: string;
  isCompound: boolean;
  equipment: string[];
  frequency: number;
};

// ─── Page Component ──────────────────────────────

export default function QuickWorkoutPage() {
  const router = useRouter();
  const { initSession, addExercise } = useLiveSessionStore();

  // Step: "focus" or "exercises"
  const [step, setStep] = useState<"focus" | "exercises">("focus");
  const [selectedFocus, setSelectedFocus] = useState<FocusArea | null>(null);

  // Exercise data
  const [goTos, setGoTos] = useState<SuggestedExercise[]>([]);
  const [toTry, setToTry] = useState<SuggestedExercise[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Loading states
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [startingWorkout, setStartingWorkout] = useState(false);

  // ── Load exercises when focus is selected ────

  const loadExercises = useCallback(async (focus: FocusArea | null) => {
    setLoadingExercises(true);
    try {
      const result = await getExerciseSuggestions(focus ?? undefined);
      setGoTos(result.goTos);
      setToTry(result.toTry);

      // Pre-select top 3 go-tos and 2 new ones
      const preSelected = new Set<string>();
      result.goTos.slice(0, 3).forEach((ex) => preSelected.add(ex.id));
      result.toTry.slice(0, 2).forEach((ex) => preSelected.add(ex.id));
      setSelectedIds(preSelected);
    } catch (error) {
      console.error("Failed to load exercises:", error);
    } finally {
      setLoadingExercises(false);
    }
  }, []);

  // ── Handle focus selection ───────────────────

  const handleSelectFocus = useCallback(
    (focus: FocusArea) => {
      setSelectedFocus(focus);
      setStep("exercises");
      loadExercises(focus);
    },
    [loadExercises]
  );

  // ── Handle "Surprise Me" ─────────────────────

  const handleSurpriseMe = useCallback(async () => {
    setLoadingExercises(true);
    try {
      const exercises = await generateRandomWorkout(undefined, 5);
      setGoTos(exercises.filter((e) => e.frequency > 0));
      setToTry(exercises.filter((e) => e.frequency === 0));
      setSelectedIds(new Set(exercises.map((e) => e.id)));
      setSelectedFocus(null);
      setStep("exercises");
    } catch (error) {
      console.error("Failed to generate workout:", error);
    } finally {
      setLoadingExercises(false);
    }
  }, []);

  // ── Toggle exercise selection ────────────────

  const toggleExercise = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Start workout ────────────────────────────

  const handleStartWorkout = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setStartingWorkout(true);
    try {
      // Create session with no template
      const result = await startSession(null);
      const sessionId = result.sessionId;

      // Build exercises array for store
      const allExercises = [...goTos, ...toTry];
      const liveExercises: LiveExercise[] = [];

      // Add each selected exercise to session
      let order = 0;
      for (const id of selectedIds) {
        const ex = allExercises.find((e) => e.id === id);
        if (!ex) continue;

        const seResult = await addExerciseToSession(sessionId, id);

        const sets: LiveSet[] = Array.from({ length: 3 }, (_, i) => ({
          setNumber: i + 1,
          setType: "WORKING" as const,
          weight: null,
          reps: null,
          durationSeconds: null,
          rpe: null,
          completed: false,
        }));

        liveExercises.push({
          sessionExerciseId: seResult.sessionExerciseId,
          exerciseId: ex.id,
          name: ex.name,
          position: seResult.position,
          targetSets: 3,
          targetReps: "8-12",
          targetWeight: "",
          tempo: null,
          restSeconds: 90,
          notes: null,
          videoUrl: null,
          isSuperset: false,
          supersetGroupLabel: null,
          sets,
          previous: null,
          progressionNote: null,
          suggestedWeightChange: null,
          targetWeightKg: null,
          targetRpe: null,
        });

        order++;
      }

      // Init store
      initSession({
        sessionId,
        templateId: null,
        templateName: selectedFocus
          ? `Quick ${FOCUS_AREAS.find((f) => f.id === selectedFocus)?.label} Workout`
          : "Quick Workout",
        weekNumber: null,
        progressionType: null,
        totalWeeks: null,
        exercises: liveExercises,
      });

      // Navigate to live session
      router.push(`/portal/workouts/live/${sessionId}`);
    } catch (error) {
      console.error("Failed to start workout:", error);
      setStartingWorkout(false);
    }
  }, [selectedIds, goTos, toTry, selectedFocus, initSession, router]);

  // ── Render: Focus Selection ──────────────────

  if (step === "focus") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quick Workout</h1>
          <p className="text-sm text-muted-foreground">
            What do you want to train today?
          </p>
        </div>

        {/* Focus area tiles */}
        <div className="grid grid-cols-2 gap-3">
          {FOCUS_AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => handleSelectFocus(area.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-6 text-center transition-all touch-manipulation",
                  "hover:border-primary/50 hover:shadow-md active:scale-[0.98]",
                  `bg-gradient-to-br ${area.bgGradient}`,
                  "border-border/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full bg-background/80",
                    area.color
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{area.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {area.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Surprise Me button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full h-14 text-base gap-2 touch-manipulation"
          onClick={handleSurpriseMe}
          disabled={loadingExercises}
        >
          {loadingExercises ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Dices className="h-5 w-5" />
          )}
          Surprise Me
        </Button>

        {/* Back button */}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/portal/workouts")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workouts
        </Button>
      </div>
    );
  }

  // ── Render: Exercise Selection ───────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setStep("focus")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {selectedFocus
              ? FOCUS_AREAS.find((f) => f.id === selectedFocus)?.label
              : "Your"}{" "}
            Workout
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedIds.size} exercise{selectedIds.size !== 1 ? "s" : ""}{" "}
            selected
          </p>
        </div>
      </div>

      {loadingExercises ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Your Go-tos */}
          {goTos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Go-tos
                </h2>
              </div>
              <div className="grid gap-2">
                {goTos.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    selected={selectedIds.has(ex.id)}
                    onToggle={() => toggleExercise(ex.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Try These */}
          {toTry.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Try Something New
                </h2>
              </div>
              <div className="grid gap-2">
                {toTry.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    selected={selectedIds.has(ex.id)}
                    onToggle={() => toggleExercise(ex.id)}
                    isNew
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {goTos.length === 0 && toTry.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No exercises found for this focus area.
              </p>
            </div>
          )}
        </>
      )}

      {/* Start button */}
      <div className="sticky bottom-4 pt-4">
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold gap-2 touch-manipulation shadow-lg"
          disabled={selectedIds.size === 0 || startingWorkout}
          onClick={handleStartWorkout}
        >
          {startingWorkout ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Start Workout
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Exercise Card Component ─────────────────────

function ExerciseCard({
  exercise,
  selected,
  onToggle,
  isNew,
}: {
  exercise: SuggestedExercise;
  selected: boolean;
  onToggle: () => void;
  isNew?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 text-left transition-all touch-manipulation",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:bg-accent/50"
      )}
    >
      {/* Check indicator */}
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </div>

      {/* Exercise info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{exercise.name}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {exercise.equipment.slice(0, 2).map((eq) => (
            <Badge
              key={eq}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              {eq}
            </Badge>
          ))}
          {exercise.isCompound && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-orange-500/20 text-orange-600 bg-orange-500/5"
            >
              Compound
            </Badge>
          )}
          {isNew && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-purple-500/20 text-purple-600 bg-purple-500/5"
            >
              New
            </Badge>
          )}
        </div>
      </div>

      {/* Frequency indicator for go-tos */}
      {exercise.frequency > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {exercise.frequency}x
        </span>
      )}
    </button>
  );
}
