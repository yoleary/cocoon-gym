import Link from "next/link";
import {
  ChevronRight,
  Dumbbell,
  Layers,
  Plus,
} from "lucide-react";
import { RoleGuard } from "@/components/portal/role-guard";
import { getLibraryWorkouts } from "@/actions/workout.actions";
import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function WorkoutLibraryPage() {
  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <WorkoutLibraryContent />
    </RoleGuard>
  );
}

async function WorkoutLibraryContent() {
  const workouts = await getLibraryWorkouts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workout Library</h1>
          <p className="text-sm text-muted-foreground">
            Create reusable workouts to quickly build programs.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/workouts/create">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Workout
          </Link>
        </Button>
      </div>

      {/* Workout list */}
      {workouts.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              No workouts in your library yet.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Create workouts here to reuse them across multiple programs.
            </p>
            <Button asChild size="sm">
              <Link href="/portal/admin/workouts/create">
                <Plus className="h-4 w-4 mr-1.5" />
                Create Your First Workout
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/portal/admin/workouts/${workout.id}`}
              className="group"
            >
              <Card className="border-border/50 transition-colors group-hover:border-primary/30 group-hover:shadow-md h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-base">
                        {workout.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {workout.exerciseCount} exercise
                        {workout.exerciseCount !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-foreground transition-colors mt-0.5" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Blocks preview */}
                  <div className="flex flex-wrap gap-1.5">
                    {workout.blocks.map((block) => (
                      <Badge
                        key={block.id}
                        variant="outline"
                        className="text-xs gap-1"
                      >
                        <Layers className="h-3 w-3" />
                        {block.label}
                        {block.isSuperset && (
                          <span className="text-[10px] text-muted-foreground ml-1">
                            (SS)
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>

                  {/* Exercise names preview */}
                  <div className="flex flex-wrap gap-1">
                    {workout.blocks
                      .flatMap((b) => b.exercises)
                      .slice(0, 4)
                      .map((ex) => (
                        <Badge
                          key={ex.id}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {ex.exerciseName}
                        </Badge>
                      ))}
                    {workout.exerciseCount > 4 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        +{workout.exerciseCount - 4} more
                      </Badge>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="text-xs text-muted-foreground">
                    Updated {formatRelativeDate(workout.updatedAt)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
