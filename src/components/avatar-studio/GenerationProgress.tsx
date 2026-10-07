"use client";

import { Loader2, Check, Sparkles } from "lucide-react";

interface GenerationProgressProps {
  elapsedSeconds: number;
  targetDurationSec: number;
  aspectRatio: string;
}

export function GenerationProgress({
  elapsedSeconds,
  targetDurationSec,
  aspectRatio,
}: GenerationProgressProps) {
  const stages = [
    {
      title: "1. Analisis Model & Penyiapan Naskah",
      subtitle: "Menyesuaikan durasi naskah dengan tempo bicara",
    },
    {
      title: "2. Sintesis Suara Voiceover (VO)",
      subtitle: "Membuat narasi suara natural bahasa Indonesia",
    },
    {
      title: "3. Rendering AI Video Scene Karakter",
      subtitle: "Karakter memegang & mengulas produk (±1-2 menit)",
    },
    {
      title: "4. Finalisasi Layout & Durasi Video",
      subtitle: `Mengompilasi video ${aspectRatio} durasi ${targetDurationSec}s`,
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      {/* Header with Live Status & Timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-900"></span>
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Merender Video UGC {aspectRatio} ({targetDurationSec} Detik)...
            </h3>
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
                <span
                  className={`text-xs font-bold block ${
                    isCurrent ? "text-slate-900" : isDone ? "text-slate-800" : "text-slate-400"
                  }`}
                >
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
          Video AI sedang dibuat sesuai durasi ({targetDurationSec}s) dan layout ({aspectRatio}). Video akan langsung diputar otomatis begitu selesai.
        </span>
      </div>
    </div>
  );
}
