"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── Get baseline for a program assignment ───────

export async function getBaseline(assignmentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const baseline = await db.clientBaseline.findUnique({
    where: { programAssignmentId: assignmentId },
    include: {
      exerciseBaselines: {
        include: {
          exercise: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!baseline) return null;

  return {
    id: baseline.id,
    programAssignmentId: baseline.programAssignmentId,
    bodyWeightKg: baseline.bodyWeightKg,
    age: baseline.age,
    bodyFatPercent: baseline.bodyFatPercent,
    notes: baseline.notes,
    recordedAt: baseline.recordedAt.toISOString(),
    exerciseBaselines: baseline.exerciseBaselines.map((eb) => ({
      id: eb.id,
      exerciseId: eb.exerciseId,
      exerciseName: eb.exercise.name,
      startingWeight: eb.startingWeight,
      startingReps: eb.startingReps,
      notes: eb.notes,
    })),
  };
}

// ─── Save (create or update) baseline ────────────

export async function saveBaseline(
  assignmentId: string,
  data: {
    bodyWeightKg?: number | null;
    age?: number | null;
    bodyFatPercent?: number | null;
    notes?: string | null;
    exerciseBaselines: Array<{
      exerciseId: string;
      startingWeight: number;
      startingReps?: number | null;
      notes?: string | null;
    }>;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can record baselines");

  const userId = session.user.id!;

  // Verify the assignment exists
  const assignment = await db.programAssignment.findUnique({
    where: { id: assignmentId },
    include: { program: { select: { trainerId: true, id: true } } },
  });

  if (!assignment) throw new Error("Assignment not found");
  if (assignment.program.trainerId !== userId)
    throw new Error("You do not own this program");

  // Upsert baseline
  const existing = await db.clientBaseline.findUnique({
    where: { programAssignmentId: assignmentId },
  });

  if (existing) {
    // Update existing baseline
    await db.clientBaseline.update({
      where: { id: existing.id },
      data: {
        bodyWeightKg: data.bodyWeightKg ?? null,
        age: data.age ?? null,
        bodyFatPercent: data.bodyFatPercent ?? null,
        notes: data.notes ?? null,
        recordedAt: new Date(),
      },
    });

    // Delete old exercise baselines and recreate
    await db.exerciseBaseline.deleteMany({
      where: { clientBaselineId: existing.id },
    });

    if (data.exerciseBaselines.length > 0) {
      await db.exerciseBaseline.createMany({
        data: data.exerciseBaselines.map((eb) => ({
          clientBaselineId: existing.id,
          exerciseId: eb.exerciseId,
          startingWeight: eb.startingWeight,
          startingReps: eb.startingReps ?? null,
          notes: eb.notes ?? null,
        })),
      });
    }
  } else {
    // Create new baseline
    await db.clientBaseline.create({
      data: {
        programAssignmentId: assignmentId,
        recordedById: userId,
        bodyWeightKg: data.bodyWeightKg ?? null,
        age: data.age ?? null,
        bodyFatPercent: data.bodyFatPercent ?? null,
        notes: data.notes ?? null,
        exerciseBaselines: {
          create: data.exerciseBaselines.map((eb) => ({
            exerciseId: eb.exerciseId,
            startingWeight: eb.startingWeight,
            startingReps: eb.startingReps ?? null,
            notes: eb.notes ?? null,
          })),
        },
      },
    });
  }

  revalidatePath(`/portal/admin/programs/${assignment.program.id}`);

  return { success: true };
}

// ─── Delete baseline ─────────────────────────────

export async function deleteBaseline(assignmentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can delete baselines");

  const userId = session.user.id!;

  const baseline = await db.clientBaseline.findUnique({
    where: { programAssignmentId: assignmentId },
    include: { programAssignment: { include: { program: { select: { trainerId: true, id: true } } } } },
  });

  if (!baseline) throw new Error("Baseline not found");
  if (baseline.programAssignment.program.trainerId !== userId)
    throw new Error("You do not own this program");

  await db.clientBaseline.delete({
    where: { id: baseline.id },
  });

  revalidatePath(
    `/portal/admin/programs/${baseline.programAssignment.program.id}`
  );

  return { success: true };
}
