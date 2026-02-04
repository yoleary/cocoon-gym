import Link from "next/link";
import {
  ChevronRight,
  Dumbbell,
  Filter,
  Search,
} from "lucide-react";
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

export default async function ExerciseLibraryPage({
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
  const search = params.search;
  const bodyRegion = params.bodyRegion as BodyRegion | undefined;
  const movementPattern = params.movementPattern as MovementPattern | undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;

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

  // Group exercises by body region for display
  const groupedByRegion = new Map<string, typeof data.exercises>();
  for (const ex of data.exercises) {
    const group = groupedByRegion.get(ex.bodyRegion) ?? [];
    group.push(ex);
    groupedByRegion.set(ex.bodyRegion, group);
  }

  function buildFilterUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = {
      search,
      bodyRegion,
      movementPattern,
      ...overrides,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return `/portal/exercises${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exercise Library</h1>
        <p className="text-sm text-muted-foreground">
          Browse {data.total} exercises. Tap any exercise to see details and
          your performance history.
        </p>
      </div>

      {/* Search */}
      <form action="/portal/exercises" method="GET">
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
          <Link
            href={buildFilterUrl({
              bodyRegion: undefined,
              movementPattern: undefined,
            })}
          >
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

      {/* Equipment filters can be added here in the future */}

      {/* Exercise list grouped by body region */}
      {data.exercises.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              No exercises match your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(groupedByRegion.entries()).map(
            ([region, exercises]) => (
              <div key={region}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${BODY_REGION_COLORS[region] ?? ""}`}
                  >
                    {BODY_REGION_LABELS[region] ?? region}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {exercises.length} exercise
                    {exercises.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {exercises.map((exercise) => (
                    <Link
                      key={exercise.id}
                      href={`/portal/exercises/${exercise.id}`}
                      className="group"
                    >
                      <Card className="border-border/50 transition-colors group-hover:border-primary/20 group-hover:shadow-sm h-full">
                        <CardContent className="flex items-center gap-3 py-3 px-4">
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                              {exercise.name}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 leading-4"
                              >
                                {MOVEMENT_PATTERN_LABELS[
                                  exercise.movementPattern
                                ] ?? exercise.movementPattern}
                              </Badge>
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
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <Separator className="mt-4" />
              </div>
            )
          )}
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
