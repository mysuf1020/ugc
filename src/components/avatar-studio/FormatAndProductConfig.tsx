import { useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  Maximize2,
  Smartphone,
  Monitor,
  Square,
  Sparkles,
  Volume2,
  Loader2,
} from "lucide-react";

export type AspectRatioType = "9:16" | "16:9" | "1:1" | "4:5";

interface FormatAndProductConfigProps {
  targetDurationSec: number;
  setTargetDurationSec: (sec: number) => void;
  aspectRatio: AspectRatioType;
  setAspectRatio: (ar: AspectRatioType) => void;
  brandName: string;
  setBrandName: (v: string) => void;
  productUsp: string;
  setProductUsp: (v: string) => void;
  scriptText: string;
  setScriptText: (v: string) => void;
  voiceId: string;
  setVoiceId: (v: string) => void;
  generatingScript: boolean;
  onGenerateScript: () => void;
}

export function FormatAndProductConfig({
  targetDurationSec,
  setTargetDurationSec,
  aspectRatio,
  setAspectRatio,
  brandName,
  setBrandName,
  productUsp,
  setProductUsp,
  scriptText,
  setScriptText,
  voiceId,
  setVoiceId,
  generatingScript,
  onGenerateScript,
}: FormatAndProductConfigProps) {
  const [testingVoice, setTestingVoice] = useState(false);

  async function handleTestVoice() {
    setTestingVoice(true);
    try {
      const sampleText = voiceId.startsWith("en")
        ? "Hey there! Check out this amazing product, it really works wonders."
        : voiceId.startsWith("jv")
        ? "Halo sedherek, monggo dipirsani produk ingkang sae sanget menika."
        : voiceId.startsWith("su")
        ? "Sampurasun baraya, ieu produk sae pisan kanggo sadidinten."
        : "Halo! Produk ini beneran bagus banget dan wajib kalian coba sekarang juga.";

      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sampleText, voiceId }),
      });

      if (res.ok) {
        const data = await res.json();
        const audio = new Audio(data.audioUrl);
        audio.play();
        toast.success("Memutar sampel suara voiceover...");
      } else {
        toast.error("Gagal memuat sampel suara.");
      }
    } catch {
      toast.error("Gagal menguji suara.");
    } finally {
      setTestingVoice(false);
    }
  }
  const durationOptions = [
    { value: 5, label: "5 Detik", desc: "Hook Cepat" },
    { value: 10, label: "10 Detik", desc: "Micro Video" },
    { value: 15, label: "15 Detik", desc: "TikTok / Reels" },
    { value: 30, label: "30 Detik", desc: "Ulasan Lengkap" },
    { value: 60, label: "60 Detik", desc: "Deep Review" },
  ];

  const layoutOptions = [
    {
      value: "9:16" as AspectRatioType,
      label: "9:16 Vertikal",
      sub: "TikTok, Reels, Shorts",
      res: "1080x1920",
      icon: Smartphone,
    },
    {
      value: "16:9" as AspectRatioType,
      label: "16:9 Horizontal",
      sub: "YouTube, Web Video",
      res: "1920x1080",
      icon: Monitor,
    },
    {
      value: "1:1" as AspectRatioType,
      label: "1:1 Persegi",
      sub: "Instagram Feed Post",
      res: "1080x1080",
      icon: Square,
    },
    {
      value: "4:5" as AspectRatioType,
      label: "4:5 Potret",
      sub: "Instagram Feed Potret",
      res: "1080x1350",
      icon: Maximize2,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
          2
        </span>
        <span>Format Durasi, Ukuran Layout & Detail Produk</span>
      </h2>

      {/* A. DURATION SELECTOR */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-600" />
            <span>Jangka Waktu / Durasi Video</span>
          </label>
          <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
            {targetDurationSec} Detik
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {durationOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTargetDurationSec(opt.value)}
              className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center transition-all border ${
                targetDurationSec === opt.value
                  ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-xs font-bold">{opt.label}</span>
              <span
                className={`text-[10px] mt-0.5 ${
                  targetDurationSec === opt.value ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* B. ASPECT RATIO / LAYOUT SELECTOR */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-slate-600" />
            <span>Layout & Ukuran Resolusi Video</span>
          </label>
          <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
            {aspectRatio}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {layoutOptions.map((layout) => {
            const Icon = layout.icon;
            const isSelected = aspectRatio === layout.value;
            return (
              <button
                key={layout.value}
                type="button"
                onClick={() => setAspectRatio(layout.value)}
                className={`flex flex-col items-start rounded-xl p-3 text-left transition-all border ${
                  isSelected
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-2xs"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <Icon className={`h-4 w-4 ${isSelected ? "text-slate-900" : "text-slate-500"}`} />
                  <span className="text-[10px] font-mono text-slate-500">{layout.res}</span>
                </div>
                <span className={`text-xs font-bold ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                  {layout.label}
                </span>
                <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {layout.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* C. PRODUCT & VOICE INFO */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
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
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Pilihan Suara Voiceover (VO)
            </label>
            <button
              type="button"
              onClick={handleTestVoice}
              disabled={testingVoice}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-40"
            >
              {testingVoice ? (
                <Loader2 className="h-3 w-3 animate-spin text-slate-700" />
              ) : (
                <Volume2 className="h-3 w-3 text-emerald-600" />
              )}
              <span>Tes Suara</span>
            </button>
          </div>
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none"
          >
            <optgroup label="🇮🇩 Bahasa Indonesia (Utama)">
              <option value="id-ID-ArdiNeural">Ardi (Pria Indonesia - Berwibawa & Natural)</option>
              <option value="id-ID-GadisNeural">Gadis (Wanita Indonesia - Ramah & Ceria)</option>
            </optgroup>

            <optgroup label="🌐 Multilingual Creator (Bisa Indonesia & English)">
              <option value="en-US-AndrewMultilingualNeural">Andrew (Pria - Modern Influencer)</option>
              <option value="en-US-AvaMultilingualNeural">Ava (Wanita - Sweet & Expressive)</option>
              <option value="en-US-BrianMultilingualNeural">Brian (Pria - Commercial & Dynamic)</option>
              <option value="en-US-EmmaMultilingualNeural">Emma (Wanita - Friendly Narrator)</option>
            </optgroup>

            <optgroup label="📍 Bahasa Daerah / Etnik Nusantara">
              <option value="jv-ID-DimasNeural">Dimas (Pria Jawa - Aksen Mantap)</option>
              <option value="jv-ID-SitiNeural">Siti (Wanita Jawa - Halus & Santun)</option>
              <option value="su-ID-JajangNeural">Jajang (Pria Sunda - Ramah & Akrab)</option>
              <option value="su-ID-TutiNeural">Tuti (Wanita Sunda - Hangat & Ceria)</option>
            </optgroup>

            <optgroup label="🇺🇸 English (US Creator)">
              <option value="en-US-JennyNeural">Jenny (Wanita US - Energetic TikTok UGC)</option>
              <option value="en-US-GuyNeural">Guy (Pria US - Casual Reviewer)</option>
              <option value="en-US-AriaNeural">Aria (Wanita US - Professional Storyteller)</option>
              <option value="en-US-ChristopherNeural">Christopher (Pria US - Deep & Confident)</option>
              <option value="en-US-EricNeural">Eric (Pria US - Energetic Young)</option>
              <option value="en-US-MichelleNeural">Michelle (Wanita US - Warm & Caring)</option>
            </optgroup>

            <optgroup label="🇬🇧 🇦🇺 🇸🇬 English (Aksen Global)">
              <option value="en-GB-RyanNeural">Ryan (Pria UK - British Accent)</option>
              <option value="en-GB-SoniaNeural">Sonia (Wanita UK - British Elegance)</option>
              <option value="en-AU-NatashaNeural">Natasha (Wanita Australia - Aussie Casual)</option>
              <option value="en-SG-LunaNeural">Luna (Wanita Singapore - Southeast Asian)</option>
            </optgroup>
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
            onClick={onGenerateScript}
            disabled={generatingScript || !brandName}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{generatingScript ? "Menulis..." : `Buatkan Naskah Otomatis (${targetDurationSec}s)`}</span>
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
  );
}
