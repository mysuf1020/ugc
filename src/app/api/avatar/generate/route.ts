import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateFullUgcVideo } from "@/lib/ugc-generator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      projectId,
      scriptText,
      hookHeadline,
      brandName,
      productUsp,
      voiceId = "id-ID-ArdiNeural",
    } = body;

    if (!projectId || !scriptText) {
      return NextResponse.json(
        { error: "projectId dan naskah bicara wajib diisi." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || !project.avatarImageUrl || !project.productImageUrl) {
      return NextResponse.json(
        { error: "Harap upload foto model karakter dan foto produk barang terlebih dahulu." },
        { status: 400 }
      );
    }

    // Update state to GENERATING
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "GENERATING",
        scriptText,
        hookHeadline: hookHeadline || "RAHASIA PRODUK INI! 🔥",
        brandName: brandName || project.brandName,
      },
    });

    // Run Full UGC Video Generator: Model Char + Model Barang + Voiceover Audio!
    const result = await generateFullUgcVideo({
      projectId,
      charImagePath: project.avatarImageUrl,
      productImagePath: project.productImageUrl,
      brandName: brandName || project.brandName,
      productUsp: productUsp || project.productDescription,
      scriptText,
      hookHeadline: hookHeadline || "RAHASIA PRODUK INI! 🔥",
      voiceId,
    });

    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      audioUrl: result.audioUrl,
      durationSec: result.durationSec,
      prompts: result.prompts,
    });
  } catch (error) {
    console.error("UGC Video Generation error:", error);
    return NextResponse.json(
      { error: "Gagal membuat video UGC. Pastikan format foto valid." },
      { status: 500 }
    );
  }
}
