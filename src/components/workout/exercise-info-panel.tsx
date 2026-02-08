"use client";

import { useState, useCallback, useEffect } from "react";
import { Info, Play, Dumbbell, Target, AlertTriangle, Loader2 } from "lucide-react";
import { getExerciseById } from "@/actions/exercise.actions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Types ──────────────────────────────────────

interface ExerciseDetail {
  id: string;
  name: string;
  instructions: string | null;
  videoUrl: string | null;
  bodyRegion: string;
  movementPattern: string;
  isCompound: boolean;
  muscles: Array<{
    id: string;
    name: string;
    role: "PRIMARY" | "SECONDARY" | "STABILIZER";
  }>;
  equipment: Array<{
    id: string;
    name: string;
  }>;
}

// ─── Display helpers ────────────────────────────

const MUSCLE_ROLE_CONFIG = {
  PRIMARY: { label: "Primary", color: "bg-red-500/15 text-red-400 border-red-500/30" },
  SECONDARY: { label: "Secondary", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  STABILIZER: { label: "Stabilizer", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
} as const;

const BODY_REGION_LABELS: Record<string, string> = {
  UPPER_BODY: "Upper Body",
  LOWER_BODY: "Lower Body",
  CORE: "Core",
  FULL_BODY: "Full Body",
};

const MOVEMENT_PATTERN_LABELS: Record<string, string> = {
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

// ─── Video embed helper ─────────────────────────

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0`;

  return null;
}

// ─── Parse instructions into steps ──────────────

function parseInstructions(instructions: string): string[] {
  // Split on numbered patterns like "1." "2." or newlines
  const lines = instructions
    .split(/\n/)
    .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((line) => line.length > 0);

  return lines;
}

// ─── Props ──────────────────────────────────────

interface ExerciseInfoPanelProps {
  exerciseId: string;
  exerciseName: string;
  /** Trainer notes specific to this exercise in this workout */
  trainerNotes?: string | null;
  /** Compact trigger style for mobile fullscreen mode */
  compact?: boolean;
}

// ─── Component ──────────────────────────────────

export function ExerciseInfoPanel({
  exerciseId,
  exerciseName,
  trainerNotes,
  compact = false,
}: ExerciseInfoPanelProps) {
  const [open, setOpen] = useState(false);
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch exercise details when panel opens
  const fetchDetails = useCallback(async () => {
    if (exercise?.id === exerciseId) return; // Already loaded
    setLoading(true);
    setError(null);
    try {
      const data = await getExerciseById(exerciseId);
      setExercise(data as ExerciseDetail);
    } catch {
      setError("Could not load exercise details.");
    } finally {
      setLoading(false);
    }
  }, [exerciseId, exercise?.id]);

  // Reset when exerciseId changes
  useEffect(() => {
    setExercise(null);
  }, [exerciseId]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    fetchDetails();
  }, [fetchDetails]);

  // ── Derived data ────────────────────────────

  const primaryMuscles = exercise?.muscles.filter((m) => m.role === "PRIMARY") ?? [];
  const secondaryMuscles = exercise?.muscles.filter((m) => m.role === "SECONDARY") ?? [];
  const stabilizerMuscles = exercise?.muscles.filter((m) => m.role === "STABILIZER") ?? [];

  const embedUrl = exercise?.videoUrl ? getEmbedUrl(exercise.videoUrl) : null;
  const instructionSteps = exercise?.instructions
    ? parseInstructions(exercise.instructions)
    : [];

  return (
    <>
      {/* Trigger button */}
      {compact ? (
        <button
          type="button"
          onClick={handleOpen}
          className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors touch-manipulation py-1"
        >
          <Info className="h-4 w-4" />
          <span>How to</span>
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 touch-manipulation"
          onClick={handleOpen}
        >
          <Info className="h-4 w-4" />
          How to
        </Button>
      )}

      {/* Sheet panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-2xl px-0 pb-0"
        >
          <SheetHeader className="px-6 pb-2">
            <SheetTitle>{exerciseName}</SheetTitle>
            <SheetDescription className="sr-only">
              How to perform {exerciseName}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(85vh-5rem)] px-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {exercise && !loading && (
              <div className="space-y-6 pb-8">
                {/* Video embed */}
                {embedUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      src={embedUrl}
                      title={`${exercise.name} demonstration`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Direct video link fallback (non-embeddable URL) */}
                {exercise.videoUrl && !embedUrl && (
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Play className="h-5 w-5 shrink-0" />
                    <span>Watch demonstration video</span>
                  </a>
                )}

                {/* Classification badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {BODY_REGION_LABELS[exercise.bodyRegion] ?? exercise.bodyRegion}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {MOVEMENT_PATTERN_LABELS[exercise.movementPattern] ?? exercise.movementPattern}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {exercise.isCompound ? "Compound" : "Isolation"}
                  </Badge>
                </div>

                {/* Trainer notes (if provided) */}
                {trainerNotes && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Trainer Notes</span>
                    </div>
                    <p className="text-sm text-foreground/80">{trainerNotes}</p>
                  </div>
                )}

                {/* Step-by-step instructions */}
                {instructionSteps.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">How to Perform</h3>
                    <ol className="space-y-3">
                      {instructionSteps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-foreground/80 leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* No instructions fallback */}
                {instructionSteps.length === 0 && !exercise.videoUrl && (
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No instructions available yet for this exercise.
                    </p>
                  </div>
                )}

                {/* Muscles worked */}
                {exercise.muscles.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Muscles Worked</h3>
                    <div className="space-y-3">
                      {primaryMuscles.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Primary
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {primaryMuscles.map((m) => (
                              <Badge
                                key={m.id}
                                variant="outline"
                                className={cn("text-xs", MUSCLE_ROLE_CONFIG.PRIMARY.color)}
                              >
                                {m.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {secondaryMuscles.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Secondary
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {secondaryMuscles.map((m) => (
                              <Badge
                                key={m.id}
                                variant="outline"
                                className={cn("text-xs", MUSCLE_ROLE_CONFIG.SECONDARY.color)}
                              >
                                {m.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {stabilizerMuscles.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Stabilizers
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {stabilizerMuscles.map((m) => (
                              <Badge
                                key={m.id}
                                variant="outline"
                                className={cn("text-xs", MUSCLE_ROLE_CONFIG.STABILIZER.color)}
                              >
                                {m.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Equipment */}
                {exercise.equipment.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Equipment</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {exercise.equipment.map((eq) => (
                        <Badge key={eq.id} variant="outline" className="text-xs gap-1.5">
                          <Dumbbell className="h-3 w-3" />
                          {eq.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
