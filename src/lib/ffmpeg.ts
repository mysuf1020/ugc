import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/db";

// Resolve ffmpeg path safely for Windows local and Linux VPS
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
  if (ffmpegInstaller && ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  }
} catch {
  // If installer binary is not found, fallback to system ffmpeg binary in PATH
}

export interface RenderJobParams {
  exportId: string;
  projectId: string;
  clips: {
    filePath: string;
    duration: number;
    overlayText?: string;
  }[];
  musicPath?: string;
  musicVolume?: number;
}

export async function processVideoRender(params: RenderJobParams): Promise<string> {
  const { exportId, projectId, clips } = params;

  const exportDir = path.join(process.cwd(), "public", "uploads", "projects", projectId, "exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const outputFileName = `ugc_final_1080x1920_${Date.now()}.mp4`;
  const outputPath = path.join(exportDir, outputFileName);
  const publicOutputPath = `/uploads/projects/${projectId}/exports/${outputFileName}`;

  // Temporary list file for concat demuxer
  const tempDir = path.join(process.cwd(), "public", "uploads", "projects", projectId, "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Pre-process each clip to exact vertical 1080x1920 30fps H.264 MP4
  const normalizedClipPaths: string[] = [];

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const inputDiskPath = path.join(process.cwd(), "public", clip.filePath.replace(/^\//, ""));

    if (!fs.existsSync(inputDiskPath)) {
      console.warn("Clip file does not exist on disk:", inputDiskPath);
      continue;
    }

    const normOutput = path.join(tempDir, `norm_clip_${i}_${Date.now()}.mp4`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputDiskPath)
        .videoFilters([
          "scale=1080:1920:force_original_aspect_ratio=decrease",
          "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
          "setsar=1",
        ])
        .videoCodec("libx264")
        .outputOptions(["-r 30", "-pix_fmt yuv420p", "-preset fast"])
        .audioCodec("aac")
        .audioFrequency(44100)
        .audioChannels(2)
        .output(normOutput)
        .on("end", () => {
          normalizedClipPaths.push(normOutput);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Error normalizing clip ${i}:`, err);
          reject(err);
        })
        .run();
    });

    const normProgress = Math.round(((i + 1) / clips.length) * 50);
    await prisma.videoExport.update({
      where: { id: exportId },
      data: { progress: normProgress },
    }).catch(() => {});
  }

  if (normalizedClipPaths.length === 0) {
    throw new Error("No valid clips found to render.");
  }

  const command = ffmpeg();
  normalizedClipPaths.forEach((p) => {
    command.input(p);
  });

  const filterInputs = normalizedClipPaths.map((_, idx) => `[${idx}:v][${idx}:a]`).join("");
  const filterGraph = `${filterInputs}concat=n=${normalizedClipPaths.length}:v=1:a=1[outv][outa]`;

  return new Promise((resolve, reject) => {
    command
      .complexFilter(filterGraph, ["outv", "outa"])
      .outputOptions(["-c:v libx264", "-pix_fmt yuv420p", "-c:a aac", "-r 30"])
      .output(outputPath)
      .on("progress", async (p) => {
        if (p.percent) {
          const totalProgress = 50 + Math.round(p.percent * 0.45);
          await prisma.videoExport.update({
            where: { id: exportId },
            data: { progress: Math.min(98, totalProgress) },
          }).catch(() => {});
        }
      })
      .on("end", async () => {
        normalizedClipPaths.forEach((f) => {
          try {
            if (fs.existsSync(f)) fs.unlinkSync(f);
          } catch {}
        });

        const stats = fs.statSync(outputPath);

        await prisma.videoExport.update({
          where: { id: exportId },
          data: {
            status: "COMPLETED",
            progress: 100,
            outputPath: publicOutputPath,
            fileSize: stats.size,
            completedAt: new Date(),
          },
        });

        await prisma.project.update({
          where: { id: projectId },
          data: { status: "RENDERED" },
        });

        resolve(publicOutputPath);
      })
      .on("error", async (err) => {
        console.error("FFmpeg concatenation error:", err);
        await prisma.videoExport.update({
          where: { id: exportId },
          data: {
            status: "FAILED",
            errorMessage: err.message || "FFmpeg render error",
          },
        }).catch(() => {});
        reject(err);
      })
      .run();
  });
}
