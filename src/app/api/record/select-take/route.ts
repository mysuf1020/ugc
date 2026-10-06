import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sceneId, takeId } = body;

    if (!sceneId || !takeId) {
      return NextResponse.json(
        { error: "sceneId and takeId are required" },
        { status: 400 }
      );
    }

    const scene = await prisma.scene.update({
      where: { id: sceneId },
      data: { activeTakeId: takeId },
      include: {
        takes: true,
      },
    });

    return NextResponse.json({ success: true, scene });
  } catch (error) {
    console.error("Failed to select take:", error);
    return NextResponse.json({ error: "Failed to select take" }, { status: 500 });
  }
}
