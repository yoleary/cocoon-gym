"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── Get library workouts ─────────────────────────

export async function getLibraryWorkouts() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can access workout library");

  const trainerId = session.user.id!;

  const workouts = await db.workoutTemplate.findMany({
    where: {
      trainerId,
      isLibrary: true,
    },
    include: {
      blocks: {
        include: {
          exercises: {
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  bodyRegion: true,
                  movementPattern: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return workouts.map((w) => ({
    id: w.id,
    name: w.name,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
    exerciseCount: w.blocks.reduce((sum, b) => sum + b.exercises.length, 0),
    blocks: w.blocks.map((b) => ({
      id: b.id,
      label: b.label,
      order: b.order,
      isSuperset: b.isSuperset,
      exercises: b.exercises.map((e) => ({
        id: e.id,
        exerciseId: e.exercise.id,
        exerciseName: e.exercise.name,
        bodyRegion: e.exercise.bodyRegion,
        movementPattern: e.exercise.movementPattern,
        position: e.position,
        order: e.order,
        targetSets: e.targetSets,
        targetReps: e.targetReps,
        restSeconds: e.restSeconds,
        notes: e.notes,
      })),
    })),
  }));
}

// ─── Get single library workout ───────────────────

export async function getLibraryWorkout(workoutId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can access workout library");

  const trainerId = session.user.id!;

  const workout = await db.workoutTemplate.findUnique({
    where: { id: workoutId },
    include: {
      blocks: {
        include: {
          exercises: {
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  bodyRegion: true,
                  movementPattern: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!workout) throw new Error("Workout not found");
  if (workout.trainerId !== trainerId) throw new Error("You do not own this workout");

  return {
    id: workout.id,
    name: workout.name,
    createdAt: workout.createdAt.toISOString(),
    updatedAt: workout.updatedAt.toISOString(),
    blocks: workout.blocks.map((b) => ({
      id: b.id,
      label: b.label,
      order: b.order,
      isSuperset: b.isSuperset,
      exercises: b.exercises.map((e) => ({
        id: e.id,
        exerciseId: e.exercise.id,
        exerciseName: e.exercise.name,
        bodyRegion: e.exercise.bodyRegion,
        movementPattern: e.exercise.movementPattern,
        position: e.position,
        order: e.order,
        targetSets: e.targetSets,
        targetReps: e.targetReps,
        targetWeight: e.targetWeight,
        tempo: e.tempo,
        restSeconds: e.restSeconds,
        notes: e.notes,
      })),
    })),
  };
}

// ─── Create library workout ───────────────────────

export async function createLibraryWorkout(data: {
  name: string;
  blocks: Array<{
    label: string;
    order: number;
    isSuperset?: boolean;
    exercises: Array<{
      exerciseId: string;
      position: string;
      order: number;
      targetSets?: number;
      targetReps?: string;
      restSeconds?: number;
      notes?: string;
    }>;
  }>;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can create workouts");

  const trainerId = session.user.id!;

  const workout = await db.workoutTemplate.create({
    data: {
      name: data.name,
      trainerId,
      isLibrary: true,
      order: 0,
      blocks: {
        create: data.blocks.map((b) => ({
          label: b.label,
          order: b.order,
          isSuperset: b.isSuperset ?? false,
          exercises: {
            create: b.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              position: e.position,
              order: e.order,
              targetSets: e.targetSets ?? null,
              targetReps: e.targetReps ?? null,
              restSeconds: e.restSeconds ?? null,
              notes: e.notes ?? null,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/portal/admin/workouts");

  return { id: workout.id, name: workout.name };
}

// ─── Update library workout ───────────────────────

export async function updateLibraryWorkout(
  workoutId: string,
  data: {
    name?: string;
    blocks?: Array<{
      label: string;
      order: number;
      isSuperset?: boolean;
      exercises: Array<{
        exerciseId: string;
        position: string;
        order: number;
        targetSets?: number;
        targetReps?: string;
        restSeconds?: number;
        notes?: string;
      }>;
    }>;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can update workouts");

  const trainerId = session.user.id!;

  // Verify ownership
  const existing = await db.workoutTemplate.findUnique({
    where: { id: workoutId },
    select: { trainerId: true, isLibrary: true },
  });

  if (!existing) throw new Error("Workout not found");
  if (existing.trainerId !== trainerId) throw new Error("You do not own this workout");
  if (!existing.isLibrary) throw new Error("Cannot edit program-attached workouts here");

  // If blocks are provided, delete existing and recreate
  if (data.blocks) {
    await db.templateBlock.deleteMany({
      where: { templateId: workoutId },
    });

    await db.workoutTemplate.update({
      where: { id: workoutId },
      data: {
        name: data.name,
        blocks: {
          create: data.blocks.map((b) => ({
            label: b.label,
            order: b.order,
            isSuperset: b.isSuperset ?? false,
            exercises: {
              create: b.exercises.map((e) => ({
                exerciseId: e.exerciseId,
                position: e.position,
                order: e.order,
                targetSets: e.targetSets ?? null,
                targetReps: e.targetReps ?? null,
                restSeconds: e.restSeconds ?? null,
                notes: e.notes ?? null,
              })),
            },
          })),
        },
      },
    });
  } else if (data.name) {
    await db.workoutTemplate.update({
      where: { id: workoutId },
      data: { name: data.name },
    });
  }

  revalidatePath("/portal/admin/workouts");
  revalidatePath(`/portal/admin/workouts/${workoutId}`);

  return { success: true };
}

// ─── Delete library workout ───────────────────────

export async function deleteLibraryWorkout(workoutId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can delete workouts");

  const trainerId = session.user.id!;

  // Verify ownership
  const existing = await db.workoutTemplate.findUnique({
    where: { id: workoutId },
    select: { trainerId: true, isLibrary: true },
  });

  if (!existing) throw new Error("Workout not found");
  if (existing.trainerId !== trainerId) throw new Error("You do not own this workout");
  if (!existing.isLibrary) throw new Error("Cannot delete program-attached workouts here");

  await db.workoutTemplate.delete({
    where: { id: workoutId },
  });

  revalidatePath("/portal/admin/workouts");

  return { success: true };
}

// ─── Import library workout to program ────────────

export async function importWorkoutToProgram(
  workoutId: string,
  programId: string,
  order: number,
  customName?: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can import workouts");

  const trainerId = session.user.id!;

  // Verify trainer owns the library workout
  const libraryWorkout = await db.workoutTemplate.findUnique({
    where: { id: workoutId },
    include: {
      blocks: {
        include: {
          exercises: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!libraryWorkout) throw new Error("Library workout not found");
  if (libraryWorkout.trainerId !== trainerId) throw new Error("You do not own this workout");

  // Verify trainer owns the program
  const program = await db.program.findUnique({
    where: { id: programId },
    select: { trainerId: true },
  });

  if (!program) throw new Error("Program not found");
  if (program.trainerId !== trainerId) throw new Error("You do not own this program");

  // Create a copy of the workout in the program
  const newTemplate = await db.workoutTemplate.create({
    data: {
      name: customName || libraryWorkout.name,
      programId,
      order,
      isLibrary: false,
      blocks: {
        create: libraryWorkout.blocks.map((b) => ({
          label: b.label,
          order: b.order,
          isSuperset: b.isSuperset,
          exercises: {
            create: b.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              position: e.position,
              order: e.order,
              targetSets: e.targetSets,
              targetReps: e.targetReps,
              targetWeight: e.targetWeight,
              tempo: e.tempo,
              restSeconds: e.restSeconds,
              notes: e.notes,
            })),
          },
        })),
      },
    },
  });

  revalidatePath(`/portal/admin/programs/${programId}`);

  return { templateId: newTemplate.id, name: newTemplate.name };
}
