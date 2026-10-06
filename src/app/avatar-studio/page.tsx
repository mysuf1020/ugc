"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  UserCheck,
  ShoppingBag,
  Sparkles,
  Play,
  Download,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Film,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function AvatarStudioPage() {
  const [projectId, setProjectId] = useState<string | null>(null);

  // Uploaded Assets
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingProduct, setUploadingProduct] = useState(false);

  // Product & Script Info
  const [brandName, setBrandName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [hookHeadline, setHookHeadline] = useState("RAHASIA PRODUK INI! 🔥");
  const [layoutStyle, setLayoutStyle] = useState<"SPLIT_SCREEN" | "PIP_BUBBLE">("SPLIT_SCREEN");
  const [generatingScript, setGeneratingScript] = useState(false);

  // Video Generation & Result
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ensure project is created
  async function ensureProject(): Promise<string> {
    if (projectId) return projectId;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: brandName ? `UGC Avatar - ${brandName}` : "UGC Avatar Project",
        brandName: brandName || "Brand Kami",
        productDescription: productDescription || "Produk terbaik untuk Anda",
      }),
    });
    const data = await res.json();
    setProjectId(data.project.id);
    return data.project.id;
  }

  // Handle Avatar Image Upload
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
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
        setAvatarPreview(data.url);
      } else {
        setErrorMsg("Gagal mengupload foto wajah.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setUploadingAvatar(false);
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
        setErrorMsg("Gagal mengupload foto produk.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setUploadingProduct(false);
    }
  }

  // Generate Script using AI
  async function handleGenerateScript() {
    if (!brandName || !productDescription) {
      setErrorMsg("Harap masukkan nama brand dan deskripsi produk terlebih dahulu.");
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
        setHookHeadline(s.hookText.slice(0, 35) + "!");
      }
    } catch {
      setErrorMsg("Gagal menghasilkan naskah AI.");
    } finally {
      setGeneratingScript(false);
    }
  }

  // Trigger Video Generation
  async function handleCreateVideo() {
    if (!avatarPreview || !productPreview) {
      setErrorMsg("Harap upload foto wajah dan foto produk brand terlebih dahulu.");
      return;
    }
    if (!scriptText.trim()) {
      setErrorMsg("Harap isi naskah yang akan diucapkan oleh avatar.");
      return;
    }

    setGeneratingVideo(true);
    setErrorMsg(null);
    setProgressText("Menggerakkan foto wajah & menyinkronkan suara...");

    try {
      const pId = await ensureProject();
      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: pId,
          scriptText,
          hookHeadline,
          layoutStyle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedVideoUrl(data.finalVideoUrl || data.talkingVideoUrl);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Gagal membuat video avatar.");
      }
    } catch {
      setErrorMsg("Terjadi gangguan jaringan saat memproses video.");
    } finally {
      setGeneratingVideo(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Talking Avatar & Brand Explainer</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          AI Talking Avatar UGC Creator
        </h1>
        <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
          Cukup upload **foto wajah Anda** dan **foto produk brand**, lalu AI akan menganimasikan wajah Anda berbicara menjelaskan keunggulan produk tersebut dalam format video vertikal (9:16).
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form & Asset Uploader (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Upload Assets */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">1</span>
              <span>Upload Foto Wajah & Produk Brand</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Box 1: Face Avatar Photo */}
              <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 p-4 text-center flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden group">
                {avatarPreview ? (
                  <div className="relative h-40 w-full rounded-lg overflow-hidden">
                    <img
                      src={avatarPreview}
                      alt="Wajah Anda"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] font-semibold text-white bg-black/70 px-2 py-1 rounded">
                        Ganti Foto Wajah
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-zinc-200">Foto Wajah Anda</span>
                    <span className="text-[11px] text-zinc-500 mt-1">
                      Foto selfie / close-up wajah yang jelas
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-indigo-400 gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mengupload...</span>
                  </div>
                )}
              </div>

              {/* Box 2: Brand / Product Photo */}
              <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 p-4 text-center flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden group">
                {productPreview ? (
                  <div className="relative h-40 w-full rounded-lg overflow-hidden">
                    <img
                      src={productPreview}
                      alt="Produk Brand"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] font-semibold text-white bg-black/70 px-2 py-1 rounded">
                        Ganti Foto Produk
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-zinc-200">Foto Produk Brand</span>
                    <span className="text-[11px] text-zinc-500 mt-1">
                      Gambar kemasan, botol, atau barang produk
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
              <span>Informasi Produk & Naskah Penjelasan</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nama Brand / Produk
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BrightBoost Serum"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Headline Hook Video (Banner Atas)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: RAHASIA KULIT GLOWING 7 HARI! 🔥"
                  value={hookHeadline}
                  onChange={(e) => setHookHeadline(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-300">
                  Keunggulan / USP Produk Singkat
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
                placeholder="Contoh: Mencerahkan noda hitam dalam 7 hari dengan Niacinamide & Ceramide"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Naskah yang Akan Diucapkan Avatar Wajah Anda
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan kata-kata penjelasan produk yang akan dibacakan avatar Anda, atau klik 'Buatkan Naskah Otomatis' di atas..."
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Step 3: Layout UGC (9:16) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">3</span>
              <span>Pilihan Tata Letak Video (Format Vertikal 9:16)</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLayoutStyle("SPLIT_SCREEN")}
                className={`flex flex-col items-center rounded-xl border p-4 text-center transition-all ${
                  layoutStyle === "SPLIT_SCREEN"
                    ? "border-indigo-500 bg-indigo-500/15 text-white shadow-md shadow-indigo-500/15"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="h-16 w-10 border border-zinc-600 rounded flex flex-col overflow-hidden mb-2">
                  <div className="h-1/2 bg-emerald-500/30 border-b border-zinc-700 flex items-center justify-center text-[8px] font-bold">Produk</div>
                  <div className="h-1/2 bg-indigo-500/30 flex items-center justify-center text-[8px] font-bold">Avatar</div>
                </div>
                <span className="text-xs font-bold">Split Screen (Atas-Bawah)</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">Produk di atas, wajah di bawah</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutStyle("PIP_BUBBLE")}
                className={`flex flex-col items-center rounded-xl border p-4 text-center transition-all ${
                  layoutStyle === "PIP_BUBBLE"
                    ? "border-indigo-500 bg-indigo-500/15 text-white shadow-md shadow-indigo-500/15"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="h-16 w-10 border border-zinc-600 rounded relative overflow-hidden mb-2 bg-emerald-500/20">
                  <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-indigo-500/70 border border-white flex items-center justify-center text-[6px]">Avatar</div>
                </div>
                <span className="text-xs font-bold">Picture-in-Picture (PIP)</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">Layar penuh produk + Avatar bulat</span>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleCreateVideo}
            disabled={generatingVideo || !avatarPreview || !productPreview}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-emerald-400 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {generatingVideo ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{progressText}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Video Avatar Penjelas Produk (9:16)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live 9:16 Smartphone Preview (5 Cols) */}
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
                {/* Top Hook Banner Preview */}
                <div className="z-10 flex justify-center pt-2">
                  <div className="rounded-lg bg-yellow-400 px-3 py-1.5 text-center text-[10px] font-black uppercase text-black shadow-lg">
                    {hookHeadline}
                  </div>
                </div>

                {/* Preview Layout Mockup */}
                <div className="flex-1 flex flex-col justify-center items-center my-4 space-y-2">
                  {layoutStyle === "SPLIT_SCREEN" ? (
                    <div className="w-full h-full flex flex-col gap-1">
                      <div className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                        {productPreview ? (
                          <img src={productPreview} alt="Produk" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-bold">Foto Produk Brand</span>
                        )}
                      </div>
                      <div className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Wajah" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-bold">Wajah Anda Berbicara</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                      {productPreview ? (
                        <img src={productPreview} alt="Produk" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-bold">Foto Produk Full Screen</span>
                      )}
                      <div className="absolute bottom-3 right-3 h-20 w-20 rounded-full border-2 border-indigo-400 overflow-hidden bg-zinc-950 shadow-lg">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[8px] text-zinc-400">Avatar</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtitle Caption Mockup */}
                <div className="z-10 rounded-xl bg-black/75 px-3 py-2 text-center backdrop-blur-md border border-white/10">
                  <p className="text-[10px] font-bold text-white line-clamp-2 leading-relaxed">
                    &ldquo;{scriptText || "Naskah ucapan avatar Anda akan muncul sebagai subtitle di sini..."}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Download Button */}
          {generatedVideoUrl && (
            <a
              href={generatedVideoUrl}
              download="ugc_avatar_video_1080x1920.mp4"
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download Video MP4 Siap Posting</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
