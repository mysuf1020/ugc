import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAiScript } from "@/lib/ai-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, regenerateOnly } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Generate script using AI (or offline fallback)
    const generated = await generateAiScript({
      brandName: project.brandName,
      productDescription: project.productDescription,
      targetAudience: project.targetAudience || undefined,
      tone: project.tone,
      targetDurationSec: project.targetDurationSec,
    });

    // Save to Script table
    let script = await prisma.script.findFirst({
      where: { projectId },
    });

    if (script) {
      script = await prisma.script.update({
        where: { id: script.id },
        data: {
          hookText: generated.hookText,
          problemText: generated.problemText,
          solutionText: generated.solutionText,
          demoText: generated.demoText,
          ctaText: generated.ctaText,
          fullScript: generated.fullScript,
          hookOptions: JSON.stringify(generated.hooks),
          selectedHookIndex: 0,
        },
      });
    } else {
      script = await prisma.script.create({
        data: {
          projectId,
          hookText: generated.hookText,
          problemText: generated.problemText,
          solutionText: generated.solutionText,
          demoText: generated.demoText,
          ctaText: generated.ctaText,
          fullScript: generated.fullScript,
          hookOptions: JSON.stringify(generated.hooks),
          selectedHookIndex: 0,
        },
      });
    }

    // Update project status to SCRIPTED
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "SCRIPTED" },
    });

    return NextResponse.json({
      script,
      hooks: generated.hooks,
    });
  } catch (error) {
    console.error("Failed to generate script:", error);
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
  }
}

// Endpoint to update script manually & convert script to storyboard scenes
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      projectId,
      hookText,
      problemText,
      solutionText,
      demoText,
      ctaText,
      selectedHookIndex,
      convertToScenes,
    } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const fullScript = `${hookText || ""} ${problemText || ""} ${solutionText || ""} ${demoText || ""} ${ctaText || ""}`.trim();

    const script = await prisma.script.findFirst({
      where: { projectId },
    });

    if (script) {
      await prisma.script.update({
        where: { id: script.id },
        data: {
          hookText: hookText ?? script.hookText,
          problemText: problemText ?? script.problemText,
          solutionText: solutionText ?? script.solutionText,
          demoText: demoText ?? script.demoText,
          ctaText: ctaText ?? script.ctaText,
          selectedHookIndex: selectedHookIndex ?? script.selectedHookIndex,
          fullScript,
        },
      });
    }

    // If convertToScenes is requested, sync with Scene table
    if (convertToScenes) {
      // 4 Structured UGC Scenes:
      const sceneDefinitions = [
        {
          orderIndex: 0,
          sceneType: "HOOK",
          title: "Scene 1: 3-Second Viral Hook",
          scriptLine: hookText || "Stop scroll!",
          durationEst: 4.0,
          overlayText: "Wajib Tahu Ini!",
        },
        {
          orderIndex: 1,
          sceneType: "PROBLEM",
          title: "Scene 2: Problem & Relatable Pain",
          scriptLine: problemText || "Masalah yang sering terjadi...",
          durationEst: 7.0,
          overlayText: "Pernah Ngerasain Ini?",
        },
        {
          orderIndex: 2,
          sceneType: "DEMO",
          title: "Scene 3: Solution & Product Demo",
          scriptLine: `${solutionText || ""} ${demoText || ""}`.trim(),
          durationEst: 14.0,
          overlayText: "Ini Solusinya!",
        },
        {
          orderIndex: 3,
          sceneType: "CTA",
          title: "Scene 4: Call to Action (Ajakan Beli)",
          scriptLine: ctaText || "Cek link di bio sekarang!",
          durationEst: 5.0,
          overlayText: "Klik Keranjang Kuning",
        },
      ];

      // Delete existing scenes if needed or upsert
      await prisma.scene.deleteMany({
        where: { projectId },
      });

      for (const def of sceneDefinitions) {
        await prisma.scene.create({
          data: {
            projectId,
            orderIndex: def.orderIndex,
            sceneType: def.sceneType,
            title: def.title,
            scriptLine: def.scriptLine,
            durationEst: def.durationEst,
            overlayText: def.overlayText,
            mediaType: "CAMERA_TAKE",
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update script / create scenes:", error);
    return NextResponse.json({ error: "Failed to update script" }, { status: 500 });
  }
}
