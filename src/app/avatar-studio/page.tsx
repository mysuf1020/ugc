"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  UserCheck,
  ShoppingBag,
  Sparkles,
  Play,
  Download,
  Loader2,
  Volume2,
  Copy,
  Check,
  AlertCircle,
  Film,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface NalarkaPrompts {
  scene1: string;
  scene2: string;
  scene3: string;
  scene4: string;
}

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

  // Video Generation & Result
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<NalarkaPrompts | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ensure project is created
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

  // Handle Character Face Upload
  async function handleCharUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingChar(true);
    setErrorMsg(null);
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
      } else {
        setErrorMsg("Gagal mengupload foto model karakter.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setUploadingChar(false);
    }
  }

  // Handle Product Image Upload
  async function handleProductUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProduct(true);
    setErrorMsg(null);
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
      } else {
        setErrorMsg("Gagal mengupload foto model barang.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setUploadingProduct(false);
    }
  }

  // Generate Script using AI
  async function handleGenerateScript() {
    if (!brandName || !productUsp) {
      setErrorMsg("Harap masukkan nama brand dan keunggulan produk terlebih dahulu.");
      return;
    }

    setGeneratingScript(true);
    setErrorMsg(null);
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
      }
    } catch {
      setErrorMsg("Gagal menghasilkan naskah AI.");
    } finally {
      setGeneratingScript(false);
    }
  }

  // Trigger Video + Voiceover Generation
  async function handleCreateVideo() {
    if (!charPreview || !productPreview) {
      setErrorMsg("Harap upload Model Char (wajah) dan Model Barang (produk) terlebih dahulu.");
      return;
    }
    if (!scriptText.trim()) {
      setErrorMsg("Harap isi naskah yang akan disuarakan oleh voiceover.");
      return;
    }

    setGeneratingVideo(true);
    setErrorMsg(null);
    setProgressText("Memproses suara Voiceover & merender video 1080x1920...");

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
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Gagal membuat video.");
      }
    } catch {
      setErrorMsg("Terjadi gangguan jaringan saat memproses video.");
    } finally {
      setGeneratingVideo(false);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(key);
    setTimeout(() => setCopiedPrompt(null), 2000);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Model Char + Model Barang ➔ Video & Suara VO</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          AI UGC Video & Voiceover Creator
        </h1>
        <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
          Cukup masukkan **Model Karakter (wajah)** dan **Model Barang (produk)**, AI akan otomatis membuatkan video vertikal 9:16 lengkap dengan narasi suara review dan teks hook viral.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Model Assets & Script Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Upload Model Char & Model Barang */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">1</span>
              <span>Input Model Char & Model Barang</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Box 1: Model Char */}
              <div className="rounded-xl border border-dashed border-indigo-500/40 bg-zinc-950/80 p-4 text-center flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group">
                {charPreview ? (
                  <div className="relative h-44 w-full rounded-lg overflow-hidden">
                    <img
                      src={charPreview}
                      alt="Model Karakter"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] font-semibold text-white bg-black/70 px-2 py-1 rounded">
                        Ganti Foto Model
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-zinc-100">Model Char (Wajah / Orang)</span>
                    <span className="text-[11px] text-zinc-400 mt-1">
                      Foto selfie, kreator, atau model karakter
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
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-indigo-400 gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mengupload...</span>
                  </div>
                )}
              </div>

              {/* Box 2: Model Barang */}
              <div className="rounded-xl border border-dashed border-emerald-500/40 bg-zinc-950/80 p-4 text-center flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group">
                {productPreview ? (
                  <div className="relative h-44 w-full rounded-lg overflow-hidden">
                    <img
                      src={productPreview}
                      alt="Model Barang"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] font-semibold text-white bg-black/70 px-2 py-1 rounded">
                        Ganti Foto Barang
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-zinc-100">Model Barang (Produk Brand)</span>
                    <span className="text-[11px] text-zinc-400 mt-1">
                      Foto produk (skincare, baju, tas, botol, dll)
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
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-emerald-400 gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mengupload...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Brand Information & Script */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">2</span>
              <span>Informasi Produk & Suara Narasi (VO)</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nama Brand / Produk
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Nivea Care & Protect"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Pilihan Suara Voiceover (VO)
                </label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
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
                <label className="text-xs font-semibold text-zinc-300">
                  Keunggulan / USP Produk
                </label>
                <button
                  type="button"
                  onClick={handleGenerateScript}
                  disabled={generatingScript || !brandName}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-40"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{generatingScript ? "Menulis Naskah..." : "Buatkan Naskah Otomatis (AI)"}</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="Contoh: Kulit cerah tampak sehat dalam 7 hari dengan 95% kemurnian vitamin C"
                value={productUsp}
                onChange={(e) => setProductUsp(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Naskah yang Akan Dibacakan oleh Suara Voiceover (VO)
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan naskah ulasan produk, atau klik 'Buatkan Naskah Otomatis' di atas..."
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleCreateVideo}
            disabled={generatingVideo || !charPreview || !productPreview}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-emerald-400 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {generatingVideo ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{progressText}</span>
              </>
            ) : (
              <>
                <Film className="h-5 w-5" />
                <span>Generate Video UGC + Suara VO (9:16)</span>
              </>
            )}
          </button>

          {/* Nalarka / Google Flow & Omni Prompts Accordion */}
          {generatedPrompts && (
            <div className="rounded-2xl border border-indigo-500/30 bg-zinc-900/60 p-5 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  <span>Prompt Google Flow / Omni (Metode Nalarka)</span>
                </div>
                <span className="text-[11px] text-zinc-500">4 Scene Prompts</span>
              </div>
              <p className="text-xs text-zinc-400">
                Jika Anda ingin me-render ulang di Google Flow / Omni / Kling / Luma gratis, Anda bisa salin prompt konsisten ini:
              </p>

              <div className="space-y-3">
                {[
                  { label: "Scene 1: Hook Video", text: generatedPrompts.scene1, key: "s1" },
                  { label: "Scene 2: Close-up Produk", text: generatedPrompts.scene2, key: "s2" },
                  { label: "Scene 3: Reaksi & Experience", text: generatedPrompts.scene3, key: "s3" },
                  { label: "Scene 4: Call to Action", text: generatedPrompts.scene4, key: "s4" },
                ].map((item) => (
                  <div key={item.key} className="rounded-xl bg-zinc-950 p-3 border border-zinc-800/80 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-zinc-300">{item.label}</span>
                      <button
                        onClick={() => copyToClipboard(item.text, item.key)}
                        className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 hover:text-white"
                      >
                        {copiedPrompt === item.key ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedPrompt === item.key ? "Tersalin!" : "Salin Prompt"}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live 9:16 Video Player Result (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-4">
          <div className="relative aspect-vertical-video max-h-[640px] w-full max-w-[340px] overflow-hidden rounded-3xl border-2 border-zinc-800 bg-black shadow-2xl">
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
              <div className="h-full w-full flex flex-col justify-between p-4 relative">
                {/* Top Hook Preview */}
                <div className="z-10 flex justify-center pt-2">
                  <div className="rounded-lg bg-yellow-400 px-3 py-1.5 text-center text-[10px] font-black uppercase text-black shadow-lg">
                    {hookHeadline}
                  </div>
                </div>

                {/* Preview Mockup */}
                <div className="flex-1 flex flex-col justify-center items-center my-4 space-y-2">
                  <div className="w-full h-full flex flex-col gap-1">
                    <div className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                      {productPreview ? (
                        <img src={productPreview} alt="Produk" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-bold">Model Barang (Produk)</span>
                      )}
                    </div>
                    <div className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                      {charPreview ? (
                        <img src={charPreview} alt="Model Char" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-bold">Model Char (Karakter)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtitle Caption */}
                <div className="z-10 rounded-xl bg-black/75 px-3 py-2 text-center backdrop-blur-md border border-white/10">
                  <p className="text-[10px] font-bold text-white line-clamp-2 leading-relaxed">
                    &ldquo;{scriptText || "Suara narasi VO akan otomatis disematkan dan diputar di sini..."}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Download & Audio Test Buttons */}
          {generatedVideoUrl && (
            <div className="flex flex-col gap-2 w-full max-w-[340px]">
              <a
                href={generatedVideoUrl}
                download="ugc_affiliate_video_1080x1920.mp4"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download Video MP4 1080x1920</span>
              </a>

              {generatedAudioUrl && (
                <a
                  href={generatedAudioUrl}
                  download="voiceover.mp3"
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Download File Audio VO (MP3)</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
