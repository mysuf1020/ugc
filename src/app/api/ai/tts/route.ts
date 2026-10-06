import { NextResponse } from "next/server";
import { EdgeTTS } from "@andresaya/edge-tts";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voiceId = "id-ID-ArdiNeural" } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const ttsDir = path.join(process.cwd(), "public", "uploads", "temp", "audio");
    if (!fs.existsSync(ttsDir)) {
      fs.mkdirSync(ttsDir, { recursive: true });
    }

    const filename = `sample_${Date.now()}.mp3`;
    const filePath = path.join(ttsDir, filename);

    const tts = new EdgeTTS();
    await tts.synthesize(text, voiceId);
    const buffer = await tts.toBuffer();
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      audioUrl: `/uploads/temp/audio/${filename}`,
    });
  } catch (error) {
    console.error("TTS generation error:", error);
    return NextResponse.json({ error: "Failed to synthesize speech" }, { status: 500 });
  }
}
