import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateTalkingAvatarVideo, compositeFinalUgcVideo } from "@/lib/talking-avatar";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, scriptText, hookHeadline, layoutStyle = "SPLIT_SCREEN" } = body;

    if (!projectId || !scriptText) {
      return NextResponse.json(
        { error: "projectId and scriptText are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || !project.avatarImageUrl || !project.productImageUrl) {
      return NextResponse.json(
        { error: "Foto wajah dan foto produk brand wajib diupload terlebih dahulu." },
        { status: 400 }
      );
    }

    // Update project state to GENERATING
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "GENERATING",
        scriptText,
        hookHeadline: hookHeadline || "RAHASIA BRAND INI! 🔥",
        layoutStyle,
      },
    });

    // 1. Generate Talking Avatar video
    const avatarResult = await generateTalkingAvatarVideo({
      projectId,
      avatarImagePath: project.avatarImageUrl,
      scriptText,
      voiceId: project.voiceId,
    });

    // 2. Composite Final 9:16 Video
    let finalVideoUrl = avatarResult.videoUrl;
    try {
      finalVideoUrl = await compositeFinalUgcVideo({
        projectId,
        talkingVideoPath: avatarResult.videoUrl,
        productImagePath: project.productImageUrl,
        hookHeadline: hookHeadline || "RAHASIA BRAND INI! 🔥",
        scriptText,
        layoutStyle,
      });
    } catch (compErr) {
      console.warn("Compositing warning, using avatar directly:", compErr);
    }

    // 3. Update project record to COMPLETED
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "COMPLETED",
        talkingVideoUrl: avatarResult.videoUrl,
        finalVideoUrl: finalVideoUrl,
      },
    });

    return NextResponse.json({
      success: true,
      talkingVideoUrl: avatarResult.videoUrl,
      finalVideoUrl,
      source: avatarResult.source,
      project: updated,
    });
  } catch (error) {
    console.error("Failed to generate talking avatar UGC:", error);
    return NextResponse.json(
      { error: "Gagal membuat video talking avatar. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
