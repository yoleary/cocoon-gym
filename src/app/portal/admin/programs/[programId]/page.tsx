import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Dumbbell,
  Edit,
  FileStack,
  Layers,
  Link2,
  Users,
} from "lucide-react";
import { RoleGuard } from "@/components/portal/role-guard";
import { getProgramById } from "@/actions/program.actions";
import { formatDate } from "@/lib/utils";
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

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <ProgramDetailContent programId={programId} />
    </RoleGuard>
  );
}

// ─── Content ────────────────────────────────────

async function ProgramDetailContent({ programId }: { programId: string }) {
  let program: Awaited<ReturnType<typeof getProgramById>>;

  try {
    program = await getProgramById(programId);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/portal/admin/programs">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Programs
        </Link>
      </Button>

      {/* Program header */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl">{program.name}</CardTitle>
              {program.description && (
                <CardDescription className="mt-1 max-w-lg">
                  {program.description}
                </CardDescription>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className="gap-1 text-xs">
                  <FileStack className="h-3 w-3" />
                  {program.templates.length} template
                  {program.templates.length !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {program.weeks} week{program.weeks !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  {program.assignments.length} assigned
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/portal/admin/programs/${programId}/assign`}>
                  <Link2 className="h-4 w-4 mr-1.5" />
                  Assign to Client
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1.5" />
                Edit Program
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>Created by {program.trainer.name}</span>
        <span>Created {formatDate(program.createdAt)}</span>
        <span>Updated {formatDate(program.updatedAt)}</span>
      </div>

      {/* Templates list */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Workout Templates</h2>

        {program.templates.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No workout templates added yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          program.templates.map((template) => (
            <Card key={template.id} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs tabular-nums"
                    >
                      {template.order + 1}
                    </Badge>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Layers className="h-3 w-3" />
                    {template.blocks.length} block
                    {template.blocks.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {template.blocks.map((block) => (
                  <div key={block.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{block.label}</span>
                      {block.isSuperset && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          Superset
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1.5 ml-3">
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
                          </div>

                          <Badge
                            variant="outline"
                            className="shrink-0 text-[10px] px-1.5 py-0"
                          >
                            {exercise.bodyRegion.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <Separator className="mt-3" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assignments */}
      {program.assignments.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Active Assignments</CardTitle>
            <CardDescription>
              Clients currently on this program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {program.assignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/portal/admin/clients/${assignment.clientId}`}
                  className="group flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="text-sm">
                    <span className="font-medium">
                      Client {assignment.clientId.slice(0, 8)}...
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      Started {formatDate(assignment.startDate)}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
