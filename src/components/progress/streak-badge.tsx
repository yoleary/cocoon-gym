"use client";

import { Flame, Calendar, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils";

// ─── Props ───────────────────────────────────────

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

// ─── Component ───────────────────────────────────

export function StreakBadge({
  currentStreak,
  longestStreak,
  lastActivityDate,
}: StreakBadgeProps) {
  const isActive = currentStreak > 0;
  const isOnFire = currentStreak >= 4;

  return (
    <div className="space-y-4">
      {/* Main streak display */}
      <div className="flex items-center gap-4">
        {/* Flame icon with animation */}
        <div
          className={cn(
            "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl",
            isActive
              ? "bg-orange-500/10"
              : "bg-secondary"
          )}
        >
          <Flame
            className={cn(
              "h-8 w-8",
              isActive ? "text-orange-500" : "text-muted-foreground",
              isOnFire && "animate-pulse"
            )}
          />

          {/* Glow effect for active streaks */}
          {isOnFire && (
            <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-md" />
          )}

          {/* Fire particles for hot streaks */}
          {isOnFire && (
            <>
              <span
                className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-orange-400 animate-bounce"
                style={{ animationDelay: "0ms", animationDuration: "1.2s" }}
              />
              <span
                className="absolute -top-0.5 left-1/3 h-1 w-1 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
              />
              <span
                className="absolute top-0 right-1/3 h-1 w-1 rounded-full bg-yellow-400 animate-bounce"
                style={{ animationDelay: "400ms", animationDuration: "1s" }}
              />
            </>
          )}
        </div>

        {/* Streak count */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-4xl font-extrabold tabular-nums tracking-tight",
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"
                  : "text-muted-foreground"
              )}
            >
              {currentStreak}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {currentStreak === 1 ? "week" : "weeks"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {isActive ? "Current streak" : "No active streak"}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Longest streak */}
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/50 px-3 py-2.5">
          <Award className="h-4 w-4 shrink-0 text-amber-500" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Best streak</p>
            <p className="text-sm font-semibold tabular-nums">
              {longestStreak} {longestStreak === 1 ? "week" : "weeks"}
            </p>
          </div>
        </div>

        {/* Last activity */}
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/50 px-3 py-2.5">
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Last session</p>
            <p className="truncate text-sm font-semibold">
              {lastActivityDate
                ? formatRelativeDate(lastActivityDate)
                : "No sessions"}
            </p>
          </div>
        </div>
      </div>

      {/* Motivational message */}
      {isActive && (
        <p className="text-xs text-muted-foreground">
          {currentStreak >= 12
            ? "Incredible dedication! You are a machine."
            : currentStreak >= 8
              ? "Amazing consistency! Keep pushing forward."
              : currentStreak >= 4
                ? "You are on fire! Do not break the chain."
                : currentStreak >= 2
                  ? "Building momentum. Keep showing up!"
                  : "Great start! Come back next week to build your streak."}
        </p>
      )}
    </div>
  );
}
