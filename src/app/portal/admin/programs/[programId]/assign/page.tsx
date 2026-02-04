import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Link2, Users } from "lucide-react";
import { RoleGuard } from "@/components/portal/role-guard";
import { getProgramById, assignProgram } from "@/actions/program.actions";
import { getClients } from "@/actions/client.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function AssignProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <AssignProgramContent programId={programId} />
    </RoleGuard>
  );
}

// ─── Content ────────────────────────────────────

async function AssignProgramContent({ programId }: { programId: string }) {
  let program: Awaited<ReturnType<typeof getProgramById>>;

  try {
    program = await getProgramById(programId);
  } catch {
    notFound();
  }

  const clients = await getClients({ activeOnly: true });

  // Filter out clients that are already assigned to this program
  const assignedClientIds = new Set(
    program.assignments.map((a) => a.clientId)
  );
  const availableClients = clients.filter(
    (c) => !assignedClientIds.has(c.id)
  );

  // ── Server action for form submission ─────────

  async function handleAssign(formData: FormData) {
    "use server";

    const clientId = formData.get("clientId") as string;
    const startDateStr = formData.get("startDate") as string;

    if (!clientId) throw new Error("Please select a client");

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    await assignProgram(programId, clientId, startDate);

    redirect(`/portal/admin/programs/${programId}`);
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/portal/admin/programs/${programId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Program
        </Link>
      </Button>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assign Program</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign &quot;{program.name}&quot; to one of your clients.
        </p>
      </div>

      {/* Program summary */}
      <Card className="border-border/50 bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{program.name}</CardTitle>
          {program.description && (
            <CardDescription className="text-xs">
              {program.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {program.templates.length} template
              {program.templates.length !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {program.weeks} week{program.weeks !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              <Users className="h-3 w-3" />
              {program.assignments.length} currently assigned
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Assignment form */}
      {availableClients.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              All your clients are already assigned to this program.
            </p>
            <p className="text-xs text-muted-foreground">
              Invite a new client or create another program.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Assignment Details
            </CardTitle>
            <CardDescription>
              Select a client and optionally set a start date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleAssign} className="space-y-6">
              {/* Client select */}
              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <Select name="clientId" required>
                  <SelectTrigger id="clientId">
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <span className="flex items-center gap-2">
                          <span>{client.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({client.email})
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative max-w-xs">
                  <CalendarDays className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave as today to start immediately.
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button type="submit">
                  <Link2 className="h-4 w-4 mr-1.5" />
                  Assign Program
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/portal/admin/programs/${programId}`}>
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
