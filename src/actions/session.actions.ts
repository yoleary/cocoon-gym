"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { calculateE1RM, totalVolume } from "@/lib/metrics";
import { calculateWeekNumber } from "@/lib/progression";
import type { ProgressionType } from "@prisma/client";

export async function startSession(templateId: string, weekNumber?: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id!;

  // Look up the program context for this template
  const template = templateId
    ? await db.workoutTemplate.findUnique({
        where: { id: templateId },
        include: {
          program: {
            select: {
              id: true,
              weeks: true,
              progressionType: true,
            },
          },
          blocks: {
            include: {
              exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
            },
            orderBy: { order: "asc" },
          },
        },
      })
    : null;

  // Look up the client's assignment and baseline
  let computedWeekNumber = weekNumber ?? null;
  let progressionType: ProgressionType = "NONE";
  let totalWeeks = 6;
  let exerciseBaselineMap: Record<string, number> = {};

  if (template && template.program) {
    progressionType = template.program.progressionType;
    totalWeeks = template.program.weeks;

    // Find the active assignment for this user on this program
    const assignment = await db.programAssignment.findFirst({
      where: {
        programId: template.program.id,
        clientId: userId,
        active: true,
      },
      include: {
        baseline: {
          include: {
            exerciseBaselines: true,
          },
        },
      },
    });

    if (assignment) {
      // Calculate week number from start date if not provided
      if (computedWeekNumber == null) {
        computedWeekNumber = calculateWeekNumber(
          assignment.startDate,
          totalWeeks
        );
      }

      // Build exercise baseline map
      if (assignment.baseline) {
        for (const eb of assignment.baseline.exerciseBaselines) {
          exerciseBaselineMap[eb.exerciseId] = eb.startingWeight;
        }
      }
    }
  }

  const workoutSession = await db.workoutSession.create({
    data: {
      userId,
      templateId,
      weekNumber: computedWeekNumber,
      loggedBy: userId,
      startedAt: new Date(),
    },
  });

  // Create session exercises from template and collect their IDs
  const sessionExercises: Array<{
    id: string;
    exerciseId: string;
    position: string;
  }> = [];

  if (template) {
    let order = 0;
    for (const block of template.blocks) {
      for (const te of block.exercises) {
        const se = await db.sessionExercise.create({
          data: {
            sessionId: workoutSession.id,
            exerciseId: te.exerciseId,
            position: te.position,
            order: order++,
          },
        });
        sessionExercises.push({
          id: se.id,
          exerciseId: te.exerciseId,
          position: te.position,
        });
      }
    }
  }

  return {
    sessionId: workoutSession.id,
    sessionExercises,
    weekNumber: computedWeekNumber,
    progressionType,
    totalWeeks,
    exerciseBaselines: exerciseBaselineMap,
  };
}

export async function logSet(
  sessionExerciseId: string,
  data: {
    setNumber: number;
    setType?: string;
    weight?: number | null;
    reps?: number | null;
    durationSeconds?: number | null;
    rpe?: number | null;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const set = await db.exerciseSet.create({
    data: {
      sessionExerciseId,
      setNumber: data.setNumber,
      setType: (data.setType as any) ?? "WORKING",
      weight: data.weight ?? null,
      reps: data.reps ?? null,
      durationSeconds: data.durationSeconds ?? null,
      rpe: data.rpe ?? null,
      completed: true,
    },
  });

  return set.id;
}

export async function updateSet(
  setId: string,
  data: {
    weight?: number | null;
    reps?: number | null;
    durationSeconds?: number | null;
    rpe?: number | null;
    completed?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.exerciseSet.update({
    where: { id: setId },
    data,
  });
}

export async function completeSession(sessionId: string, notes?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Get all sets for this session to compute totals
  const workoutSession = await db.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      exercises: {
        include: { sets: true },
      },
    },
  });

  if (!workoutSession) throw new Error("Session not found");

  const allSets = workoutSession.exercises.flatMap((e) => e.sets);
  const vol = totalVolume(allSets);
  const startedAt = workoutSession.startedAt;
  const duration = Math.floor((Date.now() - startedAt.getTime()) / 1000);

  await db.workoutSession.update({
    where: { id: sessionId },
    data: {
      completedAt: new Date(),
      totalVolume: vol,
      duration,
      notes,
    },
  });

  // Check for PRs
  for (const exercise of workoutSession.exercises) {
    for (const set of exercise.sets) {
      if (set.completed && set.weight && set.reps) {
        const e1rm = calculateE1RM(set.weight, set.reps);

        const existingPR = await db.personalRecord.findFirst({
          where: {
            userId: workoutSession.userId,
            exerciseId: exercise.exerciseId,
            recordType: "E1RM",
          },
          orderBy: { value: "desc" },
        });

        if (!existingPR || e1rm > existingPR.value) {
          await db.personalRecord.create({
            data: {
              userId: workoutSession.userId,
              exerciseId: exercise.exerciseId,
              recordType: "E1RM",
              value: e1rm,
              context: `${set.weight}kg x ${set.reps} reps`,
            },
          });
        }

        // Check max weight PR
        const existingMaxWeight = await db.personalRecord.findFirst({
          where: {
            userId: workoutSession.userId,
            exerciseId: exercise.exerciseId,
            recordType: "MAX_WEIGHT",
          },
          orderBy: { value: "desc" },
        });

        if (!existingMaxWeight || set.weight > existingMaxWeight.value) {
          await db.personalRecord.create({
            data: {
              userId: workoutSession.userId,
              exerciseId: exercise.exerciseId,
              recordType: "MAX_WEIGHT",
              value: set.weight,
              context: `${set.weight}kg x ${set.reps} reps`,
            },
          });
        }
      }
    }
  }

  // Update streak
  await updateStreak(workoutSession.userId);

  revalidatePath("/portal/history");
  revalidatePath("/portal/progress");
  revalidatePath("/portal/dashboard");

  return { totalVolume: vol, duration };
}

async function updateStreak(userId: string) {
  const streak = await db.streak.findUnique({ where: { userId } });
  const now = new Date();

  if (!streak) {
    await db.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: now,
      },
    });
    return;
  }

  const lastActivity = streak.lastActivityDate;
  if (!lastActivity) {
    await db.streak.update({
      where: { userId },
      data: { currentStreak: 1, longestStreak: Math.max(1, streak.longestStreak), lastActivityDate: now },
    });
    return;
  }

  const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) {
    const newStreak = streak.currentStreak + 1;
    await db.streak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastActivityDate: now,
      },
    });
  } else {
    await db.streak.update({
      where: { userId },
      data: { currentStreak: 1, lastActivityDate: now },
    });
  }
}

export async function getPreviousPerformance(exerciseId: string, userId: string) {
  const lastSession = await db.sessionExercise.findFirst({
    where: {
      exerciseId,
      session: { userId, completedAt: { not: null } },
    },
    include: { sets: { orderBy: { setNumber: "asc" } } },
    orderBy: { session: { completedAt: "desc" } },
  });

  if (!lastSession) return null;

  const bestE1RM = lastSession.sets.reduce((best, set) => {
    if (set.weight && set.reps) {
      const e1rm = calculateE1RM(set.weight, set.reps);
      return e1rm > best ? e1rm : best;
    }
    return best;
  }, 0);

  return {
    sets: lastSession.sets.map((s) => ({
      weight: s.weight,
      reps: s.reps,
      setType: s.setType,
    })),
    bestE1RM: bestE1RM || null,
  };
}

export async function getSessionDetail(sessionId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      template: true,
      exercises: {
        include: {
          exercise: true,
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  });
}
