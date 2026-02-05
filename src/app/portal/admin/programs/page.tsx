import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Users,
  FileStack,
  ChevronRight,
} from "lucide-react";
import { RoleGuard } from "@/components/portal/role-guard";
import { getPrograms } from "@/actions/program.actions";
import { formatRelativeDate } from "@/lib/utils";
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

export default async function ProgramsPage() {
  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <ProgramsContent />
    </RoleGuard>
  );
}

// ─── Content ────────────────────────────────────

async function ProgramsContent() {
  const programs = await getPrograms();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programs</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage training programs for your clients.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/programs?create=true">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Program
          </Link>
        </Button>
      </div>

      {/* Program list */}
      {programs.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              No programs created yet.
            </p>
            <p className="text-xs text-muted-foreground">
              Create your first program to start assigning workouts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/portal/admin/programs/${program.id}`}
              className="group"
            >
              <Card className="border-border/50 transition-colors group-hover:border-primary/30 group-hover:shadow-md h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-base">
                        {program.name}
                      </CardTitle>
                      {program.description && (
                        <CardDescription className="mt-1 line-clamp-2 text-xs">
                          {program.description}
                        </CardDescription>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-foreground transition-colors mt-0.5" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Tags row */}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs gap-1">
                      <FileStack className="h-3 w-3" />
                      {program.templateCount} template
                      {program.templateCount !== 1 ? "s" : ""}
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1">
                      {program.weeks} week
                      {program.weeks !== 1 ? "s" : ""}
                    </Badge>
                    {"progressionType" in program &&
                      (program as any).progressionType !== "NONE" && (
                        <Badge variant="secondary" className="text-xs">
                          {(program as any).progressionType}
                        </Badge>
                      )}
                  </div>

                  <Separator />

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {"activeAssignments" in program
                        ? `${(program as any).activeAssignments} client${(program as any).activeAssignments !== 1 ? "s" : ""}`
                        : "Assigned"}
                    </span>
                    <span>
                      Updated {formatRelativeDate((program as any).updatedAt ?? (program as any).createdAt ?? new Date().toISOString())}
                    </span>
                  </div>

                  {/* Template names */}
                  {program.templates.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {program.templates.slice(0, 4).map((t) => (
                        <Badge
                          key={t.id}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {t.name}
                        </Badge>
                      ))}
                      {program.templates.length > 4 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          +{program.templates.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
