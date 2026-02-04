"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// ─── Get all clients for the trainer ─────────────

export async function getClients(filters?: {
  search?: string;
  activeOnly?: boolean;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can manage clients");

  const trainerId = session.user.id!;

  const where: any = {
    trainerId,
  };

  if (filters?.activeOnly !== false) {
    where.active = true;
  }

  const relationships = await db.trainerClient.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          goal: true,
          createdAt: true,
          sessions: {
            where: { completedAt: { not: null } },
            select: { completedAt: true },
            orderBy: { completedAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              sessions: { where: { completedAt: { not: null } } },
            },
          },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  let results = relationships.map((r) => ({
    id: r.client.id,
    name: r.client.name,
    email: r.client.email,
    image: r.client.image,
    goal: r.client.goal,
    joinedAt: r.client.createdAt.toISOString(),
    assignedAt: r.assignedAt.toISOString(),
    active: r.active,
    totalSessions: r.client._count.sessions,
    lastSessionDate: r.client.sessions[0]?.completedAt?.toISOString() ?? null,
  }));

  // Apply search filter in-memory for simplicity (trainer client lists are small)
  if (filters?.search) {
    const query = filters.search.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    );
  }

  return results;
}

// ─── Get client detail with stats ────────────────

export async function getClientById(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can view client details");

  const trainerId = session.user.id!;

  // Verify relationship
  const relationship = await db.trainerClient.findUnique({
    where: {
      trainerId_clientId: { trainerId, clientId },
    },
  });

  if (!relationship) throw new Error("Client not found");

  const client = await db.user.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      goal: true,
      createdAt: true,
    },
  });

  if (!client) throw new Error("Client not found");

  // Gather stats in parallel
  const [totalSessions, recentSessions, personalRecords, streak, activePrograms] =
    await Promise.all([
      // Total completed sessions
      db.workoutSession.count({
        where: { userId: clientId, completedAt: { not: null } },
      }),

      // Last 5 sessions
      db.workoutSession.findMany({
        where: { userId: clientId, completedAt: { not: null } },
        select: {
          id: true,
          completedAt: true,
          totalVolume: true,
          duration: true,
          template: { select: { name: true } },
        },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),

      // PR count
      db.personalRecord.count({
        where: { userId: clientId },
      }),

      // Streak
      db.streak.findUnique({
        where: { userId: clientId },
        select: { currentStreak: true, longestStreak: true, lastActivityDate: true },
      }),

      // Active program assignments
      db.programAssignment.findMany({
        where: { clientId, active: true },
        include: {
          program: { select: { id: true, name: true } },
        },
      }),
    ]);

  // Calculate total volume over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentVolume = await db.workoutSession.aggregate({
    where: {
      userId: clientId,
      completedAt: { not: null, gte: thirtyDaysAgo },
    },
    _sum: { totalVolume: true },
  });

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    image: client.image,
    goal: client.goal,
    joinedAt: client.createdAt.toISOString(),
    active: relationship.active,
    assignedAt: relationship.assignedAt.toISOString(),
    stats: {
      totalSessions,
      personalRecords,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastActivityDate: streak?.lastActivityDate?.toISOString() ?? null,
      volumeLast30Days: recentVolume._sum.totalVolume ?? 0,
    },
    recentSessions: recentSessions.map((s) => ({
      id: s.id,
      completedAt: s.completedAt!.toISOString(),
      totalVolume: s.totalVolume,
      duration: s.duration,
      templateName: s.template?.name ?? null,
    })),
    activePrograms: activePrograms.map((a) => ({
      assignmentId: a.id,
      programId: a.program.id,
      programName: a.program.name,
    })),
  };
}

// ─── Invite a new client ─────────────────────────

export async function inviteClient(data: {
  name: string;
  email: string;
  goal?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can invite clients");

  const trainerId = session.user.id!;

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    // Check if already linked to this trainer
    const existingRelationship = await db.trainerClient.findUnique({
      where: {
        trainerId_clientId: { trainerId, clientId: existingUser.id },
      },
    });

    if (existingRelationship) {
      if (existingRelationship.active) {
        throw new Error("This client is already assigned to you");
      }

      // Reactivate the relationship
      await db.trainerClient.update({
        where: { id: existingRelationship.id },
        data: { active: true },
      });

      revalidatePath("/portal/clients");
      return { clientId: existingUser.id, reactivated: true };
    }

    // Create new trainer-client relationship for existing user
    await db.trainerClient.create({
      data: {
        trainerId,
        clientId: existingUser.id,
      },
    });

    revalidatePath("/portal/clients");
    return { clientId: existingUser.id, existing: true };
  }

  // Create placeholder user account (no password - client will register via invitation link)
  const newClient = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: "CLIENT",
      goal: data.goal ?? null,
    },
  });

  // Create trainer-client relationship
  await db.trainerClient.create({
    data: {
      trainerId,
      clientId: newClient.id,
    },
  });

  // Create verification token for invitation link
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7-day expiry

  await db.verificationToken.create({
    data: {
      identifier: data.email,
      token,
      expires,
    },
  });

  revalidatePath("/portal/clients");

  return {
    clientId: newClient.id,
    inviteToken: token,
    inviteUrl: `/register?token=${token}&email=${encodeURIComponent(data.email)}`,
  };
}

// ─── Remove (deactivate) client relationship ─────

export async function removeClient(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "TRAINER") throw new Error("Only trainers can manage clients");

  const trainerId = session.user.id!;

  const relationship = await db.trainerClient.findUnique({
    where: {
      trainerId_clientId: { trainerId, clientId },
    },
  });

  if (!relationship) throw new Error("Client relationship not found");

  if (!relationship.active) {
    throw new Error("This client relationship is already inactive");
  }

  // Deactivate the relationship (soft delete - preserve history)
  await db.trainerClient.update({
    where: { id: relationship.id },
    data: { active: false },
  });

  // Deactivate all active program assignments for this client from this trainer
  const trainerPrograms = await db.program.findMany({
    where: { trainerId },
    select: { id: true },
  });

  const trainerProgramIds = trainerPrograms.map((p) => p.id);

  if (trainerProgramIds.length > 0) {
    await db.programAssignment.updateMany({
      where: {
        clientId,
        programId: { in: trainerProgramIds },
        active: true,
      },
      data: { active: false },
    });
  }

  revalidatePath("/portal/clients");
  revalidatePath(`/portal/clients/${clientId}`);
}
