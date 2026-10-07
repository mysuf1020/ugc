import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateVoiceoverAudio, generateNalarkaPrompts } from "@/lib/ugc-generator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      projectId,
      brandName,
      productUsp,
      scriptText,
      hookHeadline,
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

    if (!project) {
      return NextResponse.json({ error: "Proyek tidak ditemukan." }, { status: 404 });
    }

    // 1. Generate Voiceover Audio (MP3) in 1-2 seconds
    const vo = await generateVoiceoverAudio(projectId, scriptText, voiceId);

    // 2. Generate Google Flow Prompts tailored for the product and hook
    const prompts = generateNalarkaPrompts({
      brandName: brandName || project.brandName,
      productUsp: productUsp || project.productDescription,
      hookHeadline: hookHeadline || "RAHASIA PRODUK VIRAL INI! 🔥",
    });

    // 3. Save to database
    await prisma.project.update({
      where: { id: projectId },
      data: {
        scriptText,
        hookHeadline: hookHeadline || project.hookHeadline,
        brandName: brandName || project.brandName,
        productDescription: productUsp || project.productDescription,
        voiceId,
      },
    });

    return NextResponse.json({
      success: true,
      audioUrl: vo.publicAudioUrl,
      durationSec: vo.durationSec,
      prompts,
    });
  } catch (error) {
    console.error("Google Flow package error:", error);
    return NextResponse.json(
      { error: "Gagal menyiapkan paket Google Flow." },
      { status: 500 }
    );
  }
}
