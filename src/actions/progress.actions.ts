"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateE1RM } from "@/lib/metrics";

// ─── Personal Records grouped by exercise ────────

export async function getPersonalRecords(userId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  const targetUserId =
    role === "TRAINER" && userId ? userId : session.user.id!;

  const records = await db.personalRecord.findMany({
    where: { userId: targetUserId },
    include: {
      exercise: {
        select: { id: true, name: true, bodyRegion: true },
      },
    },
    orderBy: { achievedAt: "desc" },
  });

  // Group by exercise
  const grouped: Record<
    string,
    {
      exerciseId: string;
      exerciseName: string;
      bodyRegion: string;
      records: Array<{
        id: string;
        recordType: string;
        value: number;
        context: string | null;
        achievedAt: string;
      }>;
    }
  > = {};

  for (const record of records) {
    const key = record.exerciseId;
    if (!grouped[key]) {
      grouped[key] = {
        exerciseId: record.exercise.id,
        exerciseName: record.exercise.name,
        bodyRegion: record.exercise.bodyRegion,
        records: [],
      };
    }
    grouped[key].records.push({
      id: record.id,
      recordType: record.recordType,
      value: record.value,
      context: record.context,
      achievedAt: record.achievedAt.toISOString(),
    });
  }

  // Return as array, keep only the latest record per type per exercise
  return Object.values(grouped).map((group) => {
    const bestByType: Record<string, (typeof group.records)[0]> = {};
    for (const rec of group.records) {
      if (!bestByType[rec.recordType] || rec.value > bestByType[rec.recordType].value) {
        bestByType[rec.recordType] = rec;
      }
    }

    return {
      ...group,
      records: Object.values(bestByType),
    };
  });
}

// ─── Weekly volume data points ───────────────────

