import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sceneId = formData.get("sceneId") as string;
    const projectId = formData.get("projectId") as string;
    const durationSec = parseFloat((formData.get("durationSec") as string) || "0");
    const file = formData.get("file") as File;

    if (!sceneId || !projectId || !file) {
      return NextResponse.json(
        { error: "sceneId, projectId, and video file are required" },
        { status: 400 }
      );
    }

    // Determine upload directory: public/uploads/projects/[projectId]/takes
    const uploadDir = path.join(process.cwd(), "public", "uploads", "projects", projectId, "takes");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Get count of existing takes for this scene to assign take number
    const takeCount = await prisma.sceneTake.count({
      where: { sceneId },
    });
    const takeNumber = takeCount + 1;

    // Generate safe filename
    const ext = file.name.endsWith(".mp4") ? "mp4" : "webm";
    const filename = `scene_${sceneId.slice(0, 8)}_take_${takeNumber}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // Relative web URL
    const publicUrl = `/uploads/projects/${projectId}/takes/${filename}`;

    // Create record in SceneTake
    const take = await prisma.sceneTake.create({
      data: {
        sceneId,
        takeNumber,
        filePath: publicUrl,
        durationSec,
        fileSize: buffer.length,
        mimeType: file.type || "video/webm",
      },
    });

    // Automatically set this take as activeTakeId on the scene
    await prisma.scene.update({
      where: { id: sceneId },
      data: {
        activeTakeId: take.id,
      },
    });

    // Update project status to RECORDED if not already
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "RECORDED" },
    });

    return NextResponse.json({
      success: true,
      take,
      publicUrl,
    });
  } catch (error) {
    console.error("Failed to upload recording take:", error);
    return NextResponse.json({ error: "Failed to upload recording take" }, { status: 500 });
  }
}
