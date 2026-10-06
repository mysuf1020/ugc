"use client";

import { useState } from "react";
import {
  Volume2,
  Play,
  Pause,
  Download,
  Loader2,
  Sparkles,
  CheckCircle2,
  Music,
} from "lucide-react";

export default function VoiceLabPage() {
  const [selectedVoice, setSelectedVoice] = useState("id-ID-ArdiNeural");
  const [sampleText, setSampleText] = useState(
    "Halo semuanya! Jangan pernah beli produk ini sebelum kalian tahu rahasia ini. Hasilnya bener-bener nyata dan bikin glowing dalam 7 hari!"
  );
  const [synthesizing, setSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const voiceOptions = [
    {
      id: "id-ID-ArdiNeural",
      name: "Ardi Neural",
      lang: "Bahasa Indonesia",
      gender: "Pria",
      tag: "Natural & Berwibawa",
      description: "Sangat cocok untuk review produk maskulin, gadget, atau rekomendasi teknis.",
    },
    {
      id: "id-ID-GadisNeural",
      name: "Gadis Neural",
      lang: "Bahasa Indonesia",
      gender: "Wanita",
      tag: "Ceria & Friendly",
      description: "Pilihan utama untuk konten kecantikan, skincare, fashion, dan review makanan.",
    },
    {
      id: "en-US-ChristopherNeural",
      name: "Christopher Neural",
      lang: "English (US)",
      gender: "Male",
      tag: "Casual & Confident",
      description: "Great for international global affiliate videos and energetic TikTok hooks.",
    },
    {
      id: "en-US-JennyNeural",
      name: "Jenny Neural",
      lang: "English (US)",
      gender: "Female",
      tag: "Warm & Engaging",
      description: "Optimized for lifestyle storytelling and high-converting product ads.",
    },
  ];

  async function handleSynthesize() {
    if (!sampleText.trim()) return;

    setSynthesizing(true);
    setAudioUrl(null);
    try {
      // Create test synthesis via EdgeTTS API route
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sampleText,
          voiceId: selectedVoice,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAudioUrl(data.audioUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSynthesizing(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-2">
          <Volume2 className="h-3.5 w-3.5" />
          <span>Speech Synthesis Studio</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Voice & Audio Lab
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Uji coba suara narator AI sebelum dipasang ke video UGC Anda. 100% gratis tanpa kuota API.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Voice Selection (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Pilih Model Suara
          </label>
          {voiceOptions.map((v) => {
            const isSelected = selectedVoice === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVoice(v.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/15 text-white shadow-md shadow-emerald-500/10"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{v.name}</span>
                  <span className="text-[10px] rounded bg-zinc-800 px-2 py-0.5 text-zinc-300 font-medium">
                    {v.gender}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mb-1">
                  {v.tag}
                </div>
                <p className="text-xs text-zinc-500 leading-snug">{v.description}</p>
              </button>
            );
          })}
        </div>

        {/* Right: Synthesis Workspace & Player (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Input Naskah Suara
              </span>
              <span className="text-[11px] text-zinc-500">
                {sampleText.length} Karakter
              </span>
            </div>

            <textarea
              rows={5}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Ketik kalimat yang ingin diucapkan..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none leading-relaxed"
            />

            <button
              type="button"
              onClick={handleSynthesize}
              disabled={synthesizing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {synthesizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mensintesis Audio...</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span>Generate Suara Voiceover</span>
                </>
              )}
            </button>
          </div>

          {/* Audio Player Card */}
          {audioUrl && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Audio Berhasil Disintesis!</span>
                </div>
                <a
                  href={audioUrl}
                  download="voice_sample.mp3"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-400 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  <span>Download MP3</span>
                </a>
              </div>
              <audio src={audioUrl} controls className="w-full mt-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
