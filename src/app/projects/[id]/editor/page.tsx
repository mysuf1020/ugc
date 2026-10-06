"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Film,
  Music,
  Type,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Layers,
  Volume2,
  Share2,
} from "lucide-react";

interface TakeItem {
  id: string;
  takeNumber: number;
  filePath: string;
  durationSec: number;
}

interface SceneItem {
  id: string;
  orderIndex: number;
  sceneType: string;
  title: string;
  scriptLine: string;
  overlayText: string | null;
  activeTakeId: string | null;
  takes: TakeItem[];
}

interface VideoExportItem {
  id: string;
  outputPath: string | null;
  status: string;
  progress: number;
  fileSize: number | null;
}

export default function EditorStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);

  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [scenes, setScenes] = useState<SceneItem[]>([]);
  const [recentExport, setRecentExport] = useState<VideoExportItem | null>(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Viral Text Overlay Customization
  const [overlayBannerText, setOverlayBannerText] = useState("RAHASIA VIRAL INI! 🔥");
  const [bannerStyle, setBannerStyle] = useState<"yellow" | "red" | "black" | "white">("yellow");
  const [showSubtitles, setShowSubtitles] = useState(true);

  // Background Music State
  const [enableBgm, setEnableBgm] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.2);

  // Rendering State
  const [rendering, setRendering] = useState(false);
  const [renderExportId, setRenderExportId] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatus, setRenderStatus] = useState<string | null>(null);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  async function fetchProject() {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectTitle(data.project.title);
        setBrandName(data.project.brandName);
        const scns: SceneItem[] = data.project.scenes || [];
        setScenes(scns);

        if (scns[0]?.overlayText) {
          setOverlayBannerText(scns[0].overlayText);
        }

        if (data.project.exports && data.project.exports.length > 0) {
          const latest = data.project.exports[0];
          setRecentExport(latest);
          if (latest.status === "COMPLETED" && latest.outputPath) {
            setRenderedVideoUrl(latest.outputPath);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Get active video URL for currently playing scene
  const activeScene = scenes[currentSceneIdx];
  const activeTake =
    activeScene?.takes?.find((t) => t.id === activeScene.activeTakeId) ||
    activeScene?.takes?.[0];
  const activeVideoUrl = activeTake?.filePath || null;

  // Handle sequential playback across scenes
  function handleVideoEnded() {
    if (currentSceneIdx < scenes.length - 1) {
      setCurrentSceneIdx((prev) => prev + 1);
    } else {
      // Loop or pause at end
      setIsPlaying(false);
      setCurrentSceneIdx(0);
    }
  }

  function togglePlayPause() {
    if (!videoPlayerRef.current) return;
    if (isPlaying) {
      videoPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      videoPlayerRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  // Trigger Server-side FFmpeg rendering
  async function handleStartRender() {
    setRendering(true);
    setRenderError(null);
    setRenderProgress(5);
    setRenderStatus("Memulai antrean render video...");

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (res.ok) {
        const data = await res.json();
        setRenderExportId(data.exportId);
        pollRenderStatus(data.exportId);
      } else {
        const err = await res.json();
        setRenderError(err.error || "Gagal memulai rendering.");
        setRendering(false);
      }
    } catch {
      setRenderError("Terjadi gangguan jaringan saat render.");
      setRendering(false);
    }
  }

  // Poll render progress until completion
  function pollRenderStatus(exportId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/render/status/${exportId}`);
        if (res.ok) {
          const data = await res.json();
          setRenderProgress(data.progress || 10);

          if (data.status === "COMPLETED") {
            clearInterval(interval);
            setRendering(false);
            setRenderStatus("Selesai!");
            setRenderedVideoUrl(data.outputPath);
            await fetchProject();
          } else if (data.status === "FAILED") {
            clearInterval(interval);
            setRendering(false);
            setRenderError(data.errorMessage || "Proses render video gagal.");
          } else {
            setRenderStatus(`Memproses video vertikal 1080x1920 (${data.progress}%)...`);
          }
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 1500);
  }

  // Helper banner style classes
  function getBannerStyles() {
    switch (bannerStyle) {
      case "yellow":
        return "bg-yellow-400 text-black shadow-lg shadow-black/50 font-black";
      case "red":
        return "bg-red-600 text-white shadow-lg shadow-red-600/40 font-black";
      case "black":
        return "bg-black/90 text-yellow-300 border-2 border-yellow-400 font-extrabold";
      case "white":
        return "bg-white text-zinc-950 font-black";
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Breadcrumb & Workflow Indicator */}
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/projects" className="hover:text-white transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium">{projectTitle}</span>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">9:16 Video Editor</span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-zinc-900/80 px-3 py-1.5 border border-zinc-800 text-xs">
          <span className="text-zinc-400">1. Brief</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <Link href={`/projects/${projectId}/script`} className="text-zinc-400 hover:text-white">
            2. Naskah AI
          </Link>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <Link href={`/projects/${projectId}/record`} className="text-zinc-400 hover:text-white">
            3. Rekam
          </Link>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="font-semibold text-indigo-400">4. Editor 9:16</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: 9:16 Mobile Canvas Preview Player (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-4">
          <div className="relative aspect-vertical-video max-h-[640px] w-full max-w-[360px] overflow-hidden rounded-3xl border-2 border-zinc-800 bg-black shadow-2xl">
            {/* Active Take Video Player */}
            {activeVideoUrl ? (
              <video
                ref={videoPlayerRef}
                src={activeVideoUrl}
                playsInline
                onEnded={handleVideoEnded}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-zinc-500 text-xs">
                <Film className="h-10 w-10 text-zinc-700 mb-2" />
                <p className="font-semibold text-zinc-400">Belum ada take di Scene ini</p>
                <Link
                  href={`/projects/${projectId}/record`}
                  className="mt-3 rounded-lg bg-zinc-800 px-3 py-1.5 text-zinc-300 hover:text-white text-[11px]"
                >
                  Rekam Scene Ini Sekarang
                </Link>
              </div>
            )}

            {/* Live Viral Top Hook Banner */}
            {overlayBannerText && (
              <div className="absolute top-8 inset-x-4 z-20 flex justify-center pointer-events-none">
                <div
                  className={`rounded-xl px-4 py-2 text-center text-xs tracking-tight uppercase leading-snug transform -rotate-1 ${getBannerStyles()}`}
                >
                  {overlayBannerText}
                </div>
              </div>
            )}

            {/* Live Subtitle Overlay (Lower Third) */}
            {showSubtitles && activeScene?.scriptLine && (
              <div className="absolute bottom-14 inset-x-4 z-20 flex justify-center pointer-events-none">
                <div className="rounded-xl bg-black/75 px-3 py-2 text-center backdrop-blur-md border border-white/10 max-w-[90%]">
                  <p className="text-xs font-bold text-white drop-shadow-md leading-relaxed">
                    &ldquo;{activeScene.scriptLine}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Current Playing Scene Watermark Badge */}
            <div className="absolute top-3 left-3 z-20 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-sm border border-white/10">
              Scene {currentSceneIdx + 1}/{scenes.length}: {activeScene?.sceneType}
            </div>

            {/* Play/Pause Overlay Button */}
            {activeVideoUrl && (
              <button
                type="button"
                onClick={togglePlayPause}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md">
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </div>
              </button>
            )}
          </div>

          {/* Player Transport Bar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlayPause}
              disabled={!activeVideoUrl}
              className="flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? "Pause Preview" : "Play Sequence"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentSceneIdx(0);
                if (videoPlayerRef.current) {
                  videoPlayerRef.current.currentTime = 0;
                  videoPlayerRef.current.play().catch(() => {});
                  setIsPlaying(true);
                }
              }}
              className="rounded-xl bg-zinc-800 p-2.5 text-zinc-300 hover:text-white"
              title="Restart from Scene 1"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Customization Controls & Rendering (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Export Action Card */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-zinc-900/40 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Render Final Video (FFmpeg)
                </h3>
              </div>
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                1080x1920 MP4
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-5">
              Gabungkan semua scene, aplikasikan normalisasi rasio 9:16 vertikal, dan buat video MP4 siap posting di TikTok & Instagram Reels.
            </p>

            {renderError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{renderError}</span>
              </div>
            )}

            {rendering ? (
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>{renderStatus}</span>
                  <span className="text-indigo-400">{renderProgress}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartRender}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 hover:from-indigo-500 hover:to-emerald-400 transition-all active:scale-[0.98]"
              >
                <Film className="h-4 w-4" />
                <span>Render Video 1080x1920 Sekarang</span>
              </button>
            )}

            {/* Completed Video Download CTA */}
            {renderedVideoUrl && !rendering && (
              <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Video Siap Didownload!</span>
                </div>
                <a
                  href={renderedVideoUrl}
                  download="ugc_video_final_1080x1920.mp4"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/20"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download MP4</span>
                </a>
              </div>
            )}
          </div>

          {/* Text & Hook Banner Customizer */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <Type className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Overlay Teks & Viral Hook
              </h3>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Teks Banner Atas
              </label>
              <input
                type="text"
                value={overlayBannerText}
                onChange={(e) => setOverlayBannerText(e.target.value)}
                placeholder="Contoh: JANGAN SKIP KALAU LAGI NYARI INI!"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Gaya Desain Banner
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "yellow", label: "TikTok Yellow", color: "bg-yellow-400 text-black" },
                  { id: "red", label: "Urgent Red", color: "bg-red-600 text-white" },
                  { id: "black", label: "Dark Bold", color: "bg-black text-yellow-300" },
                  { id: "white", label: "Clean White", color: "bg-white text-black" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setBannerStyle(s.id as "yellow" | "red" | "black" | "white")}
                    className={`rounded-lg py-1.5 px-1 text-[10px] font-bold text-center border transition-all ${s.color} ${
                      bannerStyle === s.id ? "ring-2 ring-indigo-500 border-white" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <span className="text-xs text-zinc-300">Tampilkan Subtitle Percakapan</span>
              <input
                type="checkbox"
                checked={showSubtitles}
                onChange={(e) => setShowSubtitles(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Timeline & Scene Switching Bar */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Urutan Storyboard & Takes
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500">{scenes.length} Scenes</span>
            </div>

            <div className="space-y-2">
              {scenes.map((scene, idx) => {
                const isCur = currentSceneIdx === idx;
                const hasTake = Boolean(scene.activeTakeId || scene.takes?.length > 0);
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => {
                      setCurrentSceneIdx(idx);
                      if (videoPlayerRef.current) {
                        videoPlayerRef.current.currentTime = 0;
                        videoPlayerRef.current.play().catch(() => {});
                        setIsPlaying(true);
                      }
                    }}
                    className={`w-full flex items-center justify-between rounded-xl border p-2.5 text-left text-xs transition-all ${
                      isCur
                        ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/15"
                        : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-300">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-zinc-200">{scene.title}</div>
                        <div className="text-[10px] text-zinc-500 line-clamp-1">
                          {scene.scriptLine}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasTake ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-amber-400 font-semibold">Kosong</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
