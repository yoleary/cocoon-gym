import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  FileText,
  Flame,
  Trophy,
} from "lucide-react";
import { getSessionDetail } from "@/actions/session.actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatDuration, formatWeight } from "@/lib/utils";
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
import { DeleteSessionButton } from "@/components/workout/delete-session-button";

// ─── Set type labels ────────────────────────────

const SET_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  WARMUP: {
    label: "Warm-up",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  WORKING: {
    label: "Working",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  DROP: {
    label: "Drop",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  AMRAP: {
    label: "AMRAP",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  FAILURE: {
    label: "Failure",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

// ─── Page ───────────────────────────────────────

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await auth();
  if (!session?.user) redirect("/login");

  const ws = await getSessionDetail(sessionId);

  if (!ws || !ws.completedAt) {
    notFound();
  }

  // Verify authorization: user must own this session or be their trainer
  const userId = session.user.id!;
  const role = (session.user as any).role;
  if (role !== "TRAINER" && ws.userId !== userId) {
    notFound();
  }

  // Fetch PRs achieved during this session
  const prsInSession = await db.personalRecord.findMany({
    where: {
      userId: ws.userId,
      achievedAt: {
        gte: ws.startedAt,
        lte: ws.completedAt,
      },
    },
    include: {
      exercise: { select: { name: true } },
    },
    orderBy: { achievedAt: "asc" },
  });

  // Calculate stats
  const totalVolume = ws.totalVolume ?? 0;
  const duration = ws.duration ?? 0;
  const totalExercises = ws.exercises.length;
  const totalSets = ws.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Back nav + delete button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/portal/history">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Workout History
          </Link>
        </Button>
        <DeleteSessionButton sessionId={ws.id} />
      </div>

      {/* Session header */}
      <Card className="border-border/50 bg-gradient-to-br from-green-500/5 via-card to-card">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {ws.template?.name ?? "Free Session"}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(ws.completedAt)}
                {ws.weekNumber != null && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Week {ws.weekNumber}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-lg font-bold tabular-nums">
              {totalVolume >= 1000
                ? `${(totalVolume / 1000).toFixed(1)}t`
                : formatWeight(Math.round(totalVolume))}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Volume
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-bold tabular-nums">
              {formatDuration(duration)}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Duration
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-bold tabular-nums">
              {totalExercises}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Exercises
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-lg font-bold tabular-nums">
              {totalSets}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Sets
            </span>
          </CardContent>
        </Card>
      </div>

      {/* PRs achieved */}
      {prsInSession.length > 0 && (
        <Card className="border-border/50 border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Personal Records ({prsInSession.length})
            </CardTitle>
            <CardDescription>PRs achieved during this session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prsInSession.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between rounded-md border border-amber-500/20 bg-background px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {pr.exercise.name}
                    </p>
                    {pr.context && (
                      <p className="text-xs text-muted-foreground">
                        {pr.context}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge
                      variant="outline"
                      className="text-xs border-amber-500/30 text-amber-600"
                    >
                      {pr.recordType === "E1RM"
                        ? "Est. 1RM"
                        : pr.recordType === "MAX_WEIGHT"
                          ? "Max Weight"
                          : pr.recordType === "MAX_REPS_AT_WEIGHT"
                            ? "Max Reps"
                            : pr.recordType}
                    </Badge>
                    <span className="text-sm font-bold tabular-nums">
                      {pr.recordType === "E1RM" || pr.recordType === "MAX_WEIGHT"
                        ? formatWeight(Math.round(pr.value * 10) / 10)
                        : pr.recordType === "MAX_REPS_AT_WEIGHT"
                          ? `${pr.value} reps`
                          : pr.recordType === "MAX_DURATION"
                            ? formatDuration(pr.value)
                            : `${pr.value}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercises and sets */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Exercises</h2>

        {ws.exercises.map((exerciseEntry) => {
          const completedSets = exerciseEntry.sets.filter(
            (s) => s.completed
          );
          const exerciseVolume = completedSets.reduce((sum, s) => {
            if (s.weight && s.reps) return sum + s.weight * s.reps;
            return sum;
          }, 0);

          return (
            <Card key={exerciseEntry.id} className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge
                      variant="outline"
                      className="shrink-0 font-mono text-xs tabular-nums"
                    >
                      {exerciseEntry.position}
                    </Badge>
                    <Link
                      href={`/portal/exercises/${exerciseEntry.exerciseId}`}
                      className="truncate text-sm font-medium hover:text-primary transition-colors"
                    >
                      {exerciseEntry.exercise.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                    <span>
                      {completedSets.length}/{exerciseEntry.sets.length} sets
                    </span>
                    {exerciseVolume > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {formatWeight(Math.round(exerciseVolume))}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Table-style set display */}
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-muted-foreground">
                        <th className="px-3 py-1.5 text-left text-xs font-medium w-12">
                          Set
                        </th>
                        <th className="px-3 py-1.5 text-left text-xs font-medium">
                          Type
                        </th>
                        <th className="px-3 py-1.5 text-right text-xs font-medium">
                          Weight
                        </th>
                        <th className="px-3 py-1.5 text-right text-xs font-medium">
                          Reps
                        </th>
                        <th className="px-3 py-1.5 text-right text-xs font-medium">
                          RPE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {exerciseEntry.sets.map((set) => {
                        const typeConfig =
                          SET_TYPE_LABELS[set.setType] ??
                          SET_TYPE_LABELS.WORKING;

                        return (
                          <tr
                            key={set.id}
                            className={`border-b last:border-b-0 ${
                              set.completed
                                ? ""
                                : "opacity-40 line-through"
                            }`}
                          >
                            <td className="px-3 py-1.5 tabular-nums font-medium">
                              {set.setNumber}
                            </td>
                            <td className="px-3 py-1.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${typeConfig.color}`}
                              >
                                {typeConfig.label}
                              </Badge>
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums font-medium">
                              {set.weight != null
                                ? formatWeight(set.weight)
                                : "--"}
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums">
                              {set.reps ?? "--"}
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                              {set.rpe != null ? `@${set.rpe}` : "--"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notes */}
      {ws.notes && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Session Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {ws.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Session meta */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span>Started: {formatDate(ws.startedAt)}</span>
            <span>Completed: {formatDate(ws.completedAt)}</span>
            <span>Session ID: {ws.id.slice(0, 8)}...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
