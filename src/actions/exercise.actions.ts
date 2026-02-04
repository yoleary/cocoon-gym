"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { calculateE1RM } from "@/lib/metrics";
import type { BodyRegion, MovementPattern, MuscleRole } from "@prisma/client";

// ─── List exercises with filtering ───────────────

export async function getExercises(filters?: {
  bodyRegion?: BodyRegion;
  movementPattern?: MovementPattern;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const where: any = {};

  if (filters?.bodyRegion) {
    where.bodyRegion = filters.bodyRegion;
  }

  if (filters?.movementPattern) {
    where.movementPattern = filters.movementPattern;
  }

  if (filters?.search) {
    where.name = {
      contains: filters.search,
      mode: "insensitive",
    };
  }

  const [exercises, total] = await Promise.all([
    db.exercise.findMany({
      where,
      include: {
        muscles: {
          include: { muscleGroup: true },
        },
        equipment: {
          include: { equipment: true },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    }),
    db.exercise.count({ where }),
  ]);

  return {
    exercises: exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      bodyRegion: ex.bodyRegion,
      movementPattern: ex.movementPattern,
      isCompound: ex.isCompound,
      isCustom: ex.isCustom,
      videoUrl: ex.videoUrl,
      muscles: ex.muscles.map((m) => ({
        name: m.muscleGroup.name,
        role: m.role,
      })),
      equipment: ex.equipment.map((e) => e.equipment.name),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Get single exercise by ID ───────────────────

export async function getExerciseById(exerciseId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    include: {
      muscles: {
        include: { muscleGroup: true },
      },
      equipment: {
        include: { equipment: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
  });

  if (!exercise) throw new Error("Exercise not found");

  return {
    id: exercise.id,
    name: exercise.name,
    instructions: exercise.instructions,
    videoUrl: exercise.videoUrl,
    bodyRegion: exercise.bodyRegion,
    movementPattern: exercise.movementPattern,
    isCompound: exercise.isCompound,
    isCustom: exercise.isCustom,
    createdBy: exercise.createdBy,
    createdAt: exercise.createdAt.toISOString(),
    muscles: exercise.muscles.map((m) => ({
      id: m.muscleGroup.id,
      name: m.muscleGroup.name,
      role: m.role,
    })),
    equipment: exercise.equipment.map((e) => ({
      id: e.equipment.id,
      name: e.equipment.name,
    })),
  };
}

// ─── Create exercise (trainer only) ──────────────

export async function createExercise(data: {
  name: string;
  instructions?: string;
  videoUrl?: string;
  bodyRegion: BodyRegion;
  movementPattern: MovementPattern;
  isCompound?: boolean;
  muscles?: Array<{ muscleGroupId: string; role: MuscleRole }>;
  equipmentIds?: string[];
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can create exercises");

  const userId = session.user.id!;

  const exercise = await db.exercise.create({
    data: {
      name: data.name,
      instructions: data.instructions ?? null,
      videoUrl: data.videoUrl ?? null,
      bodyRegion: data.bodyRegion,
      movementPattern: data.movementPattern,
      isCompound: data.isCompound ?? true,
      isCustom: true,
      createdById: userId,
      muscles: data.muscles
        ? {
            create: data.muscles.map((m) => ({
              muscleGroupId: m.muscleGroupId,
              role: m.role,
            })),
          }
        : undefined,
      equipment: data.equipmentIds
        ? {
            create: data.equipmentIds.map((eqId) => ({
              equipmentId: eqId,
            })),
          }
        : undefined,
    },
    include: {
      muscles: { include: { muscleGroup: true } },
      equipment: { include: { equipment: true } },
    },
  });

  revalidatePath("/portal/exercises");

  return {
    id: exercise.id,
    name: exercise.name,
  };
}

// ─── Update exercise (trainer only) ──────────────

export async function updateExercise(
  exerciseId: string,
  data: {
    name?: string;
    instructions?: string | null;
    videoUrl?: string | null;
    bodyRegion?: BodyRegion;
    movementPattern?: MovementPattern;
    isCompound?: boolean;
    muscles?: Array<{ muscleGroupId: string; role: MuscleRole }>;
    equipmentIds?: string[];
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can update exercises");

  // Build update payload for scalar fields
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.instructions !== undefined) updateData.instructions = data.instructions;
  if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
  if (data.bodyRegion !== undefined) updateData.bodyRegion = data.bodyRegion;
  if (data.movementPattern !== undefined) updateData.movementPattern = data.movementPattern;
  if (data.isCompound !== undefined) updateData.isCompound = data.isCompound;

  await db.exercise.update({
    where: { id: exerciseId },
    data: updateData,
  });

  // Replace muscle relationships if provided
  if (data.muscles !== undefined) {
    await db.exerciseMuscle.deleteMany({ where: { exerciseId } });
    if (data.muscles.length > 0) {
      await db.exerciseMuscle.createMany({
        data: data.muscles.map((m) => ({
          exerciseId,
          muscleGroupId: m.muscleGroupId,
          role: m.role,
        })),
      });
    }
  }

  // Replace equipment relationships if provided
  if (data.equipmentIds !== undefined) {
    await db.exerciseEquipment.deleteMany({ where: { exerciseId } });
    if (data.equipmentIds.length > 0) {
      await db.exerciseEquipment.createMany({
        data: data.equipmentIds.map((eqId) => ({
          exerciseId,
          equipmentId: eqId,
        })),
      });
    }
  }

  revalidatePath("/portal/exercises");
  revalidatePath(`/portal/exercises/${exerciseId}`);
}

// ─── Delete exercise (trainer only) ──────────────

export async function deleteExercise(exerciseId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can delete exercises");

  // Verify the exercise exists and is custom (prevent deleting seed exercises)
  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    select: { isCustom: true, createdById: true },
  });

  if (!exercise) throw new Error("Exercise not found");

  if (!exercise.isCustom) {
    throw new Error("Cannot delete a built-in exercise");
  }

  // Check if exercise is used in any template
  const usageCount = await db.templateExercise.count({
    where: { exerciseId },
  });

  if (usageCount > 0) {
    throw new Error(
      `Cannot delete this exercise because it is used in ${usageCount} template(s). Remove it from all templates first.`
    );
  }

  // Cascade delete handles muscles and equipment via schema
  await db.exercise.delete({ where: { id: exerciseId } });

  revalidatePath("/portal/exercises");
}

// ─── Exercise history for a user ─────────────────

export async function getExerciseHistory(exerciseId: string, userId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Trainers can view any user's history; clients can only view their own
  const role = (session.user as any).role;
  const targetUserId = role === "TRAINER" && userId ? userId : session.user.id!;

  const sessionExercises = await db.sessionExercise.findMany({
    where: {
      exerciseId,
      session: {
        userId: targetUserId,
        completedAt: { not: null },
      },
    },
    include: {
      sets: { orderBy: { setNumber: "asc" } },
      session: {
        select: {
          id: true,
          startedAt: true,
          completedAt: true,
          template: { select: { name: true } },
        },
      },
    },
    orderBy: { session: { completedAt: "desc" } },
  });

  return sessionExercises.map((se) => {
    const completedSets = se.sets.filter((s) => s.completed);
    const bestSet = completedSets.reduce<{ weight: number; reps: number; e1rm: number } | null>(
      (best, set) => {
        if (set.weight && set.reps) {
          const e1rm = calculateE1RM(set.weight, set.reps);
          if (!best || e1rm > best.e1rm) {
            return { weight: set.weight, reps: set.reps, e1rm };
          }
        }
        return best;
      },
      null
    );

    const volume = completedSets.reduce((total, set) => {
      if (set.weight && set.reps) return total + set.weight * set.reps;
      return total;
    }, 0);

    return {
      sessionId: se.session.id,
      date: (se.session.completedAt ?? se.session.startedAt).toISOString(),
      templateName: se.session.template?.name ?? null,
      sets: se.sets.map((s) => ({
        setNumber: s.setNumber,
        setType: s.setType,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        completed: s.completed,
      })),
      bestE1RM: bestSet?.e1rm ?? null,
      bestWeight: bestSet?.weight ?? null,
      bestReps: bestSet?.reps ?? null,
      totalVolume: volume,
    };
  });
}
