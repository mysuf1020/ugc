"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  ShoppingBag,
  Sparkles,
  Download,
  Loader2,
  Volume2,
  Check,
  Film,
  Play,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

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

  const stages = [
    {
      title: "1. Analisis Model & Penyiapan Naskah",
      subtitle: "Menyiapkan referensi karakter & formula hook viral",
    },
    {
      title: "2. Sintesis Suara Voiceover (VO)",
      subtitle: "Membuat narasi suara natural bahasa Indonesia",
    },
    {
      title: "3. Rendering AI Video Scene Karakter",
      subtitle: "Karakter dibuatkan adegan memegang & mengulas produk (±1-2 menit)",
    },
    {
      title: "4. Finalisasi Video 9:16 Siap Pakai",
      subtitle: "Menyatukan video AI, suara narasi & format TikTok 1080x1920",
    },
  ];

  let currentStageIndex = 0;
  if (elapsedSeconds >= 90) currentStageIndex = 3;
  else if (elapsedSeconds >= 15) currentStageIndex = 2;
  else if (elapsedSeconds >= 5) currentStageIndex = 1;

  let progressPercent = 5;
  if (elapsedSeconds < 5) {
    progressPercent = 5 + Math.round((elapsedSeconds / 5) * 15);
  } else if (elapsedSeconds < 15) {
    progressPercent = 20 + Math.round(((elapsedSeconds - 5) / 10) * 15);
  } else if (elapsedSeconds < 110) {
    progressPercent = 35 + Math.round(((elapsedSeconds - 15) / 95) * 55);
  } else {
    progressPercent = Math.min(98, 90 + Math.round(((elapsedSeconds - 110) / 30) * 8));
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  async function ensureProject(): Promise<string> {
    if (projectId) return projectId;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: brandName ? `UGC - ${brandName}` : "UGC Model & Product Project",
        brandName: brandName || "Brand Produk",
        productDescription: productUsp || "Solusi terbaik harian Anda",
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
        const generatedSpeech = `${s.hookText} ${s.problemText} ${s.solutionText} ${s.ctaText}`.trim();
        setScriptText(generatedSpeech);
        setHookHeadline(s.hookText.slice(0, 36) + "!");
        toast.success("Naskah ulasan AI berhasil dirumuskan!");
      }
    } catch {
      toast.error("Gagal menghasilkan naskah AI.");
    } finally {
      setGeneratingScript(false);
    }
  }

  // --- 1-CLICK AUTO VIDEO GENERATOR ---
  async function handleAutoGenerateUgc() {
    if (!charPreview || !productPreview) {
      toast.error("Harap upload Model Char (karakter) dan Model Barang (produk) terlebih dahulu.");
      return;
    }

    setGeneratingVideo(true);
    try {
      const pId = await ensureProject();

      // If script is empty, auto-generate script on the fly
      let activeScript = scriptText.trim();
      let activeHook = hookHeadline;

      if (!activeScript) {
        toast.info("Merumuskan naskah ulasan otomatis...");
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
          activeScript = `Kalian wajib tahu produk ini! ${brandName || "Produk ini"} beneran ampuh banget buat ${productUsp || "kebutuhan harian"}. Langsung klik keranjang kuning sekarang juga!`;
          setScriptText(activeScript);
        }
      }

      // Execute full automated video generator
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
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedVideoUrl(data.videoUrl);
        setGeneratedAudioUrl(data.audioUrl);
        toast.success("Video UGC otomatis berhasil dibuat lengkap dengan audio!");
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Auto 1-Click UGC Generator: Model Char + Model Barang ➔ Video Langsung Jadi</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Auto AI UGC Video Generator
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">
          Cukup upload foto model karakter dan foto produk. Sistem akan otomatis membuatkan naskah, suara voiceover (VO) bahasa Indonesia, dan video karakter yang memegang produk secara langsung.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Form & 1-Click Action (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Upload Assets */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">1</span>
                <span>Upload Model Karakter & Produk</span>
              </h2>
              <span className="text-[11px] text-slate-500">2 Foto Aset Utama</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Box 1: Model Char */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group hover:border-slate-400 hover:bg-slate-100/60 transition-colors">
                {charPreview ? (
                  <div className="relative h-44 w-full rounded-lg overflow-hidden flex flex-col justify-between">
                    <img
                      src={charPreview}
                      alt="Model Karakter"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] font-semibold text-white bg-slate-900/80 px-2 py-1 rounded">
                        Ganti Foto Model
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 border border-slate-200 mb-3 shadow-xs">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Model Char (Wajah / Kreator)</span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Foto selfie atau model karakter Anda
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCharUpload}
                  disabled={uploadingChar}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploadingChar && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs text-slate-800 gap-1.5 font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                    <span>Mengupload...</span>
                  </div>
                )}
              </div>

              {/* Box 2: Model Barang */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group hover:border-slate-400 hover:bg-slate-100/60 transition-colors">
                {productPreview ? (
                  <div className="relative h-44 w-full rounded-lg overflow-hidden flex flex-col justify-between">
                    <img
                      src={productPreview}
                      alt="Model Barang"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] font-semibold text-white bg-slate-900/80 px-2 py-1 rounded">
                        Ganti Foto Barang
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 border border-slate-200 mb-3 shadow-xs">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Model Barang (Foto Produk)</span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Foto produk affiliate / brand
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductUpload}
                  disabled={uploadingProduct}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploadingProduct && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs text-slate-800 gap-1.5 font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                    <span>Mengupload...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Product & Voice Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">2</span>
              <span>Detail Produk & Pengisi Suara (VO)</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Brand / Produk
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Nivea Care & Protect"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilihan Suara Voiceover (VO)
                </label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none"
                >
                  <option value="id-ID-ArdiNeural">Indonesia - Ardi (Pria Natural & Berwibawa)</option>
                  <option value="id-ID-GadisNeural">Indonesia - Gadis (Wanita Ramah & Ceria)</option>
                  <option value="en-US-ChristopherNeural">English - Christopher (Male Casual)</option>
                  <option value="en-US-JennyNeural">English - Jenny (Female Energetic)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Keunggulan / USP Produk
                </label>
                <button
                  type="button"
                  onClick={handleGenerateScript}
                  disabled={generatingScript || !brandName}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-40"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>{generatingScript ? "Menulis..." : "Buatkan Naskah Otomatis"}</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="Contoh: Kulit cerah tampak sehat dalam 7 hari dengan SPF 15 & 8 superfood"
                value={productUsp}
                onChange={(e) => setProductUsp(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Naskah Narasi VO (Bisa Dikosongkan, AI Akan Membuatkan Otomatis)
              </label>
              <textarea
                rows={3}
                placeholder="Dapat dikosongkan agar AI membuatkan secara otomatis saat tombol di bawah diklik..."
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* MAIN 1-CLICK ACTION & REALTIME PROGRESS MONITOR */}
          {generatingVideo ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              {/* Header with Live Status & Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-900"></span>
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Sedang Membuat Video UGC Otomatis...</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {stages[currentStageIndex]?.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 border border-slate-200">
                    ⏱ {formatTime(elapsedSeconds)}
                  </span>
                  <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-mono font-bold text-white shadow-xs">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Smooth Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-slate-900 h-2.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* 4-Step Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {stages.map((stg, idx) => {
                  const isDone = currentStageIndex > idx;
                  const isCurrent = currentStageIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 rounded-xl border p-2.5 transition-all ${
                        isCurrent
                          ? "border-slate-900 bg-slate-50 shadow-xs ring-1 ring-slate-900"
                          : isDone
                          ? "border-slate-200 bg-white text-slate-600"
                          : "border-slate-100 bg-slate-50/50 opacity-60 text-slate-400"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isCurrent ? "text-slate-900" : isDone ? "text-slate-800" : "text-slate-400"}`}>
                          {stg.title}
                        </span>
                        <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                          {stg.subtitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <span>
                  Video AI sedang dibuat dan otomatis digabungkan dengan suara narasi VO bahasa Indonesia. Begitu selesai, video akan langsung diputar di layar kanan.
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAutoGenerateUgc}
              disabled={!charPreview || !productPreview}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 py-4 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-40"
            >
              <Wand2 className="h-4 w-4 text-amber-400" />
              <span>Buat Video UGC Otomatis (Video Karakter Memegang Produk + Suara VO)</span>
            </button>
          )}
        </div>

        {/* Right Column: Live 9:16 Video Player Result (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-4">
          <div className="relative aspect-vertical-video max-h-[640px] w-full max-w-[340px] overflow-hidden rounded-[36px] border-[6px] border-slate-200 bg-slate-100 shadow-xl ring-1 ring-slate-300/80">
            {generatedVideoUrl ? (
              <video
                src={generatedVideoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex flex-col justify-between p-4 relative bg-slate-50">
                {/* Smartphone Dynamic Island / Notch */}
                <div className="flex flex-col items-center gap-2 pt-1">
                  <div className="h-4 w-24 rounded-full bg-slate-200/80" />
                  <div className="rounded-full bg-slate-900 px-3.5 py-1 text-center text-[10px] font-bold text-white shadow-sm tracking-wide">
                    {hookHeadline}
                  </div>
                </div>

                {/* Preview Mockup Canvas */}
                <div className="flex-1 flex flex-col justify-center items-center my-3 space-y-2">
                  <div className="w-full h-full flex flex-col gap-2">
                    {/* Upper: Product */}
                    <div className="flex-1 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs relative">
                      {productPreview ? (
                        <img src={productPreview} alt="Produk" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-center p-2">
                          <ShoppingBag className="h-5 w-5 text-slate-300 mb-1" />
                          <span className="text-[10px] text-slate-400 font-semibold">Model Barang (Produk)</span>
                        </div>
                      )}
                    </div>
                    {/* Lower: Character */}
                    <div className="flex-1 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs relative">
                      {charPreview ? (
                        <img src={charPreview} alt="Model Char" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-center p-2">
                          <UserCheck className="h-5 w-5 text-slate-300 mb-1" />
                          <span className="text-[10px] text-slate-400 font-semibold">Model Char (Karakter)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtitle Caption Overlay */}
                <div className="z-10 rounded-2xl bg-white/95 px-3.5 py-2.5 text-center backdrop-blur border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                    &ldquo;{scriptText || "Suara narasi VO akan disematkan dan diputar di sini..."}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Audio Player and Download Section */}
          <div className="flex flex-col gap-2 w-full max-w-[340px]">
            {generatedAudioUrl && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-slate-600" />
                    <span>File Audio Voiceover (VO)</span>
                  </span>
                  <a
                    href={generatedAudioUrl}
                    download="voiceover_ugc.mp3"
                    className="text-[10px] font-bold text-slate-900 hover:underline"
                  >
                    Download MP3
                  </a>
                </div>
                <audio src={generatedAudioUrl} controls className="w-full h-8" />
              </div>
            )}

            {generatedVideoUrl && (
              <a
                href={generatedVideoUrl}
                download="ugc_affiliate_video_1080x1920.mp4"
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download Video MP4 1080x1920</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
