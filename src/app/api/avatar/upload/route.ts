import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const projectId = formData.get("projectId") as string;
    const type = formData.get("type") as "avatar" | "product"; // avatar face photo or product brand photo
    const file = formData.get("file") as File;

    if (!projectId || !type || !file) {
      return NextResponse.json(
        { error: "projectId, type ('avatar' | 'product'), and image file are required" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "projects", projectId, "assets");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${type}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    const publicUrl = `/uploads/projects/${projectId}/assets/${filename}`;

    // Update project with image URL
    const updateData: Record<string, string> = {};
    if (type === "avatar") {
      updateData.avatarImageUrl = publicUrl;
    } else {
      updateData.productImageUrl = publicUrl;
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      project: updatedProject,
    });
  } catch (error) {
    console.error("Failed to upload avatar asset:", error);
    return NextResponse.json({ error: "Failed to upload image asset" }, { status: 500 });
  }
}
