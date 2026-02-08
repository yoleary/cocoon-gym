"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ProgressionType } from "@prisma/client";

// ─── List programs ───────────────────────────────

export async function getPrograms() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  const userId = session.user.id!;

  if (role === "TRAINER") {
    // Trainers see all programs they created
    const programs = await db.program.findMany({
      where: { trainerId: userId },
      include: {
        templates: {
          select: { id: true, name: true, order: true },
          orderBy: { order: "asc" },
        },
        assignments: {
          where: { active: true },
          select: { id: true, clientId: true },
        },
        _count: {
          select: { assignments: { where: { active: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return programs.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      weeks: p.weeks,
      progressionType: p.progressionType,
      templateCount: p.templates.length,
      templates: p.templates.map((t) => ({ id: t.id, name: t.name, order: t.order })),
      activeAssignments: p._count.assignments,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  // Clients see programs assigned to them
  const assignments = await db.programAssignment.findMany({
    where: { clientId: userId, active: true },
    include: {
      program: {
        include: {
          trainer: { select: { id: true, name: true } },
          templates: {
            select: { id: true, name: true, order: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return assignments.map((a) => ({
    id: a.program.id,
    name: a.program.name,
    description: a.program.description,
    weeks: a.program.weeks,
    progressionType: a.program.progressionType,
    templateCount: a.program.templates.length,
    templates: a.program.templates.map((t) => ({ id: t.id, name: t.name, order: t.order })),
    trainerName: a.program.trainer.name,
    startDate: a.startDate.toISOString(),
    assignmentId: a.id,
  }));
}

// ─── Get program by ID with full structure ───────

export async function getProgramById(programId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const program = await db.program.findUnique({
    where: { id: programId },
    include: {
      trainer: { select: { id: true, name: true } },
      templates: {
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
                      videoUrl: true,
                    },
                  },
                },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      assignments: {
        where: { active: true },
        select: {
          id: true,
          clientId: true,
          startDate: true,
          baseline: { select: { id: true } },
        },
      },
    },
  });

  if (!program) throw new Error("Program not found");

  // Authorization: trainer who created it, or assigned client
  const role = (session.user as any).role;
  const userId = session.user.id!;

  if (role === "TRAINER" && program.trainerId !== userId) {
    throw new Error("You do not have access to this program");
  }

  if (role === "CLIENT") {
    const isAssigned = program.assignments.some((a) => a.clientId === userId);
    if (!isAssigned) throw new Error("You do not have access to this program");
  }

  return {
    id: program.id,
    name: program.name,
    description: program.description,
    weeks: program.weeks,
    progressionType: program.progressionType,
    trainer: program.trainer,
    createdAt: program.createdAt.toISOString(),
    updatedAt: program.updatedAt.toISOString(),
    templates: program.templates.map((t) => ({
      id: t.id,
      name: t.name,
      order: t.order,
      blocks: t.blocks.map((b) => ({
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
          videoUrl: e.exercise.videoUrl,
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
    })),
    assignments: await Promise.all(
      program.assignments.map(async (a) => {
        const client = await db.user.findUnique({
          where: { id: a.clientId },
          select: { name: true, email: true },
        });
        return {
          id: a.id,
          clientId: a.clientId,
          clientName: client?.name ?? "Unknown",
          clientEmail: client?.email ?? "",
          startDate: a.startDate.toISOString(),
          hasBaseline: !!a.baseline,
        };
      })
    ),
  };
}

// ─── Create program (trainer only) ───────────────

export async function createProgram(data: {
  name: string;
  description?: string;
  weeks?: number;
  progressionType?: ProgressionType;
  templates?: Array<{
    name: string;
    order: number;
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
        targetWeight?: string;
        tempo?: string;
        restSeconds?: number;
        notes?: string;
      }>;
    }>;
  }>;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can create programs");

  const trainerId = session.user.id!;

  const program = await db.program.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      weeks: data.weeks ?? 6,
      progressionType: data.progressionType ?? "NONE",
      trainerId,
      templates: data.templates
        ? {
            create: data.templates.map((t) => ({
              name: t.name,
              order: t.order,
              blocks: {
                create: t.blocks.map((b) => ({
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
                      targetWeight: e.targetWeight ?? null,
                      tempo: e.tempo ?? null,
                      restSeconds: e.restSeconds ?? null,
                      notes: e.notes ?? null,
                    })),
                  },
                })),
              },
            })),
          }
        : undefined,
    },
  });

  revalidatePath("/portal/programs");

  return { id: program.id, name: program.name };
}

// ─── Update program details (trainer only) ───────

export async function updateProgram(
  programId: string,
  data: {
    name?: string;
    description?: string | null;
    weeks?: number;
    progressionType?: ProgressionType;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can update programs");

  const userId = session.user.id!;

  // Verify ownership
  const existing = await db.program.findUnique({
    where: { id: programId },
    select: { trainerId: true },
  });

  if (!existing) throw new Error("Program not found");
  if (existing.trainerId !== userId) throw new Error("You do not own this program");

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.weeks !== undefined) updateData.weeks = data.weeks;
  if (data.progressionType !== undefined) updateData.progressionType = data.progressionType;

  await db.program.update({
    where: { id: programId },
    data: updateData,
  });

  revalidatePath("/portal/programs");
  revalidatePath(`/portal/programs/${programId}`);
}

// ─── Assign program to a client (trainer only) ───

export async function assignProgram(
  programId: string,
  clientId: string,
  startDate?: Date
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can assign programs");

  const trainerId = session.user.id!;

  // Verify trainer owns the program
  const program = await db.program.findUnique({
    where: { id: programId },
    select: { trainerId: true },
  });

  if (!program) throw new Error("Program not found");
  if (program.trainerId !== trainerId) throw new Error("You do not own this program");

  // Verify trainer-client relationship exists and is active
  const relationship = await db.trainerClient.findUnique({
    where: {
      trainerId_clientId: { trainerId, clientId },
    },
  });

  if (!relationship || !relationship.active) {
    throw new Error("No active trainer-client relationship found");
  }

  // Deactivate any existing active assignment for this client on this program
  await db.programAssignment.updateMany({
    where: { programId, clientId, active: true },
    data: { active: false },
  });

  const assignment = await db.programAssignment.create({
    data: {
      programId,
      clientId,
      startDate: startDate ?? new Date(),
      active: true,
    },
  });

  revalidatePath("/portal/programs");
  revalidatePath(`/portal/clients/${clientId}`);

  return { assignmentId: assignment.id };
}

// ─── Unassign program from a client (trainer only) ───

export async function unassignProgram(assignmentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can unassign programs");

  const trainerId = session.user.id!;

  // Get the assignment and verify ownership
  const assignment = await db.programAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      program: { select: { trainerId: true, id: true } },
    },
  });

  if (!assignment) throw new Error("Assignment not found");
  if (assignment.program.trainerId !== trainerId) {
    throw new Error("You do not own this program");
  }

  // Deactivate the assignment
  await db.programAssignment.update({
    where: { id: assignmentId },
    data: { active: false },
  });

  revalidatePath("/portal/programs");
  revalidatePath(`/portal/admin/programs/${assignment.program.id}`);
  revalidatePath(`/portal/clients/${assignment.clientId}`);

  return { success: true };
}

// ─── Duplicate program (trainer only) ────────────

export async function duplicateProgram(programId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can duplicate programs");

  const trainerId = session.user.id!;

  // Fetch the source program with full structure
  const source = await db.program.findUnique({
    where: { id: programId },
    include: {
      templates: {
        include: {
          blocks: {
            include: {
              exercises: { orderBy: { order: "asc" } },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!source) throw new Error("Program not found");
  if (source.trainerId !== trainerId) throw new Error("You do not own this program");

  // Create duplicate with nested templates, blocks, and exercises
  const duplicate = await db.program.create({
    data: {
      name: `${source.name} (Copy)`,
      description: source.description,
      weeks: source.weeks,
      progressionType: source.progressionType,
      trainerId,
      templates: {
        create: source.templates.map((t) => ({
          name: t.name,
          order: t.order,
          blocks: {
            create: t.blocks.map((b) => ({
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
        })),
      },
    },
  });

  revalidatePath("/portal/admin/programs");

  return { id: duplicate.id, name: duplicate.name };
}

// ─── Get programs assigned to a client ───────────

export async function getClientPrograms(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  const userId = session.user.id!;

  // Clients can only fetch their own; trainers can fetch any of their clients
  if (role === "CLIENT" && userId !== clientId) {
    throw new Error("You can only view your own programs");
  }

  if (role === "TRAINER") {
    const relationship = await db.trainerClient.findUnique({
      where: {
        trainerId_clientId: { trainerId: userId, clientId },
      },
    });
    if (!relationship || !relationship.active) {
      throw new Error("Client is not assigned to you");
    }
  }

  const assignments = await db.programAssignment.findMany({
    where: { clientId, active: true },
    include: {
      program: {
        include: {
          trainer: { select: { name: true } },
          templates: {
            select: { id: true, name: true, order: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return assignments.map((a) => ({
    assignmentId: a.id,
    programId: a.program.id,
    name: a.program.name,
    description: a.program.description,
    weeks: a.program.weeks,
    progressionType: a.program.progressionType,
    trainerName: a.program.trainer.name,
    startDate: a.startDate.toISOString(),
    templates: a.program.templates.map((t) => ({
      id: t.id,
      name: t.name,
      order: t.order,
    })),
  }));
}
