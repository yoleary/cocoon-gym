import Link from "next/link";
import {
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Layers,
  Play,
} from "lucide-react";
import { getPrograms } from "@/actions/program.actions";
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

export default async function WorkoutsPage() {
  const programs = await getPrograms();

  // Flatten all templates from all assigned programs
  const allTemplates = programs.flatMap((program) =>
    program.templates.map((template) => ({
      ...template,
      programName: program.name,
      programId: program.id,
      weeks: program.weeks,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workouts</h1>
        <p className="text-sm text-muted-foreground">
          Choose a workout template from your assigned programs.
        </p>
      </div>

      {/* Workout templates */}
      {allTemplates.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              No workout templates available.
            </p>
            <p className="text-xs text-muted-foreground">
              Your trainer needs to assign a program to you first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Group templates by program */}
          {programs.map((program) => {
            if (program.templates.length === 0) return null;

            return (
              <div key={program.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-semibold">{program.name}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {program.weeks} week{program.weeks !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {program.templates.map((template) => (
                    <Card
                      key={template.id}
                      className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Badge
                              variant="outline"
                              className="mb-2 font-mono text-xs tabular-nums"
                            >
                              Day {template.order + 1}
                            </Badge>
                            <CardTitle className="text-base">
                              {template.name}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 pt-0">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            Template
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            From: {program.name}
                          </span>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-2">
                          <Button className="flex-1 gap-1.5" asChild>
                            <Link href={`/portal/workouts/${template.id}`}>
                              <Play className="h-4 w-4" />
                              Start Workout
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/portal/workouts/${template.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
