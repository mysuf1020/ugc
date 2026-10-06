import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processVideoRender } from "@/lib/ffmpeg";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Fetch project and scenes with takes
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        scenes: {
          orderBy: { orderIndex: "asc" },
          include: {
            takes: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Collect active takes in scene order
    const clipsToRender: {
      filePath: string;
      duration: number;
      overlayText?: string;
    }[] = [];

    for (const scene of project.scenes) {
      const activeTake = scene.takes.find((t) => t.id === scene.activeTakeId) || scene.takes[0];
      if (activeTake) {
        clipsToRender.push({
          filePath: activeTake.filePath,
          duration: activeTake.durationSec || 5,
          overlayText: scene.overlayText || undefined,
        });
      }
    }

    if (clipsToRender.length === 0) {
      return NextResponse.json(
        { error: "Belum ada klip take rekaman yang dipilih untuk dirender. Harap rekam atau pilih take terlebih dahulu." },
        { status: 400 }
      );
    }

    // Create a new VideoExport entry in DB with PENDING / PROCESSING
    const videoExport = await prisma.videoExport.create({
      data: {
        projectId,
        resolution: "1080x1920",
        status: "PROCESSING",
        progress: 5,
      },
    });

    // Run render in background asynchronously
    processVideoRender({
      exportId: videoExport.id,
      projectId,
      clips: clipsToRender,
    }).catch((err) => {
      console.error("Background render execution failed:", err);
    });

    return NextResponse.json({
      success: true,
      exportId: videoExport.id,
    });
  } catch (error) {
    console.error("Failed to start video rendering:", error);
    return NextResponse.json({ error: "Failed to start video rendering" }, { status: 500 });
  }
}
