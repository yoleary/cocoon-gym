import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Dumbbell,
  Layers,
  Play,
} from "lucide-react";
import { getProgramById, getPrograms } from "@/actions/program.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;

  // Find the template across all programs the user has access to
  const programs = await getPrograms();

  let foundTemplate: any = null;
  let foundProgram: any = null;

  for (const program of programs) {
    const template = program.templates.find((t) => t.id === templateId);
    if (template) {
      foundTemplate = template;
      foundProgram = program;
      break;
    }
  }

  if (!foundTemplate || !foundProgram) {
    notFound();
  }

  // Fetch the full program details to get blocks and exercises
  const fullProgram = await getProgramById(foundProgram.id);
  const fullTemplate = fullProgram.templates.find(
    (t) => t.id === templateId
  );

  if (!fullTemplate) {
    notFound();
  }

  const totalExercises = fullTemplate.blocks.reduce(
    (sum, block) => sum + block.exercises.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/portal/workouts">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Workouts
        </Link>
      </Button>

      {/* Template header */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge
                variant="outline"
                className="mb-2 font-mono text-xs tabular-nums"
              >
                Day {fullTemplate.order + 1}
              </Badge>
              <CardTitle className="text-xl">{fullTemplate.name}</CardTitle>
              <CardDescription className="mt-1">
                From {foundProgram.name}
              </CardDescription>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Dumbbell className="h-3 w-3" />
                  {totalExercises} exercise
                  {totalExercises !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary" className="text-xs gap-1">
                  <Layers className="h-3 w-3" />
                  {fullTemplate.blocks.length} block
                  {fullTemplate.blocks.length !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {fullProgram.weeks} week program
                </Badge>
              </div>
            </div>

            <Button size="lg" className="gap-2" asChild>
              <Link
                href={`/portal/workouts/live/new?templateId=${templateId}`}
              >
                <Play className="h-5 w-5" />
                Start This Workout
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Blocks and exercises */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Exercises</h2>

        {fullTemplate.blocks.map((block) => (
          <Card key={block.id} className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  {block.label}
                </CardTitle>
                {block.isSuperset && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    Superset
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-2 pt-0">
              {block.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                >
                  <Badge
                    variant="outline"
                    className="shrink-0 font-mono text-xs tabular-nums"
                  >
                    {exercise.position}
                  </Badge>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/portal/exercises/${exercise.exerciseId}`}
                      className="truncate text-sm font-medium hover:text-primary transition-colors"
                    >
                      {exercise.exerciseName}
                    </Link>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                      {exercise.targetSets != null && (
                        <span>
                          {exercise.targetSets} x{" "}
                          {exercise.targetReps ?? "?"}
                        </span>
                      )}
                      {exercise.targetWeight && (
                        <span className="font-medium text-foreground/70">
                          {exercise.targetWeight}
                        </span>
                      )}
                      {exercise.tempo && (
                        <span>Tempo: {exercise.tempo}</span>
                      )}
                      {exercise.restSeconds != null &&
                        exercise.restSeconds > 0 && (
                          <span>{exercise.restSeconds}s rest</span>
                        )}
                    </div>
                    {exercise.notes && (
                      <p className="mt-1 text-xs text-muted-foreground/80 italic">
                        {exercise.notes}
                      </p>
                    )}
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

      {/* Week progression grid placeholder */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Week Progression</CardTitle>
          <CardDescription>
            Track your performance across the {fullProgram.weeks}-week program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {Array.from({ length: fullProgram.weeks }, (_, i) => i + 1).map(
              (week) => (
                <div
                  key={week}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border/50 p-3 text-center"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    Wk {week}
                  </span>
                  <span className="text-lg font-bold text-muted-foreground/30">
                    --
                  </span>
                </div>
              )
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Complete workouts to see your week-by-week progression here.
          </p>
        </CardContent>
      </Card>

      {/* Bottom CTA */}
      <div className="flex justify-center pb-4">
        <Button size="lg" className="gap-2" asChild>
          <Link
            href={`/portal/workouts/live/new?templateId=${templateId}`}
          >
            <Play className="h-5 w-5" />
            Start This Workout
          </Link>
        </Button>
      </div>
    </div>
  );
}
