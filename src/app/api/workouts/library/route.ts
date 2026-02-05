import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "TRAINER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    workouts: workouts.map((w) => ({
      id: w.id,
      name: w.name,
      exerciseCount: w.blocks.reduce((sum, b) => sum + b.exercises.length, 0),
      blocks: w.blocks.map((b) => ({
        id: b.id,
        label: b.label,
        order: b.order,
        isSuperset: b.isSuperset,
        exercises: b.exercises.map((e) => ({
          exerciseId: e.exercise.id,
          exerciseName: e.exercise.name,
          bodyRegion: e.exercise.bodyRegion,
          position: e.position,
          order: e.order,
          targetSets: e.targetSets,
          targetReps: e.targetReps,
          restSeconds: e.restSeconds,
          notes: e.notes,
        })),
      })),
    })),
  });
}
