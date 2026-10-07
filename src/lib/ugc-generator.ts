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

// 2b. Stitch Google Flow Video with Voiceover Audio
export async function stitchFlowVideoWithVoiceover(params: {
  projectId: string;
  flowVideoDiskPath: string;
  audioDiskPath: string;
  hookHeadline?: string;
}): Promise<{ videoUrl: string; durationSec: number }> {
  const exportDir = path.join(process.cwd(), "public", "uploads", "projects", params.projectId, "exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const outputFileName = `ugc_flow_final_${Date.now()}.mp4`;
  const outputPath = path.join(exportDir, outputFileName);
  const publicVideoUrl = `/uploads/projects/${params.projectId}/exports/${outputFileName}`;

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(params.flowVideoDiskPath)
      .input(params.audioDiskPath)
      .outputOptions([
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-c:a aac",
        "-b:a 192k",
        "-shortest",
        "-preset fast",
      ])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => {
        console.error("FFmpeg Flow stitch error:", err);
        reject(err);
      })
      .run();
  });

  await prisma.project.update({
    where: { id: params.projectId },
    data: {
      status: "COMPLETED",
      finalVideoUrl: publicVideoUrl,
    },
  });

  return { videoUrl: publicVideoUrl, durationSec: 10 };
}


// Helper: Call D-ID API to generate genuine AI talking video from face image + speech script
async function generateDidTalkingVideo(
  didKey: string,
  diskCharPath: string,
  scriptText: string,
  voiceId: string
): Promise<string | null> {
  try {
    const basicAuth = didKey.includes(":") ? Buffer.from(didKey).toString("base64") : didKey;

    // 1. Upload face image to D-ID storage
    const form = new FormData();
    const fileBuffer = fs.readFileSync(diskCharPath);
    const ext = path.extname(diskCharPath).replace(".", "") || "png";
    form.append("image", new Blob([fileBuffer], { type: `image/${ext}` }), `avatar.${ext}`);

    const upRes = await fetch("https://api.d-id.com/images", {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}` },
      body: form,
    });

    if (!upRes.ok) {
      console.warn("D-ID image upload failed:", await upRes.text());
      return null;
    }
    const upData = await upRes.json();
    const s3ImageUrl = upData.url;

    // 2. Submit Talk Generation Request
    const talkRes = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        source_url: s3ImageUrl,
        script: {
          type: "text",
          subtitles: false,
          provider: {
            type: "microsoft",
            voice_id: voiceId || "id-ID-ArdiNeural",
          },
          input: scriptText,
        },
        config: {
          fluent: true,
          pad_audio: 0,
          stitch: true,
        },
      }),
    });

    if (!talkRes.ok) {
      console.warn("D-ID talk request failed:", await talkRes.text());
      return null;
    }
    const talkData = await talkRes.json();
    const talkId = talkData.id;

    // 3. Poll for completion (up to 90 attempts x 3s = ~270s / 4.5 minutes)
    for (let i = 0; i < 90; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const pollRes = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: { Authorization: `Basic ${basicAuth}` },
      });
      if (pollRes.ok) {
        const pollData = await pollRes.json();
        console.log(`[D-ID Engine] Polling talk ${talkId} (${i + 1}/90): ${pollData.status}`);
        if (pollData.status === "done" && pollData.result_url) {
          console.log(`[D-ID Engine] Talk ${talkId} finished successfully! Result URL ready.`);
          return pollData.result_url;
        }
        if (pollData.status === "error") {
          console.warn("[D-ID Engine] Talk returned error:", pollData.error);
          return null;
        }
      }
    }

    console.warn(`[D-ID Engine] Polling timed out for talk ${talkId} after 270 seconds.`);
    return null;
  } catch (err) {
    console.error("D-ID talking avatar error:", err);
    return null;
  }
}

// Helper: Call Replicate Minimax Video-01 to generate real AI video of character holding and demonstrating the product
async function generateMinimaxVideoScene(
  replicateToken: string,
  diskCharPath: string,
  brandName: string,
  productUsp: string,
  hookHeadline: string
): Promise<string | null> {
  try {
    const charBuffer = fs.readFileSync(diskCharPath);
    const charExt = path.extname(diskCharPath).replace(".", "").toLowerCase() || "png";
    const mime = charExt === "jpg" || charExt === "jpeg" ? "image/jpeg" : "image/png";
    const charDataUri = `data:${mime};base64,${charBuffer.toString("base64")}`;

    const prompt = `A handsome Indonesian creator holding ${brandName} in hand, looking enthusiastically at camera, showing the product and smiling, ${productUsp}, modern bright room, photorealistic, cinematic vertical 9:16 TikTok UGC video.`;

    console.log("[Minimax Engine] Submitting video generation to Replicate...");
    const predRes = await fetch("https://api.replicate.com/v1/models/minimax/video-01/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${replicateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt,
          subject_reference: charDataUri,
          prompt_optimizer: true,
        },
      }),
    });

    if (!predRes.ok) {
      console.warn("[Minimax Engine] Failed to create prediction:", await predRes.text());
      return null;
    }

    const predData = await predRes.json();
    const predId = predData.id;
    console.log(`[Minimax Engine] Prediction created: ${predId}, waiting for completion...`);

    // Poll for completion (up to 40 attempts x 5s = ~200s)
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predId}`, {
        headers: { Authorization: `Bearer ${replicateToken}` },
      });

      if (pollRes.ok) {
        const pollData = await pollRes.json();
        console.log(`[Minimax Engine] Polling ${predId} (${i + 1}/40): ${pollData.status}`);

        if (pollData.status === "succeeded" && pollData.output) {
          console.log("[Minimax Engine] Video generated successfully!", pollData.output);
          return pollData.output;
        }

        if (pollData.status === "failed" || pollData.status === "canceled") {
          console.warn("[Minimax Engine] Prediction ended with status:", pollData.status, pollData.error);
          return null;
        }
      }
    }

    console.warn(`[Minimax Engine] Polling timed out for prediction ${predId}`);
    return null;
  } catch (err) {
    console.error("[Minimax Engine] Error generating video:", err);
    return null;
  }
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

  // 1. Generate Voiceover Audio (MP3)
  const vo = await generateVoiceoverAudio(projectId, scriptText, voiceId);

  // Check Settings in database
  const settings = await prisma.appSetting.findUnique({
    where: { id: "global_settings" },
  });
  const replicateToken = settings?.replicateApiToken || process.env.REPLICATE_API_TOKEN;
  const didKey = settings?.dIdApiKey || process.env.DID_API_KEY;

  // --- BRANCH 1: MINIMAX GENERATIVE VIDEO ENGINE (Char actually holding & using product!) ---
  if (replicateToken) {
    const minimaxVideoUrl = await generateMinimaxVideoScene(
      replicateToken,
      diskCharPath,
      brandName,
      productUsp,
      hookHeadline
    );

    if (minimaxVideoUrl) {
      console.log("[Pipeline] Minimax video ready, downloading and stitching with Voiceover audio...");
      const remoteRes = await fetch(minimaxVideoUrl);
      const arrayBuffer = await remoteRes.arrayBuffer();
      const tempMinimaxClipPath = path.join(exportDir, `temp_minimax_${Date.now()}.mp4`);
      fs.writeFileSync(tempMinimaxClipPath, Buffer.from(arrayBuffer));

      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(tempMinimaxClipPath)
          .input(vo.audioPath)
          .outputOptions([
            "-vf scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
            "-c:v libx264",
            "-pix_fmt yuv420p",
            "-c:a aac",
            "-b:a 192k",
            "-shortest",
            "-preset fast",
          ])
          .output(outputPath)
          .on("end", () => {
            try { fs.unlinkSync(tempMinimaxClipPath); } catch {}
            resolve();
          })
          .on("error", (err) => {
            console.error("FFmpeg Minimax Stitch error:", err);
            reject(err);
          })
          .run();
      });

      const prompts = generateNalarkaPrompts({ brandName, productUsp, hookHeadline });

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
        durationSec: vo.durationSec,
        prompts,
      };
    }
  }

  // --- BRANCH 2: D-ID TALKING HEAD (Fallback) ---
  let didVideoRemoteUrl: string | null = null;
  if (didKey) {
    didVideoRemoteUrl = await generateDidTalkingVideo(didKey, diskCharPath, scriptText, voiceId);
  }


  // --- BRANCH A: D-ID AI TALKING AVATAR GENERATION SUCCESSFUL ---
  if (didVideoRemoteUrl) {
    // Download D-ID generated MP4
    const remoteRes = await fetch(didVideoRemoteUrl);
    const arrayBuffer = await remoteRes.arrayBuffer();
    const tempDidClipPath = path.join(exportDir, `temp_did_${Date.now()}.mp4`);
    fs.writeFileSync(tempDidClipPath, Buffer.from(arrayBuffer));

    // Composite D-ID Talking Video with Product Image in 9:16 Vertical Video format
    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpeg();
      cmd.input(tempDidClipPath);    // [0:v] D-ID Talking Presenter
      cmd.input(diskProductPath);   // [1:v] Product Image

      const filterGraph = [
        // Top half: Product with subtle zoom
        `[1:v]scale=1080:1000:force_original_aspect_ratio=increase,crop=1080:1000,setsar=1[prod_shot]`,
        // Bottom half: D-ID Real AI Talking Video
        `[0:v]scale=1080:920:force_original_aspect_ratio=increase,crop=1080:920,setsar=1[char_shot]`,
        // Stack top product & bottom talking creator
        `[prod_shot][char_shot]vstack=inputs=2[final_v]`,
      ].join(";");

      cmd
        .complexFilter(filterGraph, "final_v")
        .outputOptions([
          "-c:v libx264",
          "-pix_fmt yuv420p",
          "-c:a aac",
          "-b:a 192k",
          "-r 30",
          "-shortest",
          "-preset fast",
        ])
        .output(outputPath)
        .on("end", () => {
          // Cleanup temp file
          try { fs.unlinkSync(tempDidClipPath); } catch {}
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg D-ID Composite error:", err);
          reject(err);
        })
        .run();
    });

    const prompts = generateNalarkaPrompts({ brandName, productUsp, hookHeadline });

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
      audioUrl: publicVideoUrl, // Audio is embedded in the AI video
      durationSec: 15,
      prompts,
    };
  }

  // --- BRANCH B: NATIVE LOCAL FFmpeg PIPELINE (Fallback) ---
  const totalDuration = vo.durationSec;

  await new Promise<void>((resolve, reject) => {
    const cmd = ffmpeg();
    cmd.input(diskCharPath);       // [0:v] Character Model Image
    cmd.input(diskProductPath);    // [1:v] Product Model Image
    cmd.input(vo.audioPath);       // [2:a] Generated Voiceover Audio

    const filterGraph = [
      `color=c=0x0f1117:s=1080x1920:d=${totalDuration}[bg]`,
      `[1:v]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,setsar=1,zoompan=z='min(zoom+0.0006,1.06)':d=${totalDuration * 30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1080[prod_shot]`,
      `[0:v]scale=1080:840:force_original_aspect_ratio=increase,crop=1080:840,setsar=1,zoompan=z='min(zoom+0.0005,1.05)':d=${totalDuration * 30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x840[char_shot]`,
      `[prod_shot][char_shot]vstack=inputs=2[stacked]`,
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
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
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
