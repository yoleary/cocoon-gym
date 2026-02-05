"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { RoleGuard } from "@/components/portal/role-guard";
import { getProgramById } from "@/actions/program.actions";
import {
  getBaseline,
  saveBaseline,
  deleteBaseline,
} from "@/actions/baseline.actions";
import { ProgressionPreviewGrid } from "@/components/workout/progression-preview-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ExerciseRow {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  targetWeight: string;
  restSeconds: number;
  startingWeight: string;
}

export default function BaselinePage({
  params,
}: {
  params: Promise<{ programId: string; assignmentId: string }>;
}) {
  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <BaselineContent paramsPromise={params} />
    </RoleGuard>
  );
}

function BaselineContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ programId: string; assignmentId: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [programId, setProgramId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [programName, setProgramName] = useState("");
  const [progressionType, setProgressionType] = useState<string>("NONE");
  const [totalWeeks, setTotalWeeks] = useState(6);

  // Body KPIs
  const [bodyWeightKg, setBodyWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [bodyFatPercent, setBodyFatPercent] = useState("");
  const [notes, setNotes] = useState("");

  // Exercise baselines
  const [exerciseRows, setExerciseRows] = useState<ExerciseRow[]>([]);
  const [hasExistingBaseline, setHasExistingBaseline] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { programId: pId, assignmentId: aId } = await paramsPromise;
        setProgramId(pId);
        setAssignmentId(aId);

        const program = await getProgramById(pId);
        setProgramName(program.name);
        setProgressionType(program.progressionType);
        setTotalWeeks(program.weeks);

        // Gather all exercises from templates
        const rows: ExerciseRow[] = [];
        for (const template of program.templates) {
          for (const block of template.blocks) {
            for (const ex of block.exercises) {
              // Avoid duplicate exercises
              if (!rows.some((r) => r.exerciseId === ex.exerciseId)) {
                rows.push({
                  exerciseId: ex.exerciseId,
                  exerciseName: ex.exerciseName,
                  targetSets: ex.targetSets ?? 3,
                  targetReps: ex.targetReps ?? "8-12",
                  targetWeight: ex.targetWeight ?? "",
                  restSeconds: ex.restSeconds ?? 90,
                  startingWeight: "",
                });
              }
            }
          }
        }

        // Load existing baseline if any
        try {
          const baseline = await getBaseline(aId);
          if (baseline) {
            setHasExistingBaseline(true);
            setBodyWeightKg(baseline.bodyWeightKg?.toString() ?? "");
            setAge(baseline.age?.toString() ?? "");
            setBodyFatPercent(baseline.bodyFatPercent?.toString() ?? "");
            setNotes(baseline.notes ?? "");

            // Pre-fill starting weights
            for (const eb of baseline.exerciseBaselines) {
              const row = rows.find((r) => r.exerciseId === eb.exerciseId);
              if (row) {
                row.startingWeight = eb.startingWeight.toString();
              }
            }
          }
        } catch {
          // No existing baseline
        }

        setExerciseRows(rows);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [paramsPromise]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveBaseline(assignmentId, {
        bodyWeightKg: bodyWeightKg ? parseFloat(bodyWeightKg) : null,
        age: age ? parseInt(age, 10) : null,
        bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : null,
        notes: notes || null,
        exerciseBaselines: exerciseRows
          .filter((r) => r.startingWeight && parseFloat(r.startingWeight) > 0)
          .map((r) => ({
            exerciseId: r.exerciseId,
            startingWeight: parseFloat(r.startingWeight),
          })),
      });
      setHasExistingBaseline(true);
      router.refresh();
    } catch (err: any) {
      alert(err.message ?? "Failed to save baseline");
    } finally {
      setSaving(false);
    }
  }, [assignmentId, bodyWeightKg, age, bodyFatPercent, notes, exerciseRows, router]);

  const handleDelete = useCallback(async () => {
    if (!confirm("Remove this baseline? Progression will fall back to relative targets.")) return;
    try {
      await deleteBaseline(assignmentId);
      setHasExistingBaseline(false);
      setBodyWeightKg("");
      setAge("");
      setBodyFatPercent("");
      setNotes("");
      setExerciseRows((prev) =>
        prev.map((r) => ({ ...r, startingWeight: "" }))
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message ?? "Failed to delete baseline");
    }
  }, [assignmentId, router]);

  const updateStartingWeight = (exerciseId: string, value: string) => {
    setExerciseRows((prev) =>
      prev.map((r) =>
        r.exerciseId === exerciseId ? { ...r, startingWeight: value } : r
      )
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading baseline...</p>
      </div>
    );
  }

  // Build exercise baselines for preview
  const previewBaselines = exerciseRows
    .filter((r) => r.startingWeight && parseFloat(r.startingWeight) > 0)
    .map((r) => ({
      exerciseId: r.exerciseId,
      startingWeight: parseFloat(r.startingWeight),
    }));

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/portal/admin/programs/${programId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {programName}
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Baseline Assessment
          </h1>
          <p className="text-sm text-muted-foreground">
            Record starting weights and body KPIs for this client assignment.
          </p>
        </div>
        <div className="flex gap-2">
          {hasExistingBaseline && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Remove Baseline
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Save Baseline
          </Button>
        </div>
      </div>

      {/* Body KPIs */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Body KPIs</CardTitle>
          <CardDescription>
            Optional measurements to inform progression targets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="bodyWeight">Body Weight (kg)</Label>
              <Input
                id="bodyWeight"
                type="number"
                step="0.1"
                placeholder="e.g. 75"
                value={bodyWeightKg}
                onChange={(e) => setBodyWeightKg(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g. 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bodyFat">Body Fat %</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                placeholder="e.g. 18"
                value={bodyFatPercent}
                onChange={(e) => setBodyFatPercent(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Any relevant notes about the client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Per-exercise starting weights */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">
            Starting Weights per Exercise
          </CardTitle>
          <CardDescription>
            Enter the weight (kg) the client can currently handle for each
            exercise. Leave blank for exercises without baseline data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exerciseRows.map((row) => (
              <div
                key={row.exerciseId}
                className="flex items-center gap-3 rounded-md border border-border/50 px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {row.exerciseName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Base: {row.targetSets} x {row.targetReps}
                    {row.targetWeight ? ` @ ${row.targetWeight}` : ""}
                  </p>
                </div>
                <div className="w-28 shrink-0">
                  <Input
                    type="number"
                    step="2.5"
                    placeholder="kg"
                    value={row.startingWeight}
                    onChange={(e) =>
                      updateStartingWeight(row.exerciseId, e.target.value)
                    }
                    className="text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live preview */}
      <ProgressionPreviewGrid
        exercises={exerciseRows.map((r) => ({
          exerciseId: r.exerciseId,
          exerciseName: r.exerciseName,
          targetSets: r.targetSets,
          targetReps: r.targetReps,
          targetWeight: r.targetWeight,
          restSeconds: r.restSeconds,
        }))}
        progressionType={progressionType as any}
        totalWeeks={totalWeeks}
        exerciseBaselines={previewBaselines}
      />
    </div>
  );
}
