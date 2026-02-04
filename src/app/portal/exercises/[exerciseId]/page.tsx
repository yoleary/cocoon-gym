import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  ExternalLink,
  Info,
  TrendingUp,
} from "lucide-react";
import { getExerciseById, getExerciseHistory } from "@/actions/exercise.actions";
import { getE1RMHistory } from "@/actions/progress.actions";
import { formatDate, formatWeight } from "@/lib/utils";
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

// ─── Display helpers ────────────────────────────

const BODY_REGION_LABELS: Record<string, string> = {
  UPPER_BODY: "Upper Body",
  LOWER_BODY: "Lower Body",
  CORE: "Core",
  FULL_BODY: "Full Body",
};

const BODY_REGION_COLORS: Record<string, string> = {
  UPPER_BODY: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  LOWER_BODY: "bg-green-500/10 text-green-600 border-green-500/20",
  CORE: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  FULL_BODY: "bg-purple-500/10 text-purple-600 border-purple-500/20",
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

const MUSCLE_ROLE_LABELS: Record<string, string> = {
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
  STABILIZER: "Stabilizer",
};

// ─── Page ───────────────────────────────────────

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;

  let exercise: Awaited<ReturnType<typeof getExerciseById>>;

  try {
    exercise = await getExerciseById(exerciseId);
  } catch {
    notFound();
  }

  // Fetch performance data in parallel
  const [history, e1rmHistory] = await Promise.all([
    getExerciseHistory(exerciseId),
    getE1RMHistory(exerciseId),
  ]);

  // Find best e1RM
  const bestE1RM =
    e1rmHistory.length > 0
      ? Math.max(...e1rmHistory.map((d) => d.e1rm))
      : null;

  // Find best weight
  const bestWeight =
    history.length > 0
      ? Math.max(
          ...history.map((h) => h.bestWeight ?? 0).filter((w) => w > 0)
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/portal/exercises">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Exercise Library
        </Link>
      </Button>

      {/* Exercise header */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl">{exercise.name}</CardTitle>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${BODY_REGION_COLORS[exercise.bodyRegion] ?? ""}`}
                >
                  {BODY_REGION_LABELS[exercise.bodyRegion] ??
                    exercise.bodyRegion}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {MOVEMENT_PATTERN_LABELS[exercise.movementPattern] ??
                    exercise.movementPattern}
                </Badge>
                {exercise.isCompound && (
                  <Badge
                    variant="outline"
                    className="text-xs border-orange-500/20 text-orange-600 bg-orange-500/5"
                  >
                    Compound
                  </Badge>
                )}
                {exercise.isCustom && (
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-500/20 text-blue-600 bg-blue-500/5"
                  >
                    Custom
                  </Badge>
                )}
              </div>
            </div>

            {exercise.videoUrl && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={exercise.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Demo Video
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Muscles */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Target Muscles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exercise.muscles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not specified</p>
            ) : (
              <div className="space-y-1.5">
                {exercise.muscles.map((muscle) => (
                  <div
                    key={muscle.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{muscle.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {MUSCLE_ROLE_LABELS[muscle.role] ?? muscle.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exercise.equipment.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bodyweight / None
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {exercise.equipment.map((eq) => (
                  <Badge key={eq.id} variant="outline" className="text-xs">
                    {eq.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Best performance */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Best
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Est. 1RM
                </span>
                <span className="text-sm font-bold tabular-nums">
                  {bestE1RM ? formatWeight(Math.round(bestE1RM * 10) / 10) : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Max Weight
                </span>
                <span className="text-sm font-bold tabular-nums">
                  {bestWeight ? formatWeight(bestWeight) : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Sessions Logged
                </span>
                <span className="text-sm font-bold tabular-nums">
                  {history.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      {exercise.instructions && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Info className="h-4 w-4 text-muted-foreground" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {exercise.instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* E1RM Progression Chart (simplified tabular view) */}
      {e1rmHistory.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              e1RM Progression
            </CardTitle>
            <CardDescription>
              Estimated 1-rep max over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Simple bar chart visualization */}
            <div className="space-y-2">
              {e1rmHistory.slice(-12).map((point, i) => {
                const maxE1RM = Math.max(
                  ...e1rmHistory.map((p) => p.e1rm)
                );
                const percentage =
                  maxE1RM > 0 ? (point.e1rm / maxE1RM) * 100 : 0;

                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatDate(point.date)}
                    </span>
                    <div className="flex-1 h-6 rounded-md bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-md bg-primary/70 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs font-medium tabular-nums">
                      {formatWeight(point.e1rm)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session history */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Session History
          </CardTitle>
          <CardDescription>
            All logged sets for this exercise
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="py-6 text-center">
              <Dumbbell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No history yet. Complete a workout with this exercise to see
                your progress.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.sessionId}>
                  <Link
                    href={`/portal/history/${entry.sessionId}`}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {entry.templateName ?? "Free Session"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-wrap gap-2 ml-2">
                    {entry.sets.map((set, i) => (
                      <div
                        key={i}
                        className={`rounded-md border px-2 py-1 text-xs tabular-nums ${
                          set.completed
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-border opacity-50"
                        }`}
                      >
                        <span className="text-muted-foreground">
                          {set.setNumber}.
                        </span>{" "}
                        {set.weight != null ? formatWeight(set.weight) : "--"}{" "}
                        x {set.reps ?? "--"}
                        {set.rpe != null && (
                          <span className="ml-1 text-muted-foreground">
                            @{set.rpe}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-1 ml-2 text-[10px] text-muted-foreground">
                    {entry.bestE1RM != null && (
                      <span>
                        e1RM: {formatWeight(Math.round(entry.bestE1RM * 10) / 10)}
                      </span>
                    )}
                    <span>
                      Volume: {formatWeight(Math.round(entry.totalVolume))}
                    </span>
                  </div>

                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
