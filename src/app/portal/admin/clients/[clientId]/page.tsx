import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Dumbbell,
  Flame,
  Mail,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { RoleGuard } from "@/components/portal/role-guard";
import { getClientById } from "@/actions/client.actions";
import { formatDate, formatDuration, formatRelativeDate, formatWeight } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <ClientDetailContent clientId={clientId} />
    </RoleGuard>
  );
}

// ─── Content ────────────────────────────────────

async function ClientDetailContent({ clientId }: { clientId: string }) {
  let client: Awaited<ReturnType<typeof getClientById>>;

  try {
    client = await getClientById(clientId);
  } catch {
    notFound();
  }

  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/portal/admin/clients">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Clients
        </Link>
      </Button>

      {/* Client Header */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {client.image && (
                  <AvatarImage src={client.image} alt={client.name} />
                )}
                <AvatarFallback className="text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <CardTitle className="text-xl">{client.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {client.email}
                </div>
                {client.goal && (
                  <div className="flex items-center gap-2 mt-1">
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">
                      {client.goal}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/portal/admin/programs?assign=${clientId}`}>
                  <ClipboardList className="h-4 w-4 mr-1.5" />
                  Assign Program
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/portal/admin/clients/${clientId}#progress`}>
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  View Progress
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.stats.totalSessions}
            </div>
            <p className="text-xs text-muted-foreground">
              {client.stats.volumeLast30Days > 0
                ? `${formatWeight(Math.round(client.stats.volumeLast30Days))} volume last 30 days`
                : "No recent volume"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.stats.currentStreak}
            </div>
            <p className="text-xs text-muted-foreground">
              Best: {client.stats.longestStreak} weeks
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Personal Records
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.stats.personalRecords}
            </div>
            <p className="text-xs text-muted-foreground">
              {client.stats.lastActivityDate
                ? `Last active ${formatRelativeDate(client.stats.lastActivityDate)}`
                : "No activity recorded"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sessions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
            <CardDescription>Last 5 completed workouts</CardDescription>
          </CardHeader>
          <CardContent>
            {client.recentSessions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No completed sessions yet.
              </p>
            ) : (
              <div className="space-y-2">
                {client.recentSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/portal/history/${session.id}`}
                    className="group flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {session.templateName ?? "Free Session"}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.completedAt)}
                        </span>
                        {session.duration != null && (
                          <span>{formatDuration(session.duration)}</span>
                        )}
                        {session.totalVolume != null && (
                          <span>{formatWeight(Math.round(session.totalVolume))}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Programs */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Active Programs</CardTitle>
                <CardDescription>Currently assigned programs</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/portal/admin/programs?assign=${clientId}`}>
                  Assign New
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {client.activePrograms.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No programs assigned yet.
              </p>
            ) : (
              <div className="space-y-2">
                {client.activePrograms.map((program) => (
                  <div
                    key={program.assignmentId}
                    className="rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/portal/admin/programs/${program.programId}`}
                        className="group flex items-center gap-2 hover:text-primary transition-colors min-w-0"
                      >
                        <ClipboardList className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {program.programName}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                      </Link>
                      <Button variant="outline" size="sm" asChild className="text-xs gap-1.5 shrink-0 ml-2">
                        <Link
                          href={`/portal/admin/programs/${program.programId}/baseline/${program.assignmentId}`}
                        >
                          <ClipboardCheck className="h-3.5 w-3.5" />
                          {program.hasBaseline ? "Edit" : "Record"} Baseline
                        </Link>
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 ml-6">
                      <Badge variant="outline" className="text-[10px]">
                        {program.weeks} weeks
                      </Badge>
                      {program.progressionType !== "NONE" && (
                        <Badge variant="secondary" className="text-[10px]">
                          {program.progressionType}
                        </Badge>
                      )}
                      {program.hasBaseline && (
                        <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-700">
                          Baseline set
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        Started {formatDate(program.startDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client meta */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span>Joined: {formatDate(client.joinedAt)}</span>
            <span>Assigned: {formatDate(client.assignedAt)}</span>
            <span>Status: {client.active ? "Active" : "Inactive"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
