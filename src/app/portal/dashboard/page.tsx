import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDuration, formatWeight } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  TrendingUp,
  Apple,
  Users,
  ClipboardList,
  Library,
  Flame,
  Calendar,
  Activity,
  Clock,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { OnboardingWizard } from "@/components/portal/onboarding-wizard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id!;
  const user = {
    name: session.user.name ?? "User",
    role: ((session.user as any).role as string) ?? "CLIENT",
  };

  const isTrainer = user.role === "TRAINER";

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome back, {user.name.split(" ")[0]}
          </CardTitle>
          <CardDescription>
            {isTrainer
              ? "Here is an overview of your clients and recent activity."
              : "Here is your training overview."}
          </CardDescription>
        </CardHeader>
      </Card>

      {isTrainer ? (
        <TrainerDashboard userId={userId} />
      ) : (
        <ClientDashboard userId={userId} userName={user.name} />
      )}
    </div>
  );
}

// ─── Client Dashboard ────────────────────────────────

async function ClientDashboard({ userId, userName }: { userId: string; userName: string }) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [weekSessions, streak, totalSessions, recentSessions, prCount, assignments] =
    await Promise.all([
      db.workoutSession.findMany({
        where: {
          userId,
          completedAt: { not: null, gte: weekStart },
        },
      }),
      db.streak.findUnique({ where: { userId } }),
      db.workoutSession.count({
        where: { userId, completedAt: { not: null } },
      }),
      db.workoutSession.findMany({
        where: { userId, completedAt: { not: null } },
        include: {
          template: { select: { name: true } },
          exercises: {
            select: {
              _count: { select: { sets: { where: { completed: true } } } },
            },
          },
        },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
      db.personalRecord.count({ where: { userId } }),
      db.programAssignment.findMany({
        where: { clientId: userId, active: true },
        include: {
          program: {
            include: {
              trainer: { select: { name: true } },
              _count: { select: { templates: true } },
            },
          },
        },
      }),
    ]);

  const weeklyWorkouts = weekSessions.length;
  const weeklyVolume = weekSessions.reduce(
    (sum, s) => sum + (s.totalVolume ?? 0),
    0
  );
  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;

  // Onboarding data for new users
  const isNewUser = totalSessions === 0;
  const assignedPrograms = assignments.map((a) => ({
    name: a.program.name,
    weeks: a.program.weeks,
    templateCount: a.program._count.templates,
    trainerName: a.program.trainer.name,
  }));

  return (
    <>
      {/* Onboarding wizard for new users */}
      {isNewUser && (
        <OnboardingWizard userName={userName} programs={assignedPrograms} />
      )}

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              workout{weeklyWorkouts !== 1 ? "s" : ""} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Volume
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyVolume > 0
                ? weeklyVolume >= 1000
                  ? `${(weeklyVolume / 1000).toFixed(1)}t`
                  : formatWeight(Math.round(weeklyVolume))
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground">total lifted</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStreak > 0
                ? `${currentStreak} week${currentStreak !== 1 ? "s" : ""}`
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {longestStreak > 0
                ? `Best: ${longestStreak} week${longestStreak !== 1 ? "s" : ""}`
                : "Complete a workout to start"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              All Time
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              session{totalSessions !== 1 ? "s" : ""} · {prCount} PR
              {prCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
              <CardDescription>Your latest completed workouts</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/history">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSessions.map((ws) => {
              const completedSets = ws.exercises.reduce(
                (sum, ex) => sum + ex._count.sets,
                0
              );
              return (
                <Link
                  key={ws.id}
                  href={`/portal/history/${ws.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:border-primary/20"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                      {ws.template?.name ?? "Free Session"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {ws.duration != null && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(ws.duration)}
                        </span>
                      )}
                      {ws.totalVolume != null && ws.totalVolume > 0 && (
                        <span>
                          {formatWeight(Math.round(ws.totalVolume))}
                        </span>
                      )}
                      <span>{completedSets} sets</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {ws.completedAt
                      ? new Date(ws.completedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })
                      : ""}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Jump right into your training</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              asChild
            >
              <Link href="/portal/workouts">
                <Dumbbell className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Start Workout</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              asChild
            >
              <Link href="/portal/progress">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">View Progress</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              asChild
            >
              <Link href="/portal/nutrition">
                <Apple className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Nutrition Guide</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ─── Trainer Dashboard ───────────────────────────────

async function TrainerDashboard({ userId }: { userId: string }) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [activeClients, weekSessions, totalPrograms, recentSessions] =
    await Promise.all([
      db.trainerClient.count({
        where: { trainerId: userId, active: true },
      }),
      db.workoutSession.count({
        where: {
          user: {
            trainers: { some: { trainerId: userId, active: true } },
          },
          completedAt: { not: null, gte: weekStart },
        },
      }),
      db.program.count({ where: { trainerId: userId } }),
      db.workoutSession.findMany({
        where: {
          user: {
            trainers: { some: { trainerId: userId, active: true } },
          },
          completedAt: { not: null },
        },
        include: {
          user: { select: { name: true } },
          template: { select: { name: true } },
        },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
    ]);

  return (
    <>
      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">currently training</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions This Week
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSessions}</div>
            <p className="text-xs text-muted-foreground">across all clients</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Programs
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrograms}</div>
            <p className="text-xs text-muted-foreground">active programs</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Client Activity */}
      {recentSessions.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Client Activity</CardTitle>
            <CardDescription>
              Latest completed sessions by your clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSessions.map((ws) => (
              <div
                key={ws.id}
                className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {ws.user.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {ws.template?.name ?? "Free Session"}
                    </span>
                    {ws.duration != null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(ws.duration)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {ws.completedAt
                    ? new Date(ws.completedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })
                    : ""}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Manage your training business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              asChild
            >
              <Link href="/portal/admin/clients">
                <Users className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Manage Clients</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              asChild
            >
              <Link href="/portal/admin/programs">
                <ClipboardList className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Programs</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              asChild
            >
              <Link href="/portal/admin/exercises">
                <Library className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Exercise Library</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
