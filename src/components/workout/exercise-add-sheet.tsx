"use client";

import { useState, useCallback, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { getExercises } from "@/actions/exercise.actions";
import { addExerciseToSession } from "@/actions/session.actions";
import { useLiveSessionStore } from "@/stores/live-session.store";
import type { LiveExercise, LiveSet } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExercisePicker, type PickerExercise } from "@/components/workout/exercise-picker";

interface ExerciseAddSheetProps {
  sessionId: string;
  defaultSets?: number;
  defaultRestSeconds?: number;
}

export function ExerciseAddSheet({
  sessionId,
  defaultSets = 3,
  defaultRestSeconds = 90,
}: ExerciseAddSheetProps) {
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState<PickerExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addExercise = useLiveSessionStore((s) => s.addExercise);
  const setCurrentExercise = useLiveSessionStore((s) => s.setCurrentExercise);
  const storeExercises = useLiveSessionStore((s) => s.exercises);

  // Load exercises when sheet opens
  useEffect(() => {
    if (!open) return;

    async function load() {
      setLoading(true);
      try {
        const result = await getExercises({ pageSize: 500 });
        setExercises(
          result.exercises.map((ex) => ({
            id: ex.id,
            name: ex.name,
            bodyRegion: ex.bodyRegion,
            movementPattern: ex.movementPattern,
            equipment: ex.equipment,
            isCompound: ex.isCompound,
          }))
        );
      } catch (error) {
        console.error("Failed to load exercises:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open]);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedId(ids[0] ?? null);
  }, []);

  const handleAddExercise = useCallback(async () => {
    if (!selectedId) return;

    setAdding(true);
    try {
      // Call server action to add exercise to session
      const result = await addExerciseToSession(sessionId, selectedId);

      // Build LiveExercise for store
      const sets: LiveSet[] = Array.from({ length: defaultSets }, (_, i) => ({
        setNumber: i + 1,
        setType: "WORKING" as const,
        weight: null,
        reps: null,
        durationSeconds: null,
        rpe: null,
        completed: false,
      }));

      const liveExercise: LiveExercise = {
        sessionExerciseId: result.sessionExerciseId,
        exerciseId: result.exerciseId,
        name: result.exerciseName,
        position: result.position,
        targetSets: defaultSets,
        targetReps: "8-12",
        targetWeight: "",
        tempo: null,
        restSeconds: defaultRestSeconds,
        notes: null,
        videoUrl: null,
        isSuperset: false,
        supersetGroupLabel: null,
        sets,
        previous: null,
        progressionNote: null,
        suggestedWeightChange: null,
        targetWeightKg: null,
      };

      // Add to store
      addExercise(liveExercise);

      // Navigate to the new exercise
      const newIndex = storeExercises.length; // Will be the index after adding
      setCurrentExercise(newIndex);

      // Reset and close
      setSelectedId(null);
      setOpen(false);
    } catch (error) {
      console.error("Failed to add exercise:", error);
    } finally {
      setAdding(false);
    }
  }, [
    selectedId,
    sessionId,
    defaultSets,
    defaultRestSeconds,
    addExercise,
    setCurrentExercise,
    storeExercises.length,
  ]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-1.5 w-full touch-manipulation">
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle>Add Exercise</SheetTitle>
          <SheetDescription>
            Choose an exercise to add to your workout
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ExercisePicker
              exercises={exercises}
              selected={selectedId ? [selectedId] : []}
              onSelectionChange={handleSelectionChange}
              singleSelect
              maxHeight="calc(85vh - 220px)"
            />
          )}
        </div>

        <div className="shrink-0 pt-4 border-t">
          <Button
            className="w-full h-12 text-base touch-manipulation"
            disabled={!selectedId || adding}
            onClick={handleAddExercise}
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Workout
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
