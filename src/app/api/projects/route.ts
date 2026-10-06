import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            scenes: true,
            scripts: true,
          },
        },
        scenes: {
          select: {
            id: true,
            activeTakeId: true,
          },
        },
        exports: {
          where: { status: "COMPLETED" },
          take: 1,
          orderBy: { completedAt: "desc" },
        },
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to list projects:", error);
    return NextResponse.json({ error: "Failed to list projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      brandName,
      productDescription,
      targetAudience,
      tone,
      targetDurationSec,
    } = body;

    if (!title || !brandName || !productDescription) {
      return NextResponse.json(
        { error: "Title, brand name, and product description are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        brandName: brandName.trim(),
        productDescription: productDescription.trim(),
        targetAudience: targetAudience?.trim() || null,
        tone: tone || "casual",
        targetDurationSec: Number(targetDurationSec) || 30,
        aspectRatio: "9:16",
        status: "DRAFT",
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
