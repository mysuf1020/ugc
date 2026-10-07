"use client";

import { useState, useEffect } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AssetUploader } from "@/components/avatar-studio/AssetUploader";
import {
  FormatAndProductConfig,
  AspectRatioType,
} from "@/components/avatar-studio/FormatAndProductConfig";
import { GenerationProgress } from "@/components/avatar-studio/GenerationProgress";
import { VideoPlayerMockup } from "@/components/avatar-studio/VideoPlayerMockup";

export default function AvatarStudioPage() {
  const [projectId, setProjectId] = useState<string | null>(null);

  // Uploaded Assets
  const [charPreview, setCharPreview] = useState<string | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [uploadingChar, setUploadingChar] = useState(false);
  const [uploadingProduct, setUploadingProduct] = useState(false);

  // Product & Script Info
  const [brandName, setBrandName] = useState("");
  const [productUsp, setProductUsp] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [hookHeadline, setHookHeadline] = useState("RAHASIA PRODUK VIRAL INI! 🔥");
  const [voiceId, setVoiceId] = useState("id-ID-ArdiNeural");
  const [generatingScript, setGeneratingScript] = useState(false);

  // Duration & Aspect Ratio Options
  const [targetDurationSec, setTargetDurationSec] = useState<number>(15);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("9:16");

  // 1-Click Video Generation State
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Results
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (generatingVideo) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [generatingVideo]);

  async function ensureProject(): Promise<string> {
    if (projectId) return projectId;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: brandName ? `UGC - ${brandName}` : "UGC Model & Product Project",
        brandName: brandName || "Brand Produk",
        productDescription: productUsp || "Solusi terbaik harian Anda",
        targetDurationSec,
        aspectRatio,
      }),
    });
    const data = await res.json();
    setProjectId(data.project.id);
    return data.project.id;
  }

  async function handleCharUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingChar(true);
    try {
      const pId = await ensureProject();
      const formData = new FormData();
      formData.append("projectId", pId);
      formData.append("type", "avatar");
      formData.append("file", file);

      const res = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCharPreview(data.url);
        toast.success("Foto Model Karakter berhasil diunggah!");
      } else {
        toast.error("Gagal mengupload foto model karakter.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setUploadingChar(false);
    }
  }

  async function handleProductUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProduct(true);
    try {
      const pId = await ensureProject();
      const formData = new FormData();
      formData.append("projectId", pId);
      formData.append("type", "product");
      formData.append("file", file);

      const res = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProductPreview(data.url);
        toast.success("Foto Model Barang berhasil diunggah!");
      } else {
        toast.error("Gagal mengupload foto model barang.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setUploadingProduct(false);
    }
  }

  async function handleGenerateScript() {
    if (!brandName || !productUsp) {
      toast.error("Harap masukkan nama brand dan keunggulan produk terlebih dahulu.");
      return;
    }

    setGeneratingScript(true);
    try {
      const pId = await ensureProject();
      const res = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: pId }),
      });

      if (res.ok) {
        const data = await res.json();
        const s = data.script;
        const speech = `${s.hookText} ${s.problemText} ${s.solutionText} ${s.ctaText}`.trim();
        setScriptText(speech);
        setHookHeadline(s.hookText.slice(0, 36) + "!");
        toast.success(`Naskah AI (${targetDurationSec}s) berhasil dirumuskan!`);
      }
    } catch {
      toast.error("Gagal menghasilkan naskah AI.");
    } finally {
      setGeneratingScript(false);
    }
  }

  async function handleAutoGenerateUgc() {
    if (!charPreview || !productPreview) {
      toast.error("Harap upload Model Char dan Model Barang terlebih dahulu.");
      return;
    }

    setGeneratingVideo(true);
    try {
      const pId = await ensureProject();
      let activeScript = scriptText.trim();
      let activeHook = hookHeadline;

      if (!activeScript) {
        toast.info(`Merumuskan naskah ulasan otomatis (${targetDurationSec}s)...`);
        const sRes = await fetch("/api/ai/script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: pId }),
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          const s = sData.script;
          activeScript = `${s.hookText} ${s.problemText} ${s.solutionText} ${s.ctaText}`.trim();
          activeHook = s.hookText.slice(0, 36) + "!";
          setScriptText(activeScript);
          setHookHeadline(activeHook);
        } else {
          activeScript = `Kalian wajib tahu produk ini! ${brandName || "Produk ini"} beneran ampuh banget. Langsung klik keranjang kuning!`;
          setScriptText(activeScript);
        }
      }

      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: pId,
          scriptText: activeScript,
          hookHeadline: activeHook,
          brandName: brandName || "Produk Pilihan",
          productUsp: productUsp || "Solusi terbaik harian",
          voiceId,
          targetDurationSec,
          aspectRatio,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedVideoUrl(data.videoUrl);
        setGeneratedAudioUrl(data.audioUrl);
        toast.success(`Video UGC (${targetDurationSec}s · ${aspectRatio}) berhasil dibuat!`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal membuat video otomatis.");
      }
    } catch {
      toast.error("Terjadi gangguan jaringan saat memproses video.");
    } finally {
      setGeneratingVideo(false);
    }
  }

  function handlePreviewFlowVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setGeneratedVideoUrl(localUrl);
    toast.success("Video dari Google Flow berhasil dimuat lengkap dengan audionya!");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Auto 1-Click UGC Generator: Model Char + Model Barang ➔ Video Otomatis</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          AI UGC Video Generator
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">
          Karakter AI beneran memegang & mereview produk secara langsung. Tentukan durasi video dan layout ukuran yang Anda inginkan (9:16, 16:9, 1:1, atau 4:5).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Form & Settings (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <AssetUploader
            charPreview={charPreview}
            productPreview={productPreview}
            uploadingChar={uploadingChar}
            uploadingProduct={uploadingProduct}
            onCharUpload={handleCharUpload}
            onProductUpload={handleProductUpload}
          />

          <FormatAndProductConfig
            targetDurationSec={targetDurationSec}
            setTargetDurationSec={setTargetDurationSec}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            brandName={brandName}
            setBrandName={setBrandName}
            productUsp={productUsp}
            setProductUsp={setProductUsp}
            scriptText={scriptText}
            setScriptText={setScriptText}
            voiceId={voiceId}
            setVoiceId={setVoiceId}
            generatingScript={generatingScript}
            onGenerateScript={handleGenerateScript}
          />

          {generatingVideo ? (
            <GenerationProgress
              elapsedSeconds={elapsedSeconds}
              targetDurationSec={targetDurationSec}
              aspectRatio={aspectRatio}
            />
          ) : (
            <button
              type="button"
              onClick={handleAutoGenerateUgc}
              disabled={!charPreview || !productPreview}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 py-4 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-40"
            >
              <Wand2 className="h-4 w-4 text-amber-400" />
              <span>
                Buat Video UGC Otomatis ({targetDurationSec} Detik · Layout {aspectRatio})
              </span>
            </button>
          )}
        </div>

        {/* Right Column: Live Video Player Result (5 Cols) */}
        <VideoPlayerMockup
          generatedVideoUrl={generatedVideoUrl}
          generatedAudioUrl={generatedAudioUrl}
          charPreview={charPreview}
          productPreview={productPreview}
          hookHeadline={hookHeadline}
          scriptText={scriptText}
          targetDurationSec={targetDurationSec}
          aspectRatio={aspectRatio}
          onPreviewFlowVideo={handlePreviewFlowVideo}
        />
      </div>
    </div>
  );
}
