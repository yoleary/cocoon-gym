import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  Edit,
  Filter,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { RoleGuard } from "@/components/portal/role-guard";
import { getExercises } from "@/actions/exercise.actions";
import type { BodyRegion, MovementPattern } from "@/types";
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

// ─── Page ───────────────────────────────────────

export default async function ExerciseManagerPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    bodyRegion?: string;
    movementPattern?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <ExerciseManagerContent
        search={params.search}
        bodyRegion={params.bodyRegion as BodyRegion | undefined}
        movementPattern={params.movementPattern as MovementPattern | undefined}
        page={params.page ? parseInt(params.page, 10) : 1}
      />
    </RoleGuard>
  );
}

// ─── Content ────────────────────────────────────

async function ExerciseManagerContent({
  search,
  bodyRegion,
  movementPattern,
  page,
}: {
  search?: string;
  bodyRegion?: BodyRegion;
  movementPattern?: MovementPattern;
  page: number;
}) {
  const data = await getExercises({
    search,
    bodyRegion,
    movementPattern,
    page,
    pageSize: 50,
  });

  const bodyRegions: BodyRegion[] = [
    "UPPER_BODY",
    "LOWER_BODY",
    "CORE",
    "FULL_BODY",
  ];
  const movementPatterns: MovementPattern[] = [
    "HORIZONTAL_PUSH",
    "VERTICAL_PUSH",
    "HORIZONTAL_PULL",
    "VERTICAL_PULL",
    "HIP_HINGE",
    "SQUAT",
    "LUNGE",
    "CARRY",
    "ROTATION",
    "ANTI_ROTATION",
    "ISOLATION",
    "PLANK",
    "STRETCH",
  ];

  function buildFilterUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { search, bodyRegion, movementPattern, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    return `/portal/admin/exercises/manage?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Exercise Library
          </h1>
          <p className="text-sm text-muted-foreground">
            {data.total} exercises available. Create custom exercises for your
            clients.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/exercises/manage?create=true">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Exercise
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <form action="/portal/admin/exercises/manage" method="GET">
          {bodyRegion && (
            <input type="hidden" name="bodyRegion" value={bodyRegion} />
          )}
          {movementPattern && (
            <input
              type="hidden"
              name="movementPattern"
              value={movementPattern}
            />
          )}
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Search exercises..."
              defaultValue={search ?? ""}
              className="pl-8"
            />
          </div>
        </form>

        {/* Body Region filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
          <Button
            variant={!bodyRegion ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            asChild
          >
            <Link href={buildFilterUrl({ bodyRegion: undefined, movementPattern: undefined })}>
              All
            </Link>
          </Button>
          {bodyRegions.map((region) => (
            <Button
              key={region}
              variant={bodyRegion === region ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              asChild
            >
              <Link
                href={buildFilterUrl({
                  bodyRegion: bodyRegion === region ? undefined : region,
                  movementPattern: undefined,
                })}
              >
                {BODY_REGION_LABELS[region]}
              </Link>
            </Button>
          ))}
        </div>

        {/* Movement Pattern sub-filters */}
        {bodyRegion && (
          <div className="flex flex-wrap gap-1.5 ml-6">
            {movementPatterns.map((pattern) => (
              <Button
                key={pattern}
                variant={
                  movementPattern === pattern ? "secondary" : "ghost"
                }
                size="sm"
                className="h-6 text-[11px]"
                asChild
              >
                <Link
                  href={buildFilterUrl({
                    movementPattern:
                      movementPattern === pattern ? undefined : pattern,
                  })}
                >
                  {MOVEMENT_PATTERN_LABELS[pattern]}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Exercise list */}
      {data.exercises.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              {search || bodyRegion || movementPattern
                ? "No exercises match your filters."
                : "No exercises in the library yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="border-border/50 hover:border-primary/20 transition-colors"
            >
              <CardContent className="flex items-center gap-3 py-3 px-4">
                {/* Exercise info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/portal/exercises/${exercise.id}`}
                      className="truncate text-sm font-medium hover:text-primary transition-colors"
                    >
                      {exercise.name}
                    </Link>
                    {exercise.isCustom && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-orange-500/20 text-orange-600 bg-orange-500/5"
                      >
                        Custom
                      </Badge>
                    )}
                    {exercise.isCompound && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        Compound
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 leading-4 ${BODY_REGION_COLORS[exercise.bodyRegion] ?? ""}`}
                    >
                      {BODY_REGION_LABELS[exercise.bodyRegion] ??
                        exercise.bodyRegion}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 leading-4"
                    >
                      {MOVEMENT_PATTERN_LABELS[exercise.movementPattern] ??
                        exercise.movementPattern}
                    </Badge>
                    {exercise.muscles.slice(0, 3).map((m) => (
                      <Badge
                        key={m.name}
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 leading-4"
                      >
                        {m.name}
                        {m.role !== "PRIMARY" && (
                          <span className="ml-0.5 opacity-60 text-[9px]">
                            ({m.role.charAt(0)})
                          </span>
                        )}
                      </Badge>
                    ))}
                    {exercise.equipment.slice(0, 2).map((eq) => (
                      <Badge
                        key={eq}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 leading-4"
                      >
                        {eq}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/portal/exercises/${exercise.id}`}>
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  {exercise.isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildFilterUrl({ page: String(page - 1) } as any)}>
                Previous
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </span>
          {page < data.totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildFilterUrl({ page: String(page + 1) } as any)}>
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
