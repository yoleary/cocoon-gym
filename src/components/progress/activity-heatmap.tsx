"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ActivityDay } from "@/types";

// ─── Props ───────────────────────────────────────

interface ActivityHeatmapProps {
  data: ActivityDay[];
}

// ─── Constants ───────────────────────────────────

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""] as const;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const INTENSITY_COLORS = [
  "bg-[#161b22]",   // 0 sessions
  "bg-[#0e4429]",   // 1 session
  "bg-[#006d32]",   // 2 sessions
  "bg-[#26a641]",   // 3 sessions
  "bg-[#39d353]",   // 4+ sessions
] as const;

const LEGEND_LABELS = ["None", "", "", "", "More"] as const;

// ─── Helpers ─────────────────────────────────────

function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

function dateToKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

// ─── Component ───────────────────────────────────

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const { weeks, monthLabels, countMap, totalSessions } = useMemo(() => {
    // Build lookup from data
    const map = new Map<string, number>();
    let total = 0;
    for (const day of data) {
      map.set(day.date, day.count);
      total += day.count;
    }

    // Build the 52-week grid ending at today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the most recent Sunday (end of the last column)
    const endDate = new Date(today);
    const todayDow = endDate.getDay(); // 0=Sun
    // We want Sunday to be the last row (index 6), so endDate is the upcoming Sunday
    // or today if today is Sunday
    if (todayDow !== 0) {
      endDate.setDate(endDate.getDate() + (7 - todayDow));
    }

    // Start date is 52 weeks before the end of the last column
    const numWeeks = 53;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (numWeeks * 7 - 1));

    // Build weeks array (each week is Mon-Sun, 7 cells)
    const weeksArr: Array<Array<{ date: string; count: number; isToday: boolean; isFuture: boolean }>> = [];
    const monthLabelPositions: Array<{ label: string; col: number }> = [];

    let currentDate = new Date(startDate);
    let lastMonth = -1;

    for (let w = 0; w < numWeeks; w++) {
      const week: Array<{ date: string; count: number; isToday: boolean; isFuture: boolean }> = [];

      for (let d = 0; d < 7; d++) {
        const key = dateToKey(currentDate);
        const isToday = key === dateToKey(today);
        const isFuture = currentDate > today;

        week.push({
          date: key,
          count: map.get(key) ?? 0,
          isToday,
          isFuture,
        });

        // Track month boundaries on the first day of each week (Monday, index 0)
        if (d === 0 && currentDate.getMonth() !== lastMonth) {
          monthLabelPositions.push({
            label: MONTH_NAMES[currentDate.getMonth()],
            col: w,
          });
          lastMonth = currentDate.getMonth();
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeksArr.push(week);
    }

    return {
      weeks: weeksArr,
      monthLabels: monthLabelPositions,
      countMap: map,
      totalSessions: total,
    };
  }, [data]);

  return (
    <div className="space-y-3">
      {/* Session count summary */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{totalSessions}</span>{" "}
        training session{totalSessions !== 1 ? "s" : ""} in the last year
      </p>

      {/* Heatmap grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex ml-8" style={{ gap: 0 }}>
            {monthLabels.map((ml, i) => (
              <div
                key={`${ml.label}-${i}`}
                className="text-[10px] text-muted-foreground"
                style={{
                  position: "relative",
                  left: `${ml.col * 14}px`,
                  marginRight: i < monthLabels.length - 1
                    ? `${((monthLabels[i + 1]?.col ?? ml.col) - ml.col) * 14 - 28}px`
                    : 0,
                  whiteSpace: "nowrap",
                }}
              >
                {ml.label}
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div className="mt-1 flex gap-0">
            {/* Day labels column */}
            <div className="flex flex-col gap-[3px] pr-1.5 pt-0">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="flex h-[11px] items-center text-[10px] leading-none text-muted-foreground"
                  style={{ width: 24 }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dIdx) => (
                  <div
                    key={day.date}
                    className={cn(
                      "h-[11px] w-[11px] rounded-[2px] transition-colors",
                      day.isFuture
                        ? "bg-transparent"
                        : INTENSITY_COLORS[getIntensity(day.count)],
                      day.isToday && "ring-1 ring-foreground/40"
                    )}
                    title={
                      day.isFuture
                        ? ""
                        : `${day.date}: ${day.count} session${day.count !== 1 ? "s" : ""}`
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div
            key={i}
            className={cn("h-[11px] w-[11px] rounded-[2px]", color)}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
