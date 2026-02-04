import Link from "next/link";
import {
  Search,
  UserPlus,
  Users,
  Calendar,
  Dumbbell,
} from "lucide-react";
import { RoleGuard } from "@/components/portal/role-guard";
import { getClients } from "@/actions/client.actions";
import { formatRelativeDate } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search;

  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <ClientsContent search={search} />
    </RoleGuard>
  );
}

// ─── Main content (server) ──────────────────────

async function ClientsContent({ search }: { search?: string }) {
  const clients = await getClients({ search, activeOnly: true });

  const activeThisWeek = clients.filter((c) => {
    if (!c.lastSessionDate) return false;
    const diff = Date.now() - new Date(c.lastSessionDate).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const totalSessions = clients.reduce((sum, c) => sum + c.totalSessions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your client roster and invite new clients.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/clients?invite=true">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invite Client
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form action="/portal/admin/clients" method="GET">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search clients by name or email..."
            defaultValue={search ?? ""}
            className="pl-8"
          />
        </div>
      </form>

      {/* Stats summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active This Week
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeThisWeek}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      {clients.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              {search ? "No clients match your search." : "No clients yet."}
            </p>
            {!search && (
              <p className="text-xs text-muted-foreground">
                Invite your first client to get started.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/portal/admin/clients/${client.id}`}
              className="group"
            >
              <Card className="border-border/50 transition-colors group-hover:border-primary/30 group-hover:shadow-md h-full">
                <CardHeader className="flex flex-row items-start gap-3 pb-3">
                  <Avatar className="h-11 w-11">
                    {client.image && (
                      <AvatarImage src={client.image} alt={client.name} />
                    )}
                    <AvatarFallback className="text-sm font-medium">
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-sm">
                      {client.name}
                    </CardTitle>
                    <CardDescription className="truncate text-xs">
                      {client.email}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2.5 pt-0">
                  {client.goal && (
                    <Badge variant="secondary" className="text-xs">
                      {client.goal}
                    </Badge>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="h-3 w-3" />
                      {client.totalSessions} session
                      {client.totalSessions !== 1 ? "s" : ""}
                    </span>
                    <span>
                      {client.lastSessionDate
                        ? formatRelativeDate(client.lastSessionDate)
                        : "No sessions yet"}
                    </span>
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
