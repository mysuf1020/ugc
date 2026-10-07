import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/db";
import { stitchFlowVideoWithVoiceover, generateVoiceoverAudio } from "@/lib/ugc-generator";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const projectId = formData.get("projectId") as string;
    const file = formData.get("file") as File;

    if (!projectId || !file) {
      return NextResponse.json(
        { error: "projectId dan file video wajib diunggah." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Proyek tidak ditemukan." }, { status: 404 });
    }

    // Save uploaded video file to disk
    const projectDir = path.join(process.cwd(), "public", "uploads", "projects", projectId, "flow");
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const videoFileName = `flow_input_${Date.now()}.mp4`;
    const videoDiskPath = path.join(projectDir, videoFileName);
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(videoDiskPath, Buffer.from(bytes));

    // Check if voiceover exists or generate if scriptText exists
    const audioDir = path.join(process.cwd(), "public", "uploads", "projects", projectId, "audio");
    let audioDiskPath = "";

    if (fs.existsSync(audioDir)) {
      const files = fs.readdirSync(audioDir).filter((f) => f.endsWith(".mp3"));
      if (files.length > 0) {
        audioDiskPath = path.join(audioDir, files[files.length - 1]);
      }
    }

    if (!audioDiskPath && project.scriptText) {
      const vo = await generateVoiceoverAudio(projectId, project.scriptText, project.voiceId || "id-ID-ArdiNeural");
      audioDiskPath = vo.audioPath;
    }

    if (!audioDiskPath) {
      return NextResponse.json(
        { error: "Audio VO belum tersedia. Silakan klik 'Siapkan Paket Google Flow' terlebih dahulu." },
        { status: 400 }
      );
    }

    // Stitch Flow Video + Voiceover Audio
    const stitched = await stitchFlowVideoWithVoiceover({
      projectId,
      flowVideoDiskPath: videoDiskPath,
      audioDiskPath,
      hookHeadline: project.hookHeadline || undefined,
    });

    return NextResponse.json({
      success: true,
      videoUrl: stitched.videoUrl,
      durationSec: stitched.durationSec,
    });
  } catch (error) {
    console.error("Stitch Flow Video error:", error);
    return NextResponse.json(
      { error: "Gagal menggabungkan video Google Flow dengan audio VO." },
      { status: 500 }
    );
  }
}
