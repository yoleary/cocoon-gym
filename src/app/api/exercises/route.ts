import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const bodyRegion = searchParams.get("bodyRegion") || undefined;
  const pageSize = parseInt(searchParams.get("pageSize") || "100", 10);

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (bodyRegion && bodyRegion !== "all") {
    where.bodyRegion = bodyRegion;
  }

  const exercises = await db.exercise.findMany({
    where,
    select: {
      id: true,
      name: true,
      bodyRegion: true,
      movementPattern: true,
    },
    orderBy: { name: "asc" },
    take: pageSize,
  });

  return NextResponse.json({ exercises });
}
