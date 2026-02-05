import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Dumbbell,
  Layers,
} from "lucide-react";
import { RoleGuard } from "@/components/portal/role-guard";
import { getLibraryWorkout } from "@/actions/workout.actions";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EditWorkoutDialog } from "@/components/admin/edit-workout-dialog";
import { DeleteWorkoutButton } from "@/components/admin/delete-workout-button";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;

  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <WorkoutDetailContent workoutId={workoutId} />
    </RoleGuard>
  );
}

async function WorkoutDetailContent({ workoutId }: { workoutId: string }) {
  let workout: Awaited<ReturnType<typeof getLibraryWorkout>>;

  try {
    workout = await getLibraryWorkout(workoutId);
  } catch {
    notFound();
  }

  const totalExercises = workout.blocks.reduce(
    (sum, b) => sum + b.exercises.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/portal/admin/workouts">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Workout Library
        </Link>
      </Button>

      {/* Workout header */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl">{workout.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Dumbbell className="h-3 w-3" />
                  {totalExercises} exercise{totalExercises !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Layers className="h-3 w-3" />
                  {workout.blocks.length} block{workout.blocks.length !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Library
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <EditWorkoutDialog
                workoutId={workoutId}
                currentName={workout.name}
              />
              <DeleteWorkoutButton
                workoutId={workoutId}
                workoutName={workout.name}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>Created {formatDate(workout.createdAt)}</span>
        <span>Updated {formatDate(workout.updatedAt)}</span>
      </div>

      {/* Blocks and exercises */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Exercises</h2>

        {workout.blocks.map((block) => (
          <Card key={block.id} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{block.label}</CardTitle>
                {block.isSuperset && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Superset
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-1.5 pt-0">
              {block.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-3 rounded-md border border-border/50 px-3 py-2"
                >
                  <Badge
                    variant="outline"
                    className="shrink-0 font-mono text-[10px] px-1.5 py-0"
                  >
                    {exercise.position}
                  </Badge>

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">
                      {exercise.exerciseName}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                      {exercise.targetSets != null && (
                        <span>
                          {exercise.targetSets} x {exercise.targetReps ?? "?"}
                        </span>
                      )}
                      {exercise.restSeconds != null && exercise.restSeconds > 0 && (
                        <span>{exercise.restSeconds}s rest</span>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="shrink-0 text-[10px] px-1.5 py-0"
                  >
                    {exercise.bodyRegion.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Tip */}
      <p className="text-xs text-muted-foreground">
        This workout is in your library. When you create a program, you can import it
        to quickly add all these exercises.
      </p>
    </div>
  );
}
