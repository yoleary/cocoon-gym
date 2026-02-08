"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// ─── Get notes for a client's exercises ──────────

export async function getClientExerciseNotes(
  clientId: string,
  exerciseIds: string[]
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id!;
  const role = (session.user as any).role;

  // If no clientId provided, use the logged-in user's ID (client viewing own notes)
  const resolvedClientId = clientId || userId;

  // Trainers can view notes they authored; clients see notes written for them
  const notes = await db.clientExerciseNote.findMany({
    where: {
      clientId: resolvedClientId,
      exerciseId: { in: exerciseIds },
      ...(role === "TRAINER" ? { trainerId: userId } : {}),
    },
    select: {
      exerciseId: true,
      note: true,
    },
  });

  // Return as a map for easy lookup
  const map: Record<string, string> = {};
  for (const n of notes) {
    map[n.exerciseId] = n.note;
  }
  return map;
}

// ─── Get exercises for a client's active programs ─

export async function getClientProgramExercises(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can view this");

  const trainerId = session.user.id!;

  // Get active assignments for this client from this trainer's programs
  const assignments = await db.programAssignment.findMany({
    where: {
      clientId,
      active: true,
      program: { trainerId },
    },
    include: {
      program: {
        select: {
          id: true,
          name: true,
          templates: {
            select: {
              blocks: {
                select: {
                  exercises: {
                    select: {
                      exerciseId: true,
                      exercise: {
                        select: { id: true, name: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Flatten and deduplicate exercises per program
  const programs = assignments.map((a) => {
    const exerciseMap = new Map<string, string>();
    for (const tpl of a.program.templates) {
      for (const block of tpl.blocks) {
        for (const ex of block.exercises) {
          exerciseMap.set(ex.exerciseId, ex.exercise.name);
        }
      }
    }
    return {
      programId: a.program.id,
      programName: a.program.name,
      exercises: Array.from(exerciseMap.entries()).map(([id, name]) => ({
        id,
        name,
      })),
    };
  });

  // Also fetch existing notes
  const allExerciseIds = programs.flatMap((p) => p.exercises.map((e) => e.id));
  const existingNotes = await db.clientExerciseNote.findMany({
    where: {
      trainerId,
      clientId,
      exerciseId: { in: allExerciseIds },
    },
    select: {
      exerciseId: true,
      note: true,
    },
  });

  const notesMap: Record<string, string> = {};
  for (const n of existingNotes) {
    notesMap[n.exerciseId] = n.note;
  }

  return { programs, notes: notesMap };
}

// ─── Save or update a note ───────────────────────

export async function saveClientExerciseNote(
  clientId: string,
  exerciseId: string,
  note: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can add notes");

  const trainerId = session.user.id!;

  if (!note.trim()) {
    // Delete note if empty
    await db.clientExerciseNote.deleteMany({
      where: { trainerId, clientId, exerciseId },
    });
    return { deleted: true };
  }

  await db.clientExerciseNote.upsert({
    where: {
      trainerId_clientId_exerciseId: { trainerId, clientId, exerciseId },
    },
    create: {
      trainerId,
      clientId,
      exerciseId,
      note: note.trim(),
    },
    update: {
      note: note.trim(),
    },
  });

  return { saved: true };
}