export async function getVolumeHistory(
  userId?: string,
  weeks: number = 12
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  const targetUserId =
    role === "TRAINER" && userId ? userId : session.user.id!;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - weeks * 7);

  const sessions = await db.workoutSession.findMany({
    where: {
      userId: targetUserId,
      completedAt: { not: null, gte: cutoffDate },
      totalVolume: { not: null },
    },
    select: {
      completedAt: true,
      totalVolume: true,
    },
    orderBy: { completedAt: "asc" },
  });

  // Aggregate into ISO week buckets
  const weekBuckets: Record<string, { volume: number; sessions: number }> = {};

  for (const s of sessions) {
    const date = s.completedAt!;
    const weekStart = getWeekStart(date);
    const key = weekStart.toISOString().split("T")[0];

    if (!weekBuckets[key]) {
      weekBuckets[key] = { volume: 0, sessions: 0 };
    }

    weekBuckets[key].volume += s.totalVolume ?? 0;
    weekBuckets[key].sessions += 1;
  }

  return Object.entries(weekBuckets)
    .map(([date, data]) => ({
      date,
      volume: Math.round(data.volume),
      label: `${data.sessions} session${data.sessions !== 1 ? "s" : ""}`,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── E1RM progression for a specific exercise ────

export async function getE1RMHistory(
  exerciseId: string,
  userId?: string,
  months: number = 6
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  const targetUserId =
    role === "TRAINER" && userId ? userId : session.user.id!;

  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  const sessionExercises = await db.sessionExercise.findMany({
    where: {
      exerciseId,
      session: {
        userId: targetUserId,
        completedAt: { not: null, gte: cutoffDate },
      },
    },
    include: {
      sets: {
        where: { completed: true },
        orderBy: { setNumber: "asc" },
      },
      session: {
        select: { completedAt: true },
      },
    },
    orderBy: { session: { completedAt: "asc" } },
  });

  const dataPoints: Array<{
    date: string;
    e1rm: number;
    weight: number;
    reps: number;
  }> = [];

  for (const se of sessionExercises) {
    let bestE1RM = 0;
    let bestWeight = 0;
    let bestReps = 0;

    for (const set of se.sets) {
      if (set.weight && set.reps) {
        const e1rm = calculateE1RM(set.weight, set.reps);
        if (e1rm > bestE1RM) {
          bestE1RM = e1rm;
          bestWeight = set.weight;
          bestReps = set.reps;
        }
      }
    }

    if (bestE1RM > 0) {
      dataPoints.push({
        date: se.session.completedAt!.toISOString(),
        e1rm: Math.round(bestE1RM * 10) / 10,
        weight: bestWeight,
        reps: bestReps,
      });
    }
  }

  return dataPoints;
}

// ─── Training frequency calendar data ────────────

export async function getActivityData(
  userId?: string,
  months: number = 6
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  const targetUserId =
    role === "TRAINER" && userId ? userId : session.user.id!;

  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  const sessions = await db.workoutSession.findMany({
    where: {
      userId: targetUserId,
      completedAt: { not: null, gte: cutoffDate },
    },
    select: {
      completedAt: true,
    },
    orderBy: { completedAt: "asc" },
  });

  // Aggregate by date
  const dayCounts: Record<string, number> = {};

  for (const s of sessions) {
    const dateKey = s.completedAt!.toISOString().split("T")[0];
    dayCounts[dateKey] = (dayCounts[dateKey] ?? 0) + 1;
  }

  return Object.entries(dayCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Volume breakdown by muscle group ────────────

export async function getMuscleGroupBreakdown(
  userId?: string,
  weeks: number = 4
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  const targetUserId =
    role === "TRAINER" && userId ? userId : session.user.id!;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - weeks * 7);

  // Get all completed session exercises with their sets and exercise muscle data
  const sessionExercises = await db.sessionExercise.findMany({
    where: {
      session: {
        userId: targetUserId,
        completedAt: { not: null, gte: cutoffDate },
      },
    },
    include: {
      sets: {
        where: { completed: true },
      },
      exercise: {
        include: {
          muscles: {
            include: { muscleGroup: true },
          },
        },
      },
    },
  });

  // Calculate volume per muscle group
  const muscleVolumes: Record<string, number> = {};

  for (const se of sessionExercises) {
    const exerciseVolume = se.sets.reduce((total, set) => {
      if (set.weight && set.reps) return total + set.weight * set.reps;
      return total;
    }, 0);

    if (exerciseVolume === 0) continue;

    for (const muscle of se.exercise.muscles) {
      const name = muscle.muscleGroup.name;

      // Weight volume contribution by muscle role
      let contribution = 1.0;
      if (muscle.role === "SECONDARY") contribution = 0.5;
      if (muscle.role === "STABILIZER") contribution = 0.25;

      muscleVolumes[name] = (muscleVolumes[name] ?? 0) + exerciseVolume * contribution;
    }
  }

  const totalVolume = Object.values(muscleVolumes).reduce((sum, v) => sum + v, 0);

  const breakdown = Object.entries(muscleVolumes)
    .map(([name, volume]) => ({
      name,
      volume: Math.round(volume),
      percentage: totalVolume > 0 ? Math.round((volume / totalVolume) * 100) : 0,
    }))
    .sort((a, b) => b.volume - a.volume);

  return breakdown;
}

// ─── Current streak data ─────────────────────────

export async function getStreak(userId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  const targetUserId =
    role === "TRAINER" && userId ? userId : session.user.id!;

  const streak = await db.streak.findUnique({
    where: { userId: targetUserId },
  });

  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      freezesUsed: 0,
      freezesAllowed: 2,
    };
  }

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActivityDate: streak.lastActivityDate?.toISOString() ?? null,
    freezesUsed: streak.freezesUsed,
    freezesAllowed: streak.freezesAllowed,
  };
}

// ─── User achievements ──────────────────────────

export async function getAchievements(userId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  const targetUserId =
    role === "TRAINER" && userId ? userId : session.user.id!;

  // Get all achievements and mark which ones the user has earned
  const [allAchievements, userAchievements] = await Promise.all([
    db.achievement.findMany({
      orderBy: [{ category: "asc" }, { threshold: "asc" }],
    }),
    db.userAchievement.findMany({
      where: { userId: targetUserId },
      select: { achievementId: true, earnedAt: true },
    }),
  ]);

  const earnedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.earnedAt])
  );

  // Collect progress data for computing achievement completion
  const [sessionCount, totalVolume, prCount, streakData] = await Promise.all([
    db.workoutSession.count({
      where: { userId: targetUserId, completedAt: { not: null } },
    }),
    db.workoutSession.aggregate({
      where: { userId: targetUserId, completedAt: { not: null } },
      _sum: { totalVolume: true },
    }),
    db.personalRecord.count({
      where: { userId: targetUserId },
    }),
    db.streak.findUnique({
      where: { userId: targetUserId },
      select: { longestStreak: true },
    }),
  ]);

  const progressByCategory: Record<string, number> = {
    sessions: sessionCount,
    volume: Math.round(totalVolume._sum.totalVolume ?? 0),
    prs: prCount,
    streak: streakData?.longestStreak ?? 0,
  };

  return allAchievements.map((achievement) => {
    const earnedAt = earnedMap.get(achievement.id);
    const progress = progressByCategory[achievement.category] ?? 0;

    return {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      tier: achievement.tier,
      category: achievement.category,
      threshold: achievement.threshold,
      earned: !!earnedAt,
      earnedAt: earnedAt?.toISOString() ?? null,
      progress: Math.min(progress, achievement.threshold),
      progressPercentage: Math.min(
        Math.round((progress / achievement.threshold) * 100),
        100
      ),
    };
  });
}

// ─── Alias for streak data (used by progress page) ──

export async function getStreakData(userId?: string) {
  return getStreak(userId);
}

// ─── Summary stats for progress overview ────────────

export async function getProgressSummary(userId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  const targetUserId =
    role === "TRAINER" && userId ? userId : session.user.id!;

  const [sessionCount, volumeAgg, prCount] = await Promise.all([
    db.workoutSession.count({
      where: { userId: targetUserId, completedAt: { not: null } },
    }),
    db.workoutSession.aggregate({
      where: { userId: targetUserId, completedAt: { not: null } },
      _sum: { totalVolume: true },
    }),
    db.personalRecord.count({
      where: { userId: targetUserId },
    }),
  ]);

  return {
    totalSessions: sessionCount,
    totalVolume: Math.round(volumeAgg._sum.totalVolume ?? 0),
    totalPRs: prCount,
  };
}

// ─── Helper: get Monday of the ISO week ──────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Shift so Monday = 0
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
