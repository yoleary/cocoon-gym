import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getVolumeHistory,
  getActivityData,
  getMuscleGroupBreakdown,
  getStreakData,
  getAchievements,
  getProgressSummary,
} from "@/actions/progress.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VolumeChart } from "@/components/progress/volume-chart";
import { ActivityHeatmap } from "@/components/progress/activity-heatmap";
import { MuscleGroupBreakdown } from "@/components/progress/muscle-group-breakdown";
import { StreakBadge } from "@/components/progress/streak-badge";
import {
  TrendingUp,
  Dumbbell,
  Flame,
  Trophy,
  BarChart3,
  Activity,
} from "lucide-react";

// ─── Page ────────────────────────────────────────────

export default async function ProgressPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string;

  // Fetch all progress data in parallel
  const [volumeHistory, activityData, muscleBreakdown, streakData, achievements, summary] =
    await Promise.all([
      getVolumeHistory(userId),
      getActivityData(userId),
      getMuscleGroupBreakdown(userId),
      getStreakData(userId),
      getAchievements(userId),
      getProgressSummary(userId),
    ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <p className="text-muted-foreground">
          Track your training journey and celebrate your wins.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Volume */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Volume
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {summary.totalVolume >= 1000
                ? `${(summary.totalVolume / 1000).toFixed(1)}t`
                : `${summary.totalVolume.toLocaleString()}kg`}
            </div>
            <p className="text-xs text-muted-foreground">All-time lifted</p>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {summary.totalSessions}
            </div>
            <p className="text-xs text-muted-foreground">Workouts completed</p>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {streakData.currentStreak}{" "}
              <span className="text-base font-normal text-muted-foreground">
                {streakData.currentStreak === 1 ? "week" : "weeks"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Best: {streakData.longestStreak} weeks
            </p>
          </CardContent>
        </Card>

        {/* Personal Records */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PRs
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {summary.totalPRs}
            </div>
            <p className="text-xs text-muted-foreground">Personal records set</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-green-500" />
            Activity
          </CardTitle>
          <CardDescription>
            Your training consistency over the past year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={activityData} />
        </CardContent>
      </Card>

      {/* Volume Chart & Streak Side by Side */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Volume Chart (larger) */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Weekly Volume
            </CardTitle>
            <CardDescription>
              Total training volume per week (kg)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VolumeChart data={volumeHistory} />
          </CardContent>
        </Card>

        {/* Streak Badge */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-orange-500" />
              Streak
            </CardTitle>
            <CardDescription>
              Consecutive weeks of training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StreakBadge
              currentStreak={streakData.currentStreak}
              longestStreak={streakData.longestStreak}
              lastActivityDate={streakData.lastActivityDate}
            />
          </CardContent>
        </Card>
      </div>

      {/* Muscle Group Breakdown */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Dumbbell className="h-5 w-5 text-violet-500" />
            Muscle Group Volume
          </CardTitle>
          <CardDescription>
            How your training volume is distributed across muscle groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MuscleGroupBreakdown data={muscleBreakdown} />
        </CardContent>
      </Card>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-amber-500" />
              Achievements
            </CardTitle>
            <CardDescription>
              Milestones and badges earned on your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-lg">
                    {achievement.icon ?? "🏆"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {achievement.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
