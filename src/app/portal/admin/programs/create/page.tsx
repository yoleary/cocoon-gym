"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  GripVertical,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { createProgram } from "@/actions/program.actions";
import { getExercises } from "@/actions/exercise.actions";
import { RoleGuard } from "@/components/portal/role-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
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

interface TemplateEntry {
  id: string;
  name: string;
  blocks: BlockEntry[];
}

type ProgressionType = "NONE" | "STRENGTH" | "HYPERTROPHY" | "ENDURANCE" | "LINEAR";

// ─── Constants ───────────────────────────────────

const PROGRESSION_OPTIONS: Array<{
  value: ProgressionType;
  label: string;
  description: string;
  defaultWeeks: number;
  defaultReps: string;
  defaultRest: number;
}> = [
  {
    value: "NONE",
    label: "None",
    description: "No auto-progression — targets stay the same each week",
    defaultWeeks: 6,
    defaultReps: "8-12",
    defaultRest: 90,
  },
  {
    value: "STRENGTH",
    label: "Strength",
    description: "Lower reps (8→4), heavier weight (+2.5%/wk), longer rest",
    defaultWeeks: 6,
    defaultReps: "6-8",
    defaultRest: 180,
  },
  {
    value: "HYPERTROPHY",
    label: "Hypertrophy",
    description: "Moderate reps (8-12), weight increases, +1 set halfway",
    defaultWeeks: 8,
    defaultReps: "8-12",
    defaultRest: 90,
  },
  {
    value: "ENDURANCE",
    label: "Endurance",
    description: "Higher reps increasing (12→18), shorter rest over time",
    defaultWeeks: 6,
    defaultReps: "12-15",
    defaultRest: 60,
  },
  {
    value: "LINEAR",
    label: "Linear",
    description: "Simple +2.5% weight each week, reps/sets unchanged",
    defaultWeeks: 6,
    defaultReps: "8-12",
    defaultRest: 90,
  },
];

const TEMPLATE_PRESETS = [
  { label: "Full Body (3 days)", days: ["Full Body A", "Full Body B", "Full Body C"] },
  { label: "Upper/Lower (4 days)", days: ["Upper A", "Lower A", "Upper B", "Lower B"] },
  { label: "Push/Pull/Legs (6 days)", days: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"] },
  { label: "Custom", days: [] },
];

// ─── Helpers ─────────────────────────────────────

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getDefaultsForProgression(type: ProgressionType) {
  return PROGRESSION_OPTIONS.find((p) => p.value === type) ?? PROGRESSION_OPTIONS[0];
}

// ─── Page Component ──────────────────────────────

export default function CreateProgramPage() {
  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <ProgramBuilder />
    </RoleGuard>
  );
}

function ProgramBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Program basics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weeks, setWeeks] = useState(6);
  const [progressionType, setProgressionType] = useState<ProgressionType>("NONE");

  // Step 2: Templates (workout days)
  const [templates, setTemplates] = useState<TemplateEntry[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Step 3: Exercise picker dialog
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // ─── Step 1 handlers ─────────────────────────────

  const handleProgressionChange = (value: ProgressionType) => {
    setProgressionType(value);
    const defaults = getDefaultsForProgression(value);
    setWeeks(defaults.defaultWeeks);
  };

  // ─── Step 2 handlers ─────────────────────────────

  const applyPreset = (presetLabel: string) => {
    const preset = TEMPLATE_PRESETS.find((p) => p.label === presetLabel);
    if (!preset || preset.days.length === 0) {
      setSelectedPreset(presetLabel);
      return;
    }

    setSelectedPreset(presetLabel);
    setTemplates(
      preset.days.map((dayName, idx) => ({
        id: generateId(),
        name: dayName,
        blocks: [
          {
            id: generateId(),
            label: "Main",
            isSuperset: false,
            exercises: [],
          },
        ],
      }))
    );
  };

  const addTemplate = () => {
    setTemplates((prev) => [
      ...prev,
      {
        id: generateId(),
        name: `Day ${prev.length + 1}`,
        blocks: [
          {
            id: generateId(),
            label: "Main",
            isSuperset: false,
            exercises: [],
          },
        ],
      },
    ]);
  };

  const removeTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const updateTemplateName = (templateId: string, newName: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === templateId ? { ...t, name: newName } : t))
    );
  };

  const moveTemplate = (templateId: string, direction: "up" | "down") => {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === templateId);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;

      const newArr = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
      return newArr;
    });
  };

  // ─── Block handlers ──────────────────────────────

  const addBlock = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? {
              ...t,
              blocks: [
                ...t.blocks,
                {
                  id: generateId(),
                  label: `Block ${t.blocks.length + 1}`,
                  isSuperset: false,
                  exercises: [],
                },
              ],
            }
          : t
      )
    );
  };

  const removeBlock = (templateId: string, blockId: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? { ...t, blocks: t.blocks.filter((b) => b.id !== blockId) }
          : t
      )
    );
  };

  const updateBlockLabel = (templateId: string, blockId: string, newLabel: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? {
              ...t,
              blocks: t.blocks.map((b) =>
                b.id === blockId ? { ...b, label: newLabel } : b
              ),
            }
          : t
      )
    );
  };

  const toggleSuperset = (templateId: string, blockId: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? {
              ...t,
              blocks: t.blocks.map((b) =>
                b.id === blockId ? { ...b, isSuperset: !b.isSuperset } : b
              ),
            }
          : t
      )
    );
  };

  // ─── Exercise handlers ───────────────────────────

  const openExercisePicker = (templateId: string, blockId: string) => {
    setActiveTemplateId(templateId);
    setActiveBlockId(blockId);
    setExerciseDialogOpen(true);
  };

  const addExerciseToBlock = (exercise: {
    id: string;
    name: string;
    bodyRegion: string;
  }) => {
    if (!activeTemplateId || !activeBlockId) return;

    const defaults = getDefaultsForProgression(progressionType);

    setTemplates((prev) =>
      prev.map((t) =>
        t.id === activeTemplateId
          ? {
              ...t,
              blocks: t.blocks.map((b) =>
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
                          targetReps: defaults.defaultReps,
                          restSeconds: defaults.defaultRest,
                          notes: "",
                        },
                      ],
                    }
                  : b
              ),
            }
          : t
      )
    );

    setExerciseDialogOpen(false);
  };

  const removeExercise = (templateId: string, blockId: string, exerciseEntryId: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? {
              ...t,
              blocks: t.blocks.map((b) =>
                b.id === blockId
                  ? { ...b, exercises: b.exercises.filter((e) => e.id !== exerciseEntryId) }
                  : b
              ),
            }
          : t
      )
    );
  };

  const updateExercise = (
    templateId: string,
    blockId: string,
    exerciseEntryId: string,
    updates: Partial<ExerciseEntry>
  ) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? {
              ...t,
              blocks: t.blocks.map((b) =>
                b.id === blockId
                  ? {
                      ...b,
                      exercises: b.exercises.map((e) =>
                        e.id === exerciseEntryId ? { ...e, ...updates } : e
                      ),
                    }
                  : b
              ),
            }
          : t
      )
    );
  };

  // ─── Navigation ──────────────────────────────────

  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = templates.length > 0;
  const totalExercises = templates.reduce(
    (sum, t) => sum + t.blocks.reduce((bSum, b) => bSum + b.exercises.length, 0),
    0
  );
  const canProceedStep3 = totalExercises > 0;

  // ─── Submit ──────────────────────────────────────

  const handleCreate = async () => {
    setSaving(true);
    try {
      const programData = {
        name: name.trim(),
        description: description.trim() || undefined,
        weeks,
        progressionType,
        templates: templates.map((t, tIdx) => ({
          name: t.name,
          order: tIdx,
          blocks: t.blocks.map((b, bIdx) => ({
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
        })),
      };

      await createProgram(programData);
      router.push("/portal/admin/programs");
    } catch (err: any) {
      alert(err.message ?? "Failed to create program");
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link href="/portal/admin/programs">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Programs
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create Program</h1>
          <p className="text-sm text-muted-foreground">
            Build a training program for your clients
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s < step) setStep(s);
              }}
              disabled={s > step}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                    ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </button>
            {s < 4 && (
              <div
                className={`h-0.5 w-8 ${s < step ? "bg-primary/40" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {step === 1 && "Program Details"}
          {step === 2 && "Workout Days"}
          {step === 3 && "Add Exercises"}
          {step === 4 && "Review & Create"}
        </span>
      </div>

      {/* Step 1: Program Details */}
      {step === 1 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Program Details</CardTitle>
            <CardDescription>
              Set the basic info and progression style for this program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Beginner Strength 6-Week"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeks">Duration (weeks)</Label>
                <Input
                  id="weeks"
                  type="number"
                  min={1}
                  max={52}
                  value={weeks}
                  onChange={(e) => setWeeks(parseInt(e.target.value) || 6)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe the program goals and who it's for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label>Progression Type</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {PROGRESSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleProgressionChange(opt.value)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      progressionType === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-border"
                    }`}
                  >
                    <span className="font-medium text-sm">{opt.label}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {opt.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                Next: Workout Days
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Workout Days */}
      {step === 2 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Workout Days</CardTitle>
            <CardDescription>
              Add the workout templates (days) for this program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Presets */}
            <div className="space-y-2">
              <Label>Quick Start (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={selectedPreset === preset.label ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyPreset(preset.label)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Templates list */}
            <div className="space-y-3">
              {templates.map((template, idx) => (
                <div
                  key={template.id}
                  className="rounded-lg border border-border/50 p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveTemplate(template.id, "up")}
                        disabled={idx === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => moveTemplate(template.id, "down")}
                        disabled={idx === templates.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      Day {idx + 1}
                    </Badge>
                    <Input
                      value={template.name}
                      onChange={(e) => updateTemplateName(template.id, e.target.value)}
                      className="flex-1 h-8"
                      placeholder="Workout name"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addTemplate} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Workout Day
              </Button>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
                Next: Add Exercises
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add Exercises */}
      {step === 3 && (
        <div className="space-y-4">
          {templates.map((template, tIdx) => (
            <Card key={template.id} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    Day {tIdx + 1}
                  </Badge>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.blocks.map((block, bIdx) => (
                  <div key={block.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={block.label}
                        onChange={(e) =>
                          updateBlockLabel(template.id, block.id, e.target.value)
                        }
                        className="h-7 text-xs w-32"
                        placeholder="Block name"
                      />
                      <Button
                        variant={block.isSuperset ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toggleSuperset(template.id, block.id)}
                      >
                        Superset
                      </Button>
                      {template.blocks.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeBlock(template.id, block.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Exercises in block */}
                    <div className="ml-4 space-y-1.5">
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
                              updateExercise(template.id, block.id, ex.id, {
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
                              updateExercise(template.id, block.id, ex.id, {
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
                              updateExercise(template.id, block.id, ex.id, {
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
                            onClick={() => removeExercise(template.id, block.id, ex.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => openExercisePicker(template.id, block.id)}
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
                  className="h-7 text-xs"
                  onClick={() => addBlock(template.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Block
                </Button>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button onClick={() => setStep(4)} disabled={!canProceedStep3}>
              Next: Review
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
            <CardDescription>
              Confirm your program details before creating
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs text-muted-foreground">Program Name</span>
                <p className="font-medium">{name}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Duration</span>
                <p className="font-medium">{weeks} weeks</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Progression</span>
                <p className="font-medium">{progressionType}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Workout Days</span>
                <p className="font-medium">{templates.length}</p>
              </div>
            </div>

            {description && (
              <div>
                <span className="text-xs text-muted-foreground">Description</span>
                <p className="text-sm">{description}</p>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <span className="text-sm font-medium">Workouts Summary</span>
              {templates.map((t, idx) => (
                <div key={t.id} className="rounded-md border border-border/50 p-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      Day {idx + 1}
                    </Badge>
                    <span className="font-medium text-sm">{t.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {t.blocks.reduce((sum, b) => sum + b.exercises.length, 0)} exercises
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Create Program
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
      const filters: any = { pageSize: 100 };
      if (search) filters.search = search;
      if (bodyRegion && bodyRegion !== "all") filters.bodyRegion = bodyRegion;

      const result = await getExercises(filters);
      setExercises(
        result.exercises.map((e) => ({
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

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reload when dialog opens or filters change
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
