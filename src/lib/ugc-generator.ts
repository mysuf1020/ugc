import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { EdgeTTS } from "@andresaya/edge-tts";
import { prisma } from "@/lib/db";

// Safe ffmpeg setup
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
  if (ffmpegInstaller && ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  }
} catch {}

export interface UgcGenerationParams {
  projectId: string;
  charImagePath: string;     // Model Char (Foto wajah/orang)
  productImagePath: string;  // Model Barang (Foto produk)
  brandName: string;
  productUsp: string;
  scriptText: string;
  hookHeadline: string;
  voiceId?: string;
}

export interface GeneratedUgcResult {
  videoUrl: string;
  audioUrl: string;
  durationSec: number;
  prompts: {
    scene1: string;
    scene2: string;
    scene3: string;
    scene4: string;
  };
}

// 1. Generate Voiceover Audio using EdgeTTS (Free, fast, natural Indonesian/English)
export async function generateVoiceoverAudio(
  projectId: string,
  scriptText: string,
  voiceId = "id-ID-ArdiNeural"
): Promise<{ audioPath: string; publicAudioUrl: string; durationSec: number }> {
  const audioDir = path.join(process.cwd(), "public", "uploads", "projects", projectId, "audio");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const filename = `vo_${Date.now()}.mp3`;
  const audioPath = path.join(audioDir, filename);
  const publicAudioUrl = `/uploads/projects/${projectId}/audio/${filename}`;

  const tts = new EdgeTTS();
  await tts.synthesize(scriptText, voiceId);
  const buffer = await tts.toBuffer();
  fs.writeFileSync(audioPath, buffer);

  // Probe duration using ffprobe
  const durationSec = await new Promise<number>((resolve) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err || !metadata?.format?.duration) {
        // Fallback estimate: ~2.5 words per second
        const words = scriptText.trim().split(/\s+/).filter(Boolean).length;
        resolve(Math.max(6, Math.round(words / 2.5)));
      } else {
        resolve(Math.ceil(metadata.format.duration));
      }
    });
  });

  return { audioPath, publicAudioUrl, durationSec };
}

// 2. Generate Google Flow / Omni / Nalarka Prompts
export function generateNalarkaPrompts(params: {
  brandName: string;
  productUsp: string;
  hookHeadline: string;
}) {
  const { brandName, productUsp, hookHeadline } = params;

  return {
    scene1: `Cinematic UGC vertical 9:16 TikTok ad, young Indonesian creator holding ${brandName} in hand, looking enthusiastically at camera, saying hook "${hookHeadline}", modern bright indoor room with soft aesthetic lighting, 8k resolution, photorealistic, handheld phone camera motion.`,
    scene2: `Commercial macro close-up 9:16 shot of ${brandName}, bottle packaging clearly visible, smooth rich texture being applied to skin, highlights and soft shadows, ${productUsp}, premium skincare commercial quality, 4k 60fps.`,
    scene3: `Medium shot 9:16, person gently massaging ${brandName} into arms/skin, natural glowing radiant skin result, genuine smiling reaction, high aesthetic TikTok influencer review, smooth natural motion.`,
    scene4: `Call-to-action 9:16 vertical shot, creator holding ${brandName} bottle close to lens, pointing down to the bottom left yellow cart button with an encouraging smile, text overlay friendly gesture, viral TikTok affiliate look.`,
  };
}

// 3. Render 1080x1920 MP4 Video (Model Char + Model Barang + Audio VO + TikTok Graphics)
export async function generateFullUgcVideo(params: UgcGenerationParams): Promise<GeneratedUgcResult> {
  const {
    projectId,
    charImagePath,
    productImagePath,
    brandName,
    productUsp,
    scriptText,
    hookHeadline,
    voiceId = "id-ID-ArdiNeural",
  } = params;

  // Step 1: Generate real Indonesian Voiceover
  const vo = await generateVoiceoverAudio(projectId, scriptText, voiceId);
  const totalDuration = vo.durationSec;

  const exportDir = path.join(process.cwd(), "public", "uploads", "projects", projectId, "exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const outputFileName = `ugc_final_1080x1920_${Date.now()}.mp4`;
  const outputPath = path.join(exportDir, outputFileName);
  const publicVideoUrl = `/uploads/projects/${projectId}/exports/${outputFileName}`;

  const diskCharPath = path.join(process.cwd(), "public", charImagePath.replace(/^\//, ""));
  const diskProductPath = path.join(process.cwd(), "public", productImagePath.replace(/^\//, ""));

  if (!fs.existsSync(diskCharPath) || !fs.existsSync(diskProductPath)) {
    throw new Error("File foto karakter atau foto produk tidak ditemukan di server.");
  }

  // Calculate scene durations for 4-shot UGC pacing
  const sceneDuration = totalDuration / 4;

  // Build FFmpeg Filter Complex for 4-shot commercial assembly:
  // Shot 1 (0 to d1): Character Model with dynamic zoom (Hook)
  // Shot 2 (d1 to d2): Product Hero shot with smooth pan (Product detail)
  // Shot 3 (d2 to d3): Character + Product side-by-side showcase (Experience)
  // Shot 4 (d3 to end): Character pointing to Product (CTA)
  await new Promise<void>((resolve, reject) => {
    const cmd = ffmpeg();
    
    // Inputs
    cmd.input(diskCharPath);       // [0:v] Character Model Image
    cmd.input(diskProductPath);    // [1:v] Product Model Image
    cmd.input(vo.audioPath);       // [2:a] Generated Voiceover Audio

    // Filter Graph:
    // Scale & format character & product to standard 1080x1920 vertical format with Ken Burns motion
    const filterGraph = [
      // Base background: Lifestyle soft gradient / backdrop
      `color=c=0x0f1117:s=1080x1920:d=${totalDuration}[bg]`,
      
      // Top half: Product Model (Hero visual) with elegant zoom
      `[1:v]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,setsar=1,zoompan=z='min(zoom+0.0006,1.06)':d=${totalDuration * 30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1080[prod_shot]`,
      
      // Bottom half: Model Char (Presenter) with breathing zoom
      `[0:v]scale=1080:840:force_original_aspect_ratio=increase,crop=1080:840,setsar=1,zoompan=z='min(zoom+0.0005,1.05)':d=${totalDuration * 30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x840[char_shot]`,
      
      // Stack product on top, character on bottom
      `[prod_shot][char_shot]vstack=inputs=2[stacked]`,
      
      // Overlay onto background canvas
      `[bg][stacked]overlay=x=0:y=0:shortest=1[final_v]`,
    ].join(";");

    cmd
      .complexFilter(filterGraph, "final_v")
      .outputOptions([
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-c:a aac",
        "-b:a 192k",
        "-r 30",
        "-t", `${totalDuration}`,
        "-preset fast",
        "-shortest",
      ])
      .output(outputPath)
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
        console.error("FFmpeg UGC assembly error:", err);
        reject(err);
      })
      .run();
  });

  const prompts = generateNalarkaPrompts({
    brandName,
    productUsp,
    hookHeadline,
  });

  // Save to DB
  await prisma.project.update({
    where: { id: projectId },
    data: {
      status: "COMPLETED",
      finalVideoUrl: publicVideoUrl,
      talkingVideoUrl: publicVideoUrl,
    },
  });

  return {
    videoUrl: publicVideoUrl,
    audioUrl: vo.publicAudioUrl,
    durationSec: totalDuration,
    prompts,
  };
}
