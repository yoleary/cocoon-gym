"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export interface MuscleCoverage {
  name: string;
  /** Weighted set count (primary=1, secondary=0.5, stabilizer=0.25) */
  sets: number;
  /** Coverage level: "high" | "medium" | "low" | "none" */
  level: "high" | "medium" | "low" | "none";
  /** Exercises that target this muscle */
  exercises: string[];
}

/**
 * Analyze muscle coverage for all exercises in a program.
 * Returns per-muscle-group set counts weighted by role.
 */
export async function getProgramMuscleCoverage(
  programId: string
): Promise<MuscleCoverage[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Get all exercises in the program with their muscle relationships
  const program = await db.program.findUnique({
    where: { id: programId },
    include: {
      templates: {
        include: {
          blocks: {
            include: {
              exercises: {
                include: {
                  exercise: {
                    include: {
                      muscles: {
                        include: {
                          muscleGroup: { select: { name: true } },
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
    },
  });

  if (!program) throw new Error("Program not found");

  // Aggregate muscle coverage across all exercises
  const muscleMap = new Map<
    string,
    { sets: number; exercises: Set<string> }
  >();

  for (const template of program.templates) {
    for (const block of template.blocks) {
      for (const ex of block.exercises) {
        const targetSets = ex.targetSets ?? 3;

        for (const muscle of ex.exercise.muscles) {
          const name = muscle.muscleGroup.name;
          const roleWeight =
            muscle.role === "PRIMARY"
              ? 1
              : muscle.role === "SECONDARY"
                ? 0.5
                : 0.25;

          const existing = muscleMap.get(name) ?? {
            sets: 0,
            exercises: new Set<string>(),
          };
          existing.sets += targetSets * roleWeight;
          existing.exercises.add(ex.exercise.name);
          muscleMap.set(name, existing);
        }
      }
    }
  }

  // Calculate levels based on weekly set volume
  // Rough guidelines: <5 low, 5-10 medium, >10 high
  const results: MuscleCoverage[] = [];
  for (const [name, data] of muscleMap) {
    const level =
      data.sets >= 10 ? "high" : data.sets >= 5 ? "medium" : "low";
    results.push({
      name,
      sets: Math.round(data.sets * 10) / 10,
      level,
      exercises: Array.from(data.exercises),
    });
  }

  // Sort by sets descending
  results.sort((a, b) => b.sets - a.sets);

  return results;
}
