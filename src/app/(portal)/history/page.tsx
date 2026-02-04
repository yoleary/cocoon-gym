import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  Calendar,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  History,
} from "lucide-react";
import { formatDate, formatDuration, formatRelativeDate, formatWeight } from "@/lib/utils";
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

// ─── Page ───────────────────────────────────────

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;
  const userId = session.user.id!;

  const [sessions, total] = await Promise.all([
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
      skip,
      take: pageSize,
    }),
    db.workoutSession.count({
      where: { userId, completedAt: { not: null } },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Compute aggregate stats
  const totalVolumeAll = sessions.reduce(
    (sum, s) => sum + (s.totalVolume ?? 0),
    0
  );
  const totalDurationAll = sessions.reduce(
    (sum, s) => sum + (s.duration ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          Workout History
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} completed session{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Page-level stats */}
      {sessions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sessions on Page
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">
                of {total} total
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Volume
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalVolumeAll >= 1000
                  ? `${(totalVolumeAll / 1000).toFixed(1)}t`
                  : formatWeight(Math.round(totalVolumeAll))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across shown sessions
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(totalDurationAll)}
              </div>
              <p className="text-xs text-muted-foreground">
                Time spent training
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Session list */}
      {sessions.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              No completed workouts yet.
            </p>
            <p className="text-xs text-muted-foreground">
              Complete your first workout to see it here.
            </p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/portal/workouts">Start a Workout</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((ws) => {
            const completedSets = ws.exercises.reduce(
              (sum, ex) => sum + ex._count.sets,
              0
            );

            return (
              <Link
                key={ws.id}
                href={`/portal/history/${ws.id}`}
                className="group block"
              >
                <Card className="border-border/50 transition-colors group-hover:border-primary/20 group-hover:shadow-sm">
                  <CardContent className="flex items-center gap-4 py-3 px-4">
                    {/* Date column */}
                    <div className="shrink-0 text-center w-14">
                      <div className="text-lg font-bold tabular-nums leading-tight">
                        {new Date(ws.completedAt!).getDate()}
                      </div>
                      <div className="text-[10px] font-medium uppercase text-muted-foreground">
                        {new Date(ws.completedAt!).toLocaleDateString(
                          "en-GB",
                          { month: "short" }
                        )}
                      </div>
                    </div>

                    <Separator orientation="vertical" className="h-10" />

                    {/* Session info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                        {ws.template?.name ?? "Free Session"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                        {ws.duration != null && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(ws.duration)}
                          </span>
                        )}
                        {ws.totalVolume != null && (
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {formatWeight(Math.round(ws.totalVolume))}
                          </span>
                        )}
                        <span>
                          {ws.exercises.length} exercise
                          {ws.exercises.length !== 1 ? "s" : ""}
                        </span>
                        <span>{completedSets} sets</span>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/portal/history?page=${page - 1}`}>Previous</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/portal/history?page=${page + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
