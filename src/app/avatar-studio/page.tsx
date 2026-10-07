"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  ShoppingBag,
  Sparkles,
  Download,
  Loader2,
  Volume2,
  Copy,
  Check,
  Film,
  ExternalLink,
  ArrowRight,
  Upload,
  Play,
  Layers,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

interface NalarkaPrompts {
  scene1: string;
  scene2: string;
  scene3: string;
  scene4: string;
}

export default function AvatarStudioPage() {
  const [projectId, setProjectId] = useState<string | null>(null);

  // Workflow Mode: 'flow' (Nalarka Google Flow) vs 'did' (Direct D-ID talking head)
  const [activeTab, setActiveTab] = useState<"flow" | "did">("flow");

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

  // Google Flow Package State
  const [preparingFlowPackage, setPreparingFlowPackage] = useState(false);
  const [stitchingFlowVideo, setStitchingFlowVideo] = useState(false);

  // D-ID Video Generation State
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Results
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<NalarkaPrompts | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

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
      title: "1. Upload & Verifikasi Aset",
      subtitle: "Menyiapkan foto wajah & produk ke storage",
    },
    {
      title: "2. Sintesis Suara Voiceover (VO)",
      subtitle: "Membuat narasi ulasan natural bahasa Indonesia",
    },
    {
      title: "3. Neural Face Lip-Sync (D-ID)",
      subtitle: "AI cloud merender gerakan wajah & bibir berbicara (±2-3 menit)",
    },
    {
      title: "4. Finalisasi Video 9:16 (FFmpeg)",
      subtitle: "Menjahit video AI, produk & kanvas vertikal",
    },
  ];

  let currentStageIndex = 0;
  if (elapsedSeconds >= 140) currentStageIndex = 3;
  else if (elapsedSeconds >= 25) currentStageIndex = 2;
  else if (elapsedSeconds >= 8) currentStageIndex = 1;

  let progressPercent = 5;
  if (elapsedSeconds < 8) {
    progressPercent = 5 + Math.round((elapsedSeconds / 8) * 15);
  } else if (elapsedSeconds < 25) {
    progressPercent = 20 + Math.round(((elapsedSeconds - 8) / 17) * 15);
  } else if (elapsedSeconds < 160) {
    progressPercent = 35 + Math.round(((elapsedSeconds - 25) / 135) * 50);
  } else {
    progressPercent = Math.min(97, 85 + Math.round(((elapsedSeconds - 160) / 40) * 12));
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

  // --- GOOGLE FLOW PIPELINE (METODE NALARKA) ---
  async function handlePrepareFlowPackage() {
    if (!scriptText.trim()) {
      toast.error("Harap isi naskah atau klik 'Buatkan Naskah Otomatis' terlebih dahulu.");
      return;
    }

    setPreparingFlowPackage(true);
    try {
      const pId = await ensureProject();
      const res = await fetch("/api/avatar/flow-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: pId,
          brandName: brandName || "Produk",
          productUsp: productUsp || "Solusi terbaik harian",
          scriptText,
          hookHeadline,
          voiceId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedAudioUrl(data.audioUrl);
        setGeneratedPrompts(data.prompts);
        toast.success("Paket Google Flow & Voiceover berhasil disiapkan (2 Detik)!");
      } else {
        toast.error("Gagal menyiapkan paket Google Flow.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses audio & prompt.");
    } finally {
      setPreparingFlowPackage(false);
    }
  }

  async function handleStitchFlowVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStitchingFlowVideo(true);
    try {
      const pId = await ensureProject();
      const formData = new FormData();
      formData.append("projectId", pId);
      formData.append("file", file);

      const res = await fetch("/api/avatar/stitch-flow", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedVideoUrl(data.videoUrl);
        toast.success("Video dari Google Flow & Voiceover berhasil disatukan!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menggabungkan video Flow.");
      }
    } catch {
      toast.error("Terjadi gangguan jaringan saat memproses video Flow.");
    } finally {
      setStitchingFlowVideo(false);
    }
  }

  // --- D-ID DIRECT PIPELINE ---
  async function handleCreateDidVideo() {
    if (!charPreview || !productPreview) {
      toast.error("Harap upload Model Char (wajah) dan Model Barang (produk) terlebih dahulu.");
      return;
    }
    if (!scriptText.trim()) {
      toast.error("Harap isi naskah yang akan disuarakan oleh voiceover.");
      return;
    }

    setGeneratingVideo(true);
    try {
      const pId = await ensureProject();
      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: pId,
          scriptText,
          hookHeadline,
          brandName,
          productUsp,
          voiceId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedVideoUrl(data.videoUrl);
        setGeneratedAudioUrl(data.audioUrl);
        setGeneratedPrompts(data.prompts);
        toast.success("Video UGC dan Suara VO berhasil digenerate!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal membuat video.");
      }
    } catch {
      toast.error("Terjadi gangguan jaringan saat memproses video.");
    } finally {
      setGeneratingVideo(false);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(key);
    toast.success("Prompt berhasil disalin ke clipboard!");
    setTimeout(() => setCopiedPrompt(null), 2000);
  }

  function copyAllPrompts() {
    if (!generatedPrompts) return;
    const all = `[SCENE 1 - HOOK]\n${generatedPrompts.scene1}\n\n[SCENE 2 - CLOSE-UP PRODUK]\n${generatedPrompts.scene2}\n\n[SCENE 3 - REAKSI & PENGALAMAN]\n${generatedPrompts.scene3}\n\n[SCENE 4 - CTA KERANJANG KUNING]\n${generatedPrompts.scene4}`;
    navigator.clipboard.writeText(all);
    toast.success("Semua 4 prompt berhasil disalin ke clipboard!");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-slate-700" />
          <span>Workflow UGC Nalarka: Model Char + Model Barang ➔ Video Google Flow</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          AI UGC Creator Studio
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">
          Karakter AI beneran memegang, memakai, dan mereview produk Anda secara fotorealistis menggunakan engine Google Flow, disinkronkan dengan suara Voiceover bahasa Indonesia.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="mb-8 flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab("flow")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "flow"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>⚡ Google Flow Studio (Metode Nalarka - Rekomendasi)</span>
        </button>

        <button
          onClick={() => setActiveTab("did")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
            activeTab === "did"
              ? "bg-slate-900 text-white shadow-xs font-bold"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Film className="h-4 w-4 text-slate-500" />
          <span>Direct Talking Head (D-ID Lip-Sync)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Form & Asset Uploader (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Upload Assets */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">1</span>
                <span>Aset Karakter & Produk</span>
              </h2>
              <span className="text-[11px] text-slate-500">Foto Referensi UGC</span>
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
                    <span className="text-xs font-bold text-slate-900">Model Char (Wajah / Sheet)</span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Foto selfie, kreator, atau character sheet
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
                    <span className="text-xs font-bold text-slate-900">Model Barang (Produk)</span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Foto produk (skincare, botol, packshot, dll)
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

            {/* Quick Download Buttons for Google Flow */}
            {(charPreview || productPreview) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Unduh untuk Flow:</span>
                {charPreview && (
                  <a
                    href={charPreview}
                    download="model_karakter.png"
                    className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download Foto Karakter</span>
                  </a>
                )}
                {productPreview && (
                  <a
                    href={productPreview}
                    download="model_barang.png"
                    className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download Foto Produk</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Brand Information & Script */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">2</span>
              <span>Informasi Produk & Suara Narasi (VO)</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Brand / Produk
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Nivea Extra Bright Care & Protect"
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
                  <option value="id-ID-ArdiNeural">Indonesia - Ardi (Pria Natural & Mantap)</option>
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
                  <span>{generatingScript ? "Menulis Naskah..." : "Buatkan Naskah Otomatis (AI)"}</span>
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
                Naskah yang Akan Dibacakan oleh Suara Voiceover (VO)
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan naskah ulasan produk, atau klik 'Buatkan Naskah Otomatis' di atas..."
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* TAB 1: GOOGLE FLOW ACTION & PROMPT CARDS */}
          {activeTab === "flow" && (
            <div className="space-y-6">
              {/* Generate Package Button */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Langkah 3: Siapkan Paket Google Flow & Voiceover
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Menghasilkan file suara VO (MP3) jernih dan 4 prompt scene khusus Google Flow dalam 2 detik.
                    </p>
                  </div>
                  <a
                    href="https://flow.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <span>Buka Google Flow</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handlePrepareFlowPackage}
                  disabled={preparingFlowPackage || !scriptText.trim()}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-40"
                >
                  {preparingFlowPackage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Sedang Meracik Audio & Prompt...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 text-amber-400" />
                      <span>Siapkan Paket Google Flow & Voiceover (Instan 2 Detik)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated Prompts and Quick Actions */}
              {generatedPrompts && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span>Prompt Google Flow (Tinggal Salin & Paste ke Flow)</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pilih foto Karakter + Produk di Flow, lalu paste salah satu prompt berikut:
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyAllPrompts}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Semua</span>
                      </button>
                      <a
                        href="https://flow.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        <span>Ke Flow</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* 4 Scene Prompts */}
                  <div className="space-y-3">
                    {[
                      {
                        label: "Scene 1: Hook & Memegang Produk",
                        desc: "Kreator tersenyum antusias menghadap kamera sambil memegang produk",
                        text: generatedPrompts.scene1,
                        key: "s1",
                      },
                      {
                        label: "Scene 2: Demo / Mengoleskan Produk",
                        desc: "Close-up tekstur produk diaplikasikan ke kulit dengan pencahayaan mewah",
                        text: generatedPrompts.scene2,
                        key: "s2",
                      },
                      {
                        label: "Scene 3: Reaksi & Kepuasan Hasil",
                        desc: "Kreator memegang produk, kulit tampak cerah dan ekspresi sangat puas",
                        text: generatedPrompts.scene3,
                        key: "s3",
                      },
                      {
                        label: "Scene 4: Call to Action (Keranjang Kuning)",
                        desc: "Kreator menunjuk ke arah tombol keranjang kuning di kiri bawah layar",
                        text: generatedPrompts.scene4,
                        key: "s4",
                      },
                    ].map((item) => (
                      <div key={item.key} className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{item.label}</span>
                          <button
                            onClick={() => copyToClipboard(item.text, item.key)}
                            className="flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
                          >
                            {copiedPrompt === item.key ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span>{copiedPrompt === item.key ? "Tersalin!" : "Salin Prompt"}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2">{item.desc}</p>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-slate-200/80">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Stitching Box: Upload Google Flow video to combine with VO */}
                  <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-900">
                          Langkah Terakhir: Satukan Video dari Google Flow + Audio Voiceover
                        </h4>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                        Otomatis
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sudah selesai men-generate video di Google Flow? Download video MP4 tersebut dari Google Flow, lalu upload ke sini untuk digabungkan secara instan dengan suara Voiceover narasi di atas!
                    </p>

                    <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-white p-4 text-center hover:bg-indigo-50/20 transition-colors">
                      {stitchingFlowVideo ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 py-3">
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                          <span>Sedang menggabungkan video Flow & suara VO...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-indigo-500 mb-1" />
                          <span className="text-xs font-bold text-slate-800">
                            Pilih atau Drag Video Hasil dari Google Flow (.mp4)
                          </span>
                          <span className="text-[11px] text-slate-500 mt-0.5">
                            Sistem akan menempelkan audio narasi VO ke video tersebut
                          </span>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleStitchFlowVideo}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: D-ID DIRECT TALKING HEAD */}
          {activeTab === "did" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Direct Talking Head (D-ID Lip-Sync)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Catatan: D-ID hanya menganimasikan gerakan bibir & ekspresi wajah dari 1 foto potret kepala. D-ID tidak dapat membuat karakter memegang botol produk.
              </p>

              {generatingVideo ? (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-900"></span>
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {stages[currentStageIndex]?.title}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      ⏱ {formatTime(elapsedSeconds)} ({progressPercent}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-slate-900 h-2.5 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateDidVideo}
                  disabled={!charPreview || !productPreview || !scriptText.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40"
                >
                  <Film className="h-4 w-4" />
                  <span>Render Video Lip-Sync D-ID (±2-3 Menit)</span>
                </button>
              )}
            </div>
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
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all"
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
