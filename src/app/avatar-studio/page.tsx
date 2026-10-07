"use client";

import { useState } from "react";
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

  async function handleCreateVideo() {
    if (!charPreview || !productPreview) {
      toast.error("Harap upload Model Char (wajah) dan Model Barang (produk) terlebih dahulu.");
      return;
    }
    if (!scriptText.trim()) {
      toast.error("Harap isi naskah yang akan disuarakan oleh voiceover.");
      return;
    }

    setGeneratingVideo(true);
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-slate-700" />
          <span>Model Char + Model Barang ➔ Video & Suara VO</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          AI UGC Video & Voiceover Creator
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Unggah **Model Karakter (wajah)** dan **Model Barang (produk)**, sistem akan membuatkan video vertikal 9:16 lengkap dengan narasi suara review bahasa Indonesia dan teks hook.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Form & Asset Uploader (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Upload Assets */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">1</span>
              <span>Input Model Char & Model Barang</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Box 1: Model Char */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group hover:border-slate-400 hover:bg-slate-100/60 transition-colors">
                {charPreview ? (
                  <div className="relative h-44 w-full rounded-lg overflow-hidden">
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
                    <span className="text-xs font-bold text-slate-900">Model Char (Wajah / Orang)</span>
                    <span className="text-[11px] text-slate-500 mt-1">
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
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs text-slate-800 gap-1.5 font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                    <span>Mengupload...</span>
                  </div>
                )}
              </div>

              {/* Box 2: Model Barang */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group hover:border-slate-400 hover:bg-slate-100/60 transition-colors">
                {productPreview ? (
                  <div className="relative h-44 w-full rounded-lg overflow-hidden">
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
                    <span className="text-xs font-bold text-slate-900">Model Barang (Produk Brand)</span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Foto produk (skincare, botol, tas, dll)
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
                  <span>{generatingScript ? "Menulis Naskah..." : "Buatkan Naskah Otomatis (AI)"}</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="Contoh: Kulit cerah tampak sehat dalam 7 hari dengan 95% kemurnian vitamin C"
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
                rows={4}
                placeholder="Tuliskan naskah ulasan produk, atau klik 'Buatkan Naskah Otomatis' di atas..."
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleCreateVideo}
            disabled={generatingVideo || !charPreview || !productPreview}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-40"
          >
            {generatingVideo ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>{progressText}</span>
              </>
            ) : (
              <>
                <Film className="h-4 w-4" />
                <span>Generate Video UGC + Suara VO (9:16)</span>
              </>
            )}
          </button>

          {/* Nalarka Prompts Section */}
          {generatedPrompts && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Prompt Google Flow / Omni (Metode Nalarka)</span>
                </div>
                <span className="text-[11px] text-slate-500">4 Scene Prompts</span>
              </div>
              <p className="text-xs text-slate-600">
                Salin prompt berikut untuk digunakan langsung di Google Flow / Omni / Kling / Luma gratis:
              </p>

              <div className="space-y-3">
                {[
                  { label: "Scene 1: Hook Video", text: generatedPrompts.scene1, key: "s1" },
                  { label: "Scene 2: Close-up Produk", text: generatedPrompts.scene2, key: "s2" },
                  { label: "Scene 3: Reaksi & Experience", text: generatedPrompts.scene3, key: "s3" },
                  { label: "Scene 4: Call to Action", text: generatedPrompts.scene4, key: "s4" },
                ].map((item) => (
                  <div key={item.key} className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800">{item.label}</span>
                      <button
                        onClick={() => copyToClipboard(item.text, item.key)}
                        className="flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200 hover:bg-slate-100"
                      >
                        {copiedPrompt === item.key ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedPrompt === item.key ? "Tersalin!" : "Salin Prompt"}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-mono">{item.text}</p>
                  </div>
                ))}
              </div>
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
                  {/* Top Hook Preview */}
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

          {/* Download & Audio Test Buttons */}
          {generatedVideoUrl && (
            <div className="flex flex-col gap-2 w-full max-w-[340px]">
              <a
                href={generatedVideoUrl}
                download="ugc_affiliate_video_1080x1920.mp4"
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download Video MP4 1080x1920</span>
              </a>

              {generatedAudioUrl && (
                <a
                  href={generatedAudioUrl}
                  download="voiceover.mp3"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
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
