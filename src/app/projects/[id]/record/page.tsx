"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Video,
  Mic,
  MicOff,
  Circle,
  Square,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Upload,
  ChevronRight,
  Eye,
  Settings2,
  Volume2,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";

interface TakeItem {
  id: string;
  takeNumber: number;
  filePath: string;
  durationSec: number;
  fileSize: number;
  createdAt: string;
}

interface SceneItem {
  id: string;
  orderIndex: number;
  sceneType: string;
  title: string;
  scriptLine: string;
  durationEst: number;
  activeTakeId: string | null;
  takes: TakeItem[];
}

interface ProjectRecordProps {
  params: Promise<{ id: string }>;
}

export default function RecordStudioPage({ params }: ProjectRecordProps) {
  const { id: projectId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState("");
  const [scenes, setScenes] = useState<SceneItem[]>([]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Media Devices
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [selectedAudioId, setSelectedAudioId] = useState("");
  const [isMirrored, setIsMirrored] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [uploadingTake, setUploadingTake] = useState(false);

  // Teleprompter Controls
  const [prompterSpeed, setPrompterSpeed] = useState(40); // px per second
  const [prompterFontSize, setPrompterFontSize] = useState(22); // px
  const [isPrompterScrolling, setIsPrompterScrolling] = useState(false);

  // Previewing a take
  const [previewTakeUrl, setPreviewTakeUrl] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const prompterBoxRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const activeScene = scenes[activeSceneIndex];

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
        setScenes(data.project.scenes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Initialize Camera & Microphone Stream
  useEffect(() => {
    initCamera();
    return () => {
      stopCamera();
    };
  }, [selectedVideoId, selectedAudioId]);

  async function initCamera() {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Query available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
      setAudioDevices(devices.filter((d) => d.kind === "audioinput"));

      const constraints: MediaStreamConstraints = {
        video: selectedVideoId ? { deviceId: { exact: selectedVideoId } } : { width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: selectedAudioId ? { deviceId: { exact: selectedAudioId } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Audio Level Meter Setup
      setupAudioMeter(stream);
    } catch (err) {
      console.warn("Unable to access camera/mic:", err);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }

  function setupAudioMeter(stream: MediaStream) {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) {
      console.warn("Audio meter setup error:", e);
    }
  }

  // Teleprompter Auto-Scroll Effect
  useEffect(() => {
    let scrollInterval: NodeJS.Timeout;
    if (isPrompterScrolling && prompterBoxRef.current) {
      scrollInterval = setInterval(() => {
        if (prompterBoxRef.current) {
          prompterBoxRef.current.scrollTop += (prompterSpeed / 60);
        }
      }, 1000 / 60);
    }
    return () => clearInterval(scrollInterval);
  }, [isPrompterScrolling, prompterSpeed]);

  // Start Recording with 3s Countdown
  function triggerRecordingFlow() {
    if (isRecording) {
      stopRecording();
      return;
    }

    setCountdown(3);
    const countTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countTimer);
          startRecordingActual();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function startRecordingActual() {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];

    let mimeType = "video/webm;codecs=vp9,opus";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm";
    }

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      await uploadRecordedTake(blob);
    };

    recorder.start(500); // chunk every 500ms
    setIsRecording(true);
    setIsPrompterScrolling(true);
    setRecordingSeconds(0);

    // Reset teleprompter scroll to top
    if (prompterBoxRef.current) {
      prompterBoxRef.current.scrollTop = 0;
    }

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPrompterScrolling(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  async function uploadRecordedTake(blob: Blob) {
    if (!activeScene) return;
    setUploadingTake(true);

    try {
      const formData = new FormData();
      formData.append("sceneId", activeScene.id);
      formData.append("projectId", projectId);
      formData.append("durationSec", recordingSeconds.toString());
      formData.append("file", blob, `scene_${activeScene.id}_take.webm`);

      const res = await fetch("/api/record/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchProject(); // Refresh scenes & takes
      }
    } catch (err) {
      console.error("Failed to upload take:", err);
    } finally {
      setUploadingTake(false);
    }
  }

  // Handle direct file upload (for B-Roll)
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeScene) return;

    setUploadingTake(true);
    try {
      const formData = new FormData();
      formData.append("sceneId", activeScene.id);
      formData.append("projectId", projectId);
      formData.append("durationSec", "5.0");
      formData.append("file", file);

      const res = await fetch("/api/record/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchProject();
      }
    } catch (err) {
      console.error("Failed to upload b-roll:", err);
    } finally {
      setUploadingTake(false);
    }
  }

  // Select which take is active for this scene
  async function handleSelectActiveTake(takeId: string) {
    if (!activeScene) return;
    try {
      const res = await fetch("/api/record/select-take", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneId: activeScene.id, takeId }),
      });
      if (res.ok) {
        await fetchProject();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const recordedScenesCount = scenes.filter((s) => s.activeTakeId).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Breadcrumb & Step Indicator */}
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/projects" className="hover:text-white transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium">{projectTitle}</span>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">Recording Studio</span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-zinc-900/80 px-3 py-1.5 border border-zinc-800 text-xs">
          <span className="text-zinc-400">1. Brief</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <Link href={`/projects/${projectId}/script`} className="text-zinc-400 hover:text-white">
            2. Naskah AI
          </Link>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="font-semibold text-indigo-400">3. Rekam</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="text-zinc-500">4. Editor 9:16</span>
        </div>
      </div>

      {/* Scene Tabs Bar */}
      <div className="mb-6 flex items-center justify-between gap-4 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-max">
          {scenes.map((scene, idx) => {
            const isActive = activeSceneIndex === idx;
            const hasTake = Boolean(scene.activeTakeId);
            return (
              <button
                key={scene.id}
                onClick={() => {
                  if (isRecording) stopRecording();
                  setActiveSceneIndex(idx);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-zinc-950/50 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
                }`}
              >
                <span>Scene {idx + 1}: {scene.sceneType}</span>
                {hasTake ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-zinc-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pr-2">
          <span className="text-xs font-medium text-zinc-400 hidden md:inline">
            Progress: {recordedScenesCount}/{scenes.length} Scenes Terisi
          </span>
          <Link
            href={`/projects/${projectId}/editor`}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-colors"
          >
            <span>Masuk ke Editor 9:16</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Studio Viewport: Camera (Left/Center) + Teleprompter & Takes (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Camera Viewfinder (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative aspect-vertical-video max-h-[620px] w-full max-w-[350px] mx-auto overflow-hidden rounded-3xl border-2 border-zinc-800 bg-zinc-950 shadow-2xl">
            {/* Live Camera Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover transition-transform ${
                isMirrored ? "scale-x-[-1]" : ""
              }`}
            />

            {/* Countdown Overlay (3-2-1) */}
            {countdown !== null && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                <span className="text-8xl font-black text-white animate-ping">
                  {countdown}
                </span>
              </div>
            )}

            {/* Recording Pulse Badge */}
            {isRecording && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-red-600/90 px-3.5 py-1 text-xs font-bold text-white shadow-lg shadow-red-600/40">
                <span className="h-2.5 w-2.5 rounded-full bg-white record-pulse" />
                <span>REC {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}</span>
              </div>
            )}

            {/* Audio Level Indicator in Camera Viewfinder */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md border border-white/10">
              <Mic className="h-3.5 w-3.5 text-zinc-400" />
              <div className="h-2 w-16 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>

            {/* Mirror Toggle Button in Camera */}
            <button
              onClick={() => setIsMirrored(!isMirrored)}
              className="absolute top-4 right-4 z-20 rounded-full bg-black/60 p-2 text-zinc-300 backdrop-blur-md border border-white/10 hover:text-white"
              title="Mirror Camera"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Camera Action Buttons & Controls */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={triggerRecordingFlow}
                disabled={uploadingTake || countdown !== null}
                className={`flex items-center gap-2.5 rounded-2xl px-8 py-3.5 text-base font-bold text-white shadow-xl transition-all active:scale-95 ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-500 shadow-red-600/30"
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="h-5 w-5 fill-current" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-5 w-5 fill-red-500" />
                    <span>Mulai Rekam Scene Ini</span>
                  </>
                )}
              </button>

              {/* Upload B-Roll alternative */}
              <label className="flex items-center gap-2 cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                <Upload className="h-4 w-4 text-indigo-400" />
                <span>Upload B-Roll Video</span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingTake || isRecording}
                />
              </label>
            </div>

            {uploadingTake && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan klip video ke server...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Teleprompter & Take Manager (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Teleprompter Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Smart Teleprompter
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrompterScrolling(!isPrompterScrolling)}
                  className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-zinc-700"
                >
                  {isPrompterScrolling ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{isPrompterScrolling ? "Pause" : "Scroll"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (prompterBoxRef.current) prompterBoxRef.current.scrollTop = 0;
                  }}
                  className="rounded-lg bg-zinc-800 p-1 text-zinc-400 hover:text-white"
                  title="Reset Scroll"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Teleprompter Text Display */}
            <div
              ref={prompterBoxRef}
              className="h-44 overflow-y-auto rounded-xl bg-zinc-950 p-4 border border-zinc-800/80 scroll-smooth"
            >
              <p
                className="font-bold text-zinc-100 leading-relaxed transition-all"
                style={{ fontSize: `${prompterFontSize}px` }}
              >
                {activeScene?.scriptLine || "Teks naskah untuk scene ini..."}
              </p>
            </div>

            {/* Prompter Controls: Speed & Font Size */}
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-3 text-xs">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Kecepatan Scroll</span>
                  <span className="text-zinc-200 font-bold">{prompterSpeed} px/s</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={90}
                  value={prompterSpeed}
                  onChange={(e) => setPrompterSpeed(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Ukuran Font</span>
                  <span className="text-zinc-200 font-bold">{prompterFontSize} px</span>
                </div>
                <input
                  type="range"
                  min={16}
                  max={34}
                  value={prompterFontSize}
                  onChange={(e) => setPrompterFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Takes Manager for Active Scene */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Daftar Take untuk Scene {activeSceneIndex + 1}
              </h3>
              <span className="text-[11px] font-semibold text-zinc-500">
                {activeScene?.takes?.length || 0} Take Tersimpan
              </span>
            </div>

            {(!activeScene?.takes || activeScene.takes.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-500 text-xs">
                <Camera className="h-6 w-6 text-zinc-600 mb-2" />
                <p>Belum ada take rekaman untuk scene ini.</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Klik tombol Rekam atau Upload video di sebelah kiri.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {activeScene.takes.map((take) => {
                  const isActive = activeScene.activeTakeId === take.id;
                  return (
                    <div
                      key={take.id}
                      className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-all ${
                        isActive
                          ? "border-emerald-500/50 bg-emerald-500/10 text-white"
                          : "border-zinc-800 bg-zinc-950/60 text-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPreviewTakeUrl(take.filePath)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200 hover:bg-indigo-600 hover:text-white transition-colors"
                          title="Preview Video"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                        </button>
                        <div>
                          <div className="font-bold text-zinc-200">Take #{take.takeNumber}</div>
                          <div className="text-[10px] text-zinc-500">
                            {take.durationSec > 0 ? `${take.durationSec.toFixed(1)}s • ` : ""}
                            {(take.fileSize / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectActiveTake(take.id)}
                        className={`rounded-lg px-3 py-1.5 font-semibold text-[11px] transition-all ${
                          isActive
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        }`}
                      >
                        {isActive ? "✓ Dipakai" : "Pilih Take Ini"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device Selection Collapsible Settings */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs space-y-3">
            <div className="flex items-center gap-2 text-zinc-400 font-semibold">
              <Settings2 className="h-3.5 w-3.5 text-zinc-500" />
              <span>Pengaturan Kamera & Mic</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">Pilih Kamera</label>
                <select
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-zinc-200"
                >
                  <option value="">Default Camera</option>
                  {videoDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">Pilih Mikrofon</label>
                <select
                  value={selectedAudioId}
                  onChange={(e) => setSelectedAudioId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-zinc-200"
                >
                  <option value="">Default Microphone</option>
                  {audioDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Mic ${d.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewTakeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative max-h-[85vh] w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <span className="text-xs font-bold text-white">Preview Take</span>
              <button
                onClick={() => setPreviewTakeUrl(null)}
                className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:text-white"
              >
                ✕ Tutup
              </button>
            </div>
            <video
              src={previewTakeUrl}
              controls
              autoPlay
              className="aspect-vertical-video w-full rounded-2xl object-cover bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}
