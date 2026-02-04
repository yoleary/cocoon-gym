import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPersonalRecords } from "@/actions/progress.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PRBoard } from "@/components/progress/pr-board";
import { Trophy, Search } from "lucide-react";
import type { PRRecord } from "@/types";

// ─── Props ──────────────────────────────────────────

interface RecordsPageProps {
  searchParams: Promise<{
    exercise?: string;
  }>;
}

// ─── Page ───────────────────────────────────────────

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string;
  const params = await searchParams;
  const exerciseFilter = params.exercise ?? undefined;

  // Fetch grouped records and flatten into PRRecord[] shape
  const grouped = await getPersonalRecords(userId);

  const allRecords: PRRecord[] = grouped.flatMap((group) =>
    group.records.map((rec) => ({
      exerciseName: group.exerciseName,
      recordType: rec.recordType as PRRecord["recordType"],
      value: rec.value,
      context: rec.context ?? "",
      achievedAt: rec.achievedAt,
    }))
  );

  // Apply exercise filter if provided
  const records = exerciseFilter
    ? allRecords.filter((r) => r.exerciseName === exerciseFilter)
    : allRecords;

  // Extract unique exercise names for the filter display (from all records)
  const exerciseNames = Array.from(
    new Set(allRecords.map((r) => r.exerciseName))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Personal Records</h1>
        <p className="text-muted-foreground">
          Your all-time bests across every exercise. Keep pushing boundaries.
        </p>
      </div>

      {/* Filter Bar */}
      {exerciseNames.length > 1 && (
        <Card className="border-border/50">
          <CardContent className="flex flex-wrap items-center gap-2 py-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>

            {/* "All" link */}
            <a
              href="/progress/records"
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                !exerciseFilter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </a>

            {/* Exercise filter links */}
            {exerciseNames.map((name) => (
              <a
                key={name}
                href={`/progress/records?exercise=${encodeURIComponent(name)}`}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  exerciseFilter === name
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {name}
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Filter Indicator */}
      {exerciseFilter && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Showing records for:</span>
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
            {exerciseFilter}
          </span>
          <a
            href="/progress/records"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Clear filter
          </a>
        </div>
      )}

      {/* PR Board */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            {exerciseFilter ? `${exerciseFilter} Records` : "All Personal Records"}
          </CardTitle>
          <CardDescription>
            {exerciseFilter
              ? `Your best performances for ${exerciseFilter}`
              : `${records.length} record${records.length !== 1 ? "s" : ""} across ${exerciseNames.length} exercise${exerciseNames.length !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PRBoard records={records} />
        </CardContent>
      </Card>
    </div>
  );
}
