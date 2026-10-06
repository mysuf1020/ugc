"use client";

import { useState } from "react";
import {
  Volume2,
  Download,
  Loader2,
  CheckCircle2,
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
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200 mb-2">
          <Volume2 className="h-3.5 w-3.5 text-slate-700" />
          <span>Speech Synthesis Studio</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Voice & Audio Lab
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Uji coba suara narator AI sebelum dipasang ke video UGC Anda. 100% gratis tanpa kuota API.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Voice Selection (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
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
                    ? "border-slate-900 bg-white shadow-sm ring-1 ring-slate-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">{v.name}</span>
                  <span className="text-[10px] rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 font-medium border border-slate-200">
                    {v.gender}
                  </span>
                </div>
                <div className="text-[11px] text-slate-700 font-semibold mb-1">
                  {v.tag}
                </div>
                <p className="text-xs text-slate-500 leading-snug">{v.description}</p>
              </button>
            );
          })}
        </div>

        {/* Right: Synthesis Workspace & Player (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Input Naskah Suara
              </span>
              <span className="text-[11px] text-slate-500">
                {sampleText.length} Karakter
              </span>
            </div>

            <textarea
              rows={5}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Ketik kalimat yang ingin diucapkan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none leading-relaxed"
            />

            <button
              type="button"
              onClick={handleSynthesize}
              disabled={synthesizing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {synthesizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Audio Berhasil Disintesis!</span>
                </div>
                <a
                  href={audioUrl}
                  download="voice_sample.mp3"
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-800 transition-colors"
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
