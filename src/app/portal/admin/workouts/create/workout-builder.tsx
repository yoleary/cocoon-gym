"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Dumbbell,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { createLibraryWorkout } from "@/actions/workout.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ───────────────────────────────────────

interface ExerciseEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  bodyRegion: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  notes: string;
}

interface BlockEntry {
  id: string;
  label: string;
  isSuperset: boolean;
  exercises: ExerciseEntry[];
}

// ─── Helpers ─────────────────────────────────────

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// ─── Main Component ──────────────────────────────

export function WorkoutBuilder() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [blocks, setBlocks] = useState<BlockEntry[]>([
    {
      id: generateId(),
      label: "Main",
      isSuperset: false,
      exercises: [],
    },
  ]);

  // Exercise picker dialog
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // ─── Block handlers ──────────────────────────────

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: generateId(),
        label: `Block ${prev.length + 1}`,
        isSuperset: false,
        exercises: [],
      },
    ]);
  };

  const removeBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const updateBlockLabel = (blockId: string, newLabel: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, label: newLabel } : b))
    );
  };

  const toggleSuperset = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, isSuperset: !b.isSuperset } : b
      )
    );
  };

  // ─── Exercise handlers ───────────────────────────

  const openExercisePicker = (blockId: string) => {
    setActiveBlockId(blockId);
    setExerciseDialogOpen(true);
  };

  const addExerciseToBlock = (exercise: {
    id: string;
    name: string;
    bodyRegion: string;
  }) => {
    if (!activeBlockId) return;

    setBlocks((prev) =>
      prev.map((b) =>
        b.id === activeBlockId
          ? {
              ...b,
              exercises: [
                ...b.exercises,
                {
                  id: generateId(),
                  exerciseId: exercise.id,
                  exerciseName: exercise.name,
                  bodyRegion: exercise.bodyRegion,
                  targetSets: 3,
                  targetReps: "8-12",
                  restSeconds: 90,
                  notes: "",
                },
              ],
            }
          : b
      )
    );

    setExerciseDialogOpen(false);
  };

  const removeExercise = (blockId: string, exerciseEntryId: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, exercises: b.exercises.filter((e) => e.id !== exerciseEntryId) }
          : b
      )
    );
  };

  const updateExercise = (
    blockId: string,
    exerciseEntryId: string,
    updates: Partial<ExerciseEntry>
  ) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              exercises: b.exercises.map((e) =>
                e.id === exerciseEntryId ? { ...e, ...updates } : e
              ),
            }
          : b
      )
    );
  };

  // ─── Validation ──────────────────────────────────

  const totalExercises = blocks.reduce((sum, b) => sum + b.exercises.length, 0);
  const canSave = name.trim().length > 0 && totalExercises > 0;

  // ─── Submit ──────────────────────────────────────

  const handleCreate = async () => {
    setSaving(true);
    try {
      const workoutData = {
        name: name.trim(),
        blocks: blocks.map((b, bIdx) => ({
          label: b.label,
          order: bIdx,
          isSuperset: b.isSuperset,
          exercises: b.exercises.map((e, eIdx) => ({
            exerciseId: e.exerciseId,
            position: `${String.fromCharCode(65 + bIdx)}${eIdx + 1}`,
            order: eIdx,
            targetSets: e.targetSets,
            targetReps: e.targetReps,
            restSeconds: e.restSeconds,
            notes: e.notes || undefined,
          })),
        })),
      };

      await createLibraryWorkout(workoutData);
      router.push("/portal/admin/workouts");
    } catch (err: any) {
      alert(err.message ?? "Failed to create workout");
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/portal/admin/workouts">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Library
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Workout</h1>
        <p className="text-sm text-muted-foreground">
          Build a reusable workout template for your library.
        </p>
      </div>

      {/* Workout name */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Workout Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Push Day, Leg Day, Full Body A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocks and exercises */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Exercises</CardTitle>
          <CardDescription>
            Add exercises organized into blocks. Use supersets to group exercises done back-to-back.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {blocks.map((block, bIdx) => (
            <div key={block.id} className="space-y-2 rounded-lg border border-border/50 p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={block.label}
                  onChange={(e) => updateBlockLabel(block.id, e.target.value)}
                  className="h-7 text-xs w-32"
                  placeholder="Block name"
                />
                <Button
                  variant={block.isSuperset ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => toggleSuperset(block.id)}
                >
                  Superset
                </Button>
                {blocks.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive ml-auto"
                    onClick={() => removeBlock(block.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Exercises in block */}
              <div className="space-y-1.5">
                {block.exercises.map((ex, eIdx) => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-2 rounded-md border border-border/50 p-2"
                  >
                    <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                      {String.fromCharCode(65 + bIdx)}{eIdx + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {ex.exerciseName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {ex.bodyRegion.replace("_", " ")}
                      </span>
                    </div>
                    <Input
                      type="number"
                      value={ex.targetSets}
                      onChange={(e) =>
                        updateExercise(block.id, ex.id, {
                          targetSets: parseInt(e.target.value) || 3,
                        })
                      }
                      className="w-12 h-7 text-xs text-center"
                      title="Sets"
                    />
                    <span className="text-xs text-muted-foreground">x</span>
                    <Input
                      value={ex.targetReps}
                      onChange={(e) =>
                        updateExercise(block.id, ex.id, {
                          targetReps: e.target.value,
                        })
                      }
                      className="w-16 h-7 text-xs text-center"
                      placeholder="reps"
                      title="Reps"
                    />
                    <Input
                      type="number"
                      value={ex.restSeconds}
                      onChange={(e) =>
                        updateExercise(block.id, ex.id, {
                          restSeconds: parseInt(e.target.value) || 60,
                        })
                      }
                      className="w-14 h-7 text-xs text-center"
                      title="Rest (sec)"
                    />
                    <span className="text-[10px] text-muted-foreground">s</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive shrink-0"
                      onClick={() => removeExercise(block.id, ex.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => openExercisePicker(block.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Exercise
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={addBlock}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Block
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/portal/admin/workouts">Cancel</Link>
        </Button>
        <Button onClick={handleCreate} disabled={saving || !canSave}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-1" />
          )}
          Save Workout
        </Button>
      </div>

      {/* Exercise Picker Dialog */}
      <ExercisePickerDialog
        open={exerciseDialogOpen}
        onClose={() => setExerciseDialogOpen(false)}
        onSelect={addExerciseToBlock}
      />
    </div>
  );
}

// ─── Exercise Picker Dialog ──────────────────────

function ExercisePickerDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: { id: string; name: string; bodyRegion: string }) => void;
}) {
  const [search, setSearch] = useState("");
  const [bodyRegion, setBodyRegion] = useState<string>("all");
  const [exercises, setExercises] = useState<
    Array<{ id: string; name: string; bodyRegion: string; movementPattern: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("pageSize", "100");
      if (search) params.set("search", search);
      if (bodyRegion && bodyRegion !== "all") params.set("bodyRegion", bodyRegion);

      const res = await fetch(`/api/exercises?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch exercises");

      const data = await res.json();
      setExercises(
        data.exercises.map((e: any) => ({
          id: e.id,
          name: e.name,
          bodyRegion: e.bodyRegion,
          movementPattern: e.movementPattern,
        }))
      );
    } catch {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [search, bodyRegion]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (open) loadExercises();
  }, [open, debouncedSearch, bodyRegion, loadExercises]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={bodyRegion} onValueChange={setBodyRegion}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Body region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                <SelectItem value="UPPER_BODY">Upper Body</SelectItem>
                <SelectItem value="LOWER_BODY">Lower Body</SelectItem>
                <SelectItem value="CORE">Core</SelectItem>
                <SelectItem value="FULL_BODY">Full Body</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : exercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Dumbbell className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No exercises found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => onSelect(ex)}
                    className="w-full rounded-md border border-border/50 p-2 text-left hover:bg-accent/50 transition-colors"
                  >
                    <span className="font-medium text-sm">{ex.name}</span>
                    <div className="flex gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">
                        {ex.bodyRegion.replace("_", " ")}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {ex.movementPattern.replace("_", " ")}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
