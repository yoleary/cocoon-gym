"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Loader2,
  Maximize2,
  Minimize2,
  Plus,
} from "lucide-react";
import { useLiveSessionStore } from "@/stores/live-session.store";
import { startSession, logSet, completeSession, abandonSession, addExerciseToSession } from "@/actions/session.actions";
import { getProgramById, getPrograms } from "@/actions/program.actions";
import { applyProgression } from "@/lib/progression";
import type { LiveExercise, LiveSet, PRRecord, RecordType, ProgressionType } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { SetLogger } from "@/components/workout/set-logger";
import { RestTimer } from "@/components/workout/rest-timer";
import { SessionControls } from "@/components/workout/session-controls";
import { PRCelebration } from "@/components/workout/pr-celebration";
import { SessionSummary } from "@/components/workout/session-summary";
import { PreviousPerformance } from "@/components/workout/previous-performance";
import { ExerciseAddSheet } from "@/components/workout/exercise-add-sheet";
import { FullscreenSetLogger } from "@/components/workout/fullscreen-set-logger";
import { ExerciseInfoPanel } from "@/components/workout/exercise-info-panel";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Page ───────────────────────────────────────

export default function LiveSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Store state
  const {
    sessionId,
    templateId,
    templateName,
    weekNumber,
    progressionType,
    totalWeeks,
    currentExerciseIndex,
    currentSetIndex,
    exercises,
    isResting,
    restTimeRemaining,
    sessionStartedAt,
    isPaused,
    initSession,
    setCurrentExercise,
    setCurrentSet,
    advanceToNextSet,
    updateSet,
    addSet,
    completeSet: markSetComplete,
    startRest,
    tickRest,
    stopRest,
    adjustRestTime,
    togglePause,
    clearSession,
  } = useLiveSessionStore();

  // Local UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    totalVolume: number;
    durationSeconds: number;
    exercisesCompleted: number;
    setsCompleted: number;
    prs: PRRecord[];
  } | null>(null);
  const [currentPR, setCurrentPR] = useState<{
    exerciseName: string;
    recordType: RecordType;
    value: number;
  } | null>(null);

  // Fullscreen set logger mode (default on mobile)
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  // Touch / swipe support
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile and enable fullscreen mode by default
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      setIsFullscreenMode(isMobile);
    }
  }, []);

  // ── Initialize session ────────────────────────

  useEffect(() => {
    async function init() {
      try {
        // Check if we already have an active session in the store
        if (sessionId && exercises.length > 0) {
          setLoading(false);
          return;
        }

        // Get templateId or quick param from search params for a new session
        const newTemplateId = searchParams.get("templateId");
        const isQuickWorkout = searchParams.get("quick") === "true";

        if (!newTemplateId && !isQuickWorkout) {
          // If no templateId and no existing session, redirect
          if (!sessionId) {
            router.push("/portal/workouts");
            return;
          }
          setLoading(false);
          return;
        }

        // Handle Quick Workout - no template
        if (isQuickWorkout && !newTemplateId) {
          const result = await startSession(null);
          const newSessionId = result.sessionId;

          // Init the store with empty exercises
          initSession({
            sessionId: newSessionId,
            templateId: null,
            templateName: "Quick Workout",
            weekNumber: null,
            progressionType: null,
            totalWeeks: null,
            exercises: [],
          });

          // Update URL to the actual session ID
          router.replace(`/portal/workouts/live/${newSessionId}`);
          setLoading(false);
          return;
        }

        // Start a new session via server action (with template)
        const result = await startSession(newTemplateId);
        const newSessionId = result.sessionId;
        const sessionExercises = result.sessionExercises;
        const serverWeekNumber = result.weekNumber;
        const serverProgressionType = result.progressionType;
        const serverTotalWeeks = result.totalWeeks;
        const exerciseBaselines = result.exerciseBaselines;

        // Load the template exercises
        const programs = await getPrograms();
        let fullTemplate: any = null;
        let progName: string | null = null;

        for (const prog of programs) {
          const tmpl = prog.templates.find((t) => t.id === newTemplateId);
          if (tmpl) {
            const fullProgram = await getProgramById(prog.id);
            fullTemplate = fullProgram.templates.find(
              (t) => t.id === newTemplateId
            );
            progName = prog.name;
            break;
          }
        }

        if (!fullTemplate) {
          setError("Could not load workout template.");
          setLoading(false);
          return;
        }

        // Build LiveExercise array from template data
        const liveExercises: LiveExercise[] = [];

        for (const block of fullTemplate.blocks) {
          for (const ex of block.exercises) {
            let targetSets = ex.targetSets ?? 3;
            let targetReps = ex.targetReps ?? "8-12";
            let targetWeight = ex.targetWeight ?? "";
            let restSeconds = ex.restSeconds ?? 90;
            let progressionNote: string | null = null;
            let suggestedWeightChange: string | null = null;
            let targetWeightKg: number | null = null;

            // Apply progression if applicable
            if (
              serverProgressionType !== "NONE" &&
              serverWeekNumber != null
            ) {
              const startingWeight =
                exerciseBaselines[ex.exerciseId] ?? null;
              const prog = applyProgression(
                {
                  targetSets,
                  targetReps,
                  targetWeight,
                  restSeconds,
                },
                serverWeekNumber,
                serverProgressionType as ProgressionType,
                serverTotalWeeks,
                startingWeight
              );
              targetSets = prog.targetSets;
              targetReps = prog.targetReps;
              targetWeight = prog.targetWeight;
              restSeconds = prog.restSeconds;
              progressionNote = prog.progressionNote;
              suggestedWeightChange = prog.suggestedWeightChange;
              targetWeightKg = prog.targetWeightKg;
            }

            const sets: LiveSet[] = Array.from(
              { length: targetSets },
              (_, i) => ({
                setNumber: i + 1,
                setType: "WORKING" as const,
                weight: targetWeightKg,
                reps: null,
                durationSeconds: null,
                rpe: null,
                completed: false,
              })
            );

            // Find the matching sessionExercise to get the DB ID
            const matchingSE = sessionExercises.find(
              (se) =>
                se.exerciseId === ex.exerciseId &&
                se.position === ex.position
            );

            liveExercises.push({
              sessionExerciseId: matchingSE?.id,
              exerciseId: ex.exerciseId,
              name: ex.exerciseName,
              position: ex.position,
              targetSets,
              targetReps,
              targetWeight,
              tempo: ex.tempo ?? null,
              restSeconds,
              notes: ex.notes ?? null,
              videoUrl: ex.videoUrl ?? null,
              isSuperset: block.isSuperset,
              supersetGroupLabel: block.isSuperset ? block.label : null,
              sets,
              previous: null,
              progressionNote,
              suggestedWeightChange,
              targetWeightKg,
            });
          }
        }

        // Init the store
        initSession({
          sessionId: newSessionId,
          templateId: newTemplateId,
          templateName: fullTemplate.name,
          weekNumber: serverWeekNumber,
          progressionType: serverProgressionType,
          totalWeeks: serverTotalWeeks,
          exercises: liveExercises,
        });

        // Update URL to the actual session ID
        router.replace(`/portal/workouts/live/${newSessionId}`);

        setLoading(false);
      } catch (err: any) {
        setError(err.message ?? "Failed to start session.");
        setLoading(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Current exercise ──────────────────────────

  const currentExercise = exercises[currentExerciseIndex] ?? null;

  // ── Navigation ────────────────────────────────

  const goToNextExercise = useCallback(() => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExercise(currentExerciseIndex + 1);
    }
  }, [currentExerciseIndex, exercises.length, setCurrentExercise]);

  const goToPrevExercise = useCallback(() => {
    if (currentExerciseIndex > 0) {
      setCurrentExercise(currentExerciseIndex - 1);
    }
  }, [currentExerciseIndex, setCurrentExercise]);

  // ── Touch/swipe handling ──────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;

      const diff = e.changedTouches[0].clientX - touchStartX.current;
      const threshold = 80;

      if (diff > threshold) {
        goToPrevExercise();
      } else if (diff < -threshold) {
        goToNextExercise();
      }

      touchStartX.current = null;
    },
    [goToNextExercise, goToPrevExercise]
  );

  // ── Set completion handler ────────────────────

  const handleCompleteSet = useCallback(
    (setIndex: number) => {
      markSetComplete(currentExerciseIndex, setIndex);

      const set = currentExercise?.sets[setIndex];
      if (set && !set.completed && currentExercise) {
        // Start rest timer after completing a set
        if (currentExercise.restSeconds > 0) {
          startRest(currentExercise.restSeconds);
        } else {
          // No rest timer - auto-advance to next set
          advanceToNextSet();
        }
      }
    },
    [currentExerciseIndex, currentExercise, markSetComplete, startRest, advanceToNextSet]
  );

  // ── Handle rest timer end - auto-advance ─────

  useEffect(() => {
    // When rest timer finishes, advance to next set
    if (!isResting && restTimeRemaining === 0) {
      // Small delay to ensure UI updates first
      const timer = setTimeout(() => {
        advanceToNextSet();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isResting, restTimeRemaining, advanceToNextSet]);

  // ── Abandon session handler ───────────────────

  const handleAbandonSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await abandonSession(sessionId);
      clearSession();
      router.push("/portal/workouts");
    } catch (err: any) {
      setError(err.message ?? "Failed to abandon session.");
    }
  }, [sessionId, clearSession, router]);

  // ── Finish session handler ────────────────────

  const handleFinishSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Log all completed sets to the server
      for (const exercise of exercises) {
        if (!exercise.sessionExerciseId) continue;
        for (const set of exercise.sets) {
          if (set.completed && !set.id) {
            await logSet(exercise.sessionExerciseId, {
              setNumber: set.setNumber,
              setType: set.setType,
              weight: set.weight,
              reps: set.reps,
              rpe: set.rpe,
              durationSeconds: set.durationSeconds,
            });
          }
        }
      }

      // Complete the session
      const result = await completeSession(sessionId);

      // Compute summary
      const completedExercises = exercises.filter((ex) =>
        ex.sets.some((s) => s.completed)
      ).length;
      const completedSets = exercises.reduce(
        (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
        0
      );

      setSummaryData({
        totalVolume: result.totalVolume,
        durationSeconds: result.duration,
        exercisesCompleted: completedExercises,
        setsCompleted: completedSets,
        prs: [],
      });

      setIsFinished(true);
      clearSession();
    } catch (err: any) {
      setError(err.message ?? "Failed to complete session.");
    }
  }, [sessionId, exercises, clearSession]);

  // ── Loading state ─────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading workout...</p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Dumbbell className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/portal/workouts">Back to Workouts</Link>
        </Button>
      </div>
    );
  }

  // ── Finished state ────────────────────────────

  if (isFinished && summaryData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <SessionSummary
          totalVolume={summaryData.totalVolume}
          durationSeconds={summaryData.durationSeconds}
          exercisesCompleted={summaryData.exercisesCompleted}
          setsCompleted={summaryData.setsCompleted}
          prs={summaryData.prs}
          sessionId={sessionId}
          onStartAnother={() => router.push("/portal/workouts")}
        />
      </div>
    );
  }

  // ── Quick workout - no exercises yet ───────────

  const isQuickWorkout = templateId === null;

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col min-h-[60vh]">
        {/* Top bar for quick workout */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold">
                {templateName ?? "Quick Workout"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Add exercises to get started
              </p>
            </div>
            <SessionControls
              sessionStartedAt={sessionStartedAt}
              isPaused={isPaused}
              onTogglePause={togglePause}
              onFinish={handleFinishSession}
              onAbandon={handleAbandonSession}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-4">
          <Dumbbell className="h-12 w-12 text-muted-foreground/30" />
          <div className="text-center">
            <p className="text-sm font-medium mb-1">No exercises yet</p>
            <p className="text-xs text-muted-foreground">
              Add exercises to build your workout
            </p>
          </div>
          <div className="w-full max-w-sm">
            <ExerciseAddSheet sessionId={sessionId} />
          </div>
        </div>
      </div>
    );
  }

  // ── Active session UI ─────────────────────────

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col min-h-[calc(100vh-7rem)] md:min-h-[calc(100vh-5rem)]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* PR Celebration overlay */}
      <PRCelebration
        pr={currentPR}
        onDismiss={() => setCurrentPR(null)}
      />

      {/* Rest Timer overlay */}
      {isResting && (
        <RestTimer
          remaining={restTimeRemaining}
          total={currentExercise.restSeconds}
          onTick={tickRest}
          onAdjust={adjustRestTime}
          onSkip={stopRest}
        />
      )}

      {/* Fullscreen Set Logger overlay (mobile) */}
      {isFullscreenMode && !isResting && currentExercise && (
        <FullscreenSetLogger
          exercise={currentExercise}
          exerciseIndex={currentExerciseIndex}
          setIndex={currentSetIndex}
          totalExercises={exercises.length}
          onUpdate={(data) => updateSet(currentExerciseIndex, currentSetIndex, data)}
          onComplete={() => handleCompleteSet(currentSetIndex)}
          onNext={() => advanceToNextSet()}
          onPrev={() => {
            if (currentSetIndex > 0) {
              setCurrentSet(currentSetIndex - 1);
            } else if (currentExerciseIndex > 0) {
              setCurrentExercise(currentExerciseIndex - 1);
            }
          }}
          onClose={() => setIsFullscreenMode(false)}
          onSetChange={setCurrentSet}
          onExerciseChange={setCurrentExercise}
          previous={currentExercise.previous}
          previousSetInWorkout={currentSetIndex > 0 ? currentExercise.sets[currentSetIndex - 1] : null}
        />
      )}

      {/* Top bar: session info + controls */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm px-4 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2">
            <div>
              <h1 className="truncate text-sm font-semibold">
                {templateName ?? "Workout"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </p>
            </div>
            {weekNumber != null && totalWeeks != null && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Week {weekNumber}/{totalWeeks}
              </Badge>
            )}
          </div>
          <SessionControls
            sessionStartedAt={sessionStartedAt}
            isPaused={isPaused}
            onTogglePause={togglePause}
            onFinish={handleFinishSession}
            onAbandon={handleAbandonSession}
          />
        </div>
      </div>

      {/* Exercise navigation sidebar (scrollable list) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: exercise list (hidden on mobile) */}
        <div className="hidden md:flex md:flex-col w-64 shrink-0 border-r overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {exercises.map((exercise, index) => (
              <ExerciseCard
                key={`${exercise.exerciseId}-${index}`}
                exercise={exercise}
                index={index + 1}
                isActive={index === currentExerciseIndex}
                onSelect={() => setCurrentExercise(index)}
              />
            ))}
          </div>
          {/* Add exercise button in sidebar */}
          <div className="p-2 border-t">
            <ExerciseAddSheet sessionId={sessionId} />
          </div>
        </div>

        {/* Main content: current exercise detail + set logger */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4 max-w-2xl mx-auto">
            {/* Current exercise header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="font-mono text-xs tabular-nums"
                >
                  {currentExercise.position}
                </Badge>
                <h2 className="text-lg font-bold">{currentExercise.name}</h2>
                <ExerciseInfoPanel
                  exerciseId={currentExercise.exerciseId}
                  exerciseName={currentExercise.name}
                  trainerNotes={currentExercise.notes}
                />
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {currentExercise.targetSets} x {currentExercise.targetReps}
                </span>
                {currentExercise.targetWeight && (
                  <span className="font-medium text-foreground/70">
                    {currentExercise.targetWeight}
                  </span>
                )}
                {currentExercise.tempo && (
                  <span>Tempo: {currentExercise.tempo}</span>
                )}
                {currentExercise.restSeconds > 0 && (
                  <span>{currentExercise.restSeconds}s rest</span>
                )}
                {currentExercise.isSuperset &&
                  currentExercise.supersetGroupLabel && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      Superset {currentExercise.supersetGroupLabel}
                    </Badge>
                  )}
              </div>

              {currentExercise.progressionNote && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-primary/80">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60" />
                  {currentExercise.progressionNote}
                  {currentExercise.targetWeightKg != null && (
                    <span className="font-medium">
                      — Target: {currentExercise.targetWeightKg} kg
                    </span>
                  )}
                  {currentExercise.suggestedWeightChange &&
                    currentExercise.targetWeightKg == null && (
                      <span className="font-medium">
                        — {currentExercise.suggestedWeightChange}
                      </span>
                    )}
                </div>
              )}

              {currentExercise.notes && (
                <p className="mt-2 text-xs text-muted-foreground/80 italic rounded-md border border-dashed p-2">
                  {currentExercise.notes}
                </p>
              )}
            </div>

            {/* Previous performance */}
            {currentExercise.previous && (
              <PreviousPerformance previous={currentExercise.previous} />
            )}

            {/* Set logger rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sets</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {currentExercise.sets.filter((s) => s.completed).length}/
                  {currentExercise.sets.length} completed
                </span>
              </div>

              {currentExercise.sets.map((set, setIndex) => (
                <SetLogger
                  key={setIndex}
                  set={set}
                  setIndex={setIndex}
                  previous={currentExercise.previous}
                  previousSetInWorkout={setIndex > 0 ? currentExercise.sets[setIndex - 1] : null}
                  targetWeight={currentExercise.targetWeightKg}
                  targetReps={currentExercise.targetReps}
                  onUpdate={(data) =>
                    updateSet(currentExerciseIndex, setIndex, data)
                  }
                  onComplete={() => handleCompleteSet(setIndex)}
                />
              ))}

              {/* Add set button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => addSet(currentExerciseIndex)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Set
              </Button>
            </div>

            {/* Add exercise button (mobile only) */}
            <div className="md:hidden pt-4">
              <ExerciseAddSheet sessionId={sessionId} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation (mobile) */}
      <div className="sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur-sm px-4 py-2 md:hidden">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 touch-manipulation"
            onClick={goToPrevExercise}
            disabled={currentExerciseIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          {/* Exercise dots indicator */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] px-2">
            {exercises.map((ex, i) => {
              const completedSets = ex.sets.filter((s) => s.completed).length;
              const isComplete = completedSets === ex.sets.length && ex.sets.length > 0;
              const hasProgress = completedSets > 0;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentExercise(i)}
                  className={cn(
                    "h-2 w-2 rounded-full shrink-0 transition-all touch-manipulation",
                    i === currentExerciseIndex
                      ? "h-2.5 w-2.5 bg-primary"
                      : isComplete
                        ? "bg-green-500"
                        : hasProgress
                          ? "bg-amber-500"
                          : "bg-muted-foreground/30"
                  )}
                  aria-label={`Exercise ${i + 1}`}
                />
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1 touch-manipulation"
            onClick={goToNextExercise}
            disabled={currentExerciseIndex === exercises.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Fullscreen toggle */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 touch-manipulation"
            onClick={() => setIsFullscreenMode(true)}
            aria-label="Enter fullscreen mode"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
