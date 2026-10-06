import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        scripts: {
          orderBy: { createdAt: "desc" },
        },
        scenes: {
          orderBy: { orderIndex: "asc" },
          include: {
            takes: {
              orderBy: { takeNumber: "desc" },
            },
          },
        },
        exports: {
          orderBy: { startedAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete related files from local upload folder if exists
    const projectDir = path.join(process.cwd(), "public", "uploads", "projects", id);
    if (fs.existsSync(projectDir)) {
      try {
        fs.rmSync(projectDir, { recursive: true, force: true });
      } catch (e) {
        console.warn("Failed to remove project files:", e);
      }
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
