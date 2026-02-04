import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

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
              : "Here is your training overview. Keep up the great work."}
          </CardDescription>
        </CardHeader>
      </Card>

      {isTrainer ? <TrainerDashboard /> : <ClientDashboard />}
    </div>
  );
}

// ─── Client Dashboard ────────────────────────────────

function ClientDashboard() {
  return (
    <>
      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Workouts
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">This week</p>
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
            <div className="text-2xl font-bold">5 days</div>
            <p className="text-xs text-muted-foreground">Keep it going</p>
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
            <div className="text-2xl font-bold">12,450 kg</div>
            <p className="text-xs text-muted-foreground">Total lifted</p>
          </CardContent>
        </Card>
      </div>

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

function TrainerDashboard() {
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Currently training</p>
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
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Across all clients</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Client adherence</p>
          </CardContent>
        </Card>
      </div>

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
                <span className="text-sm font-medium">Create Program</span>
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
